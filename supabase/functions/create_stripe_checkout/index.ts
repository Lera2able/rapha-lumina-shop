import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@19.1.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl!, supabaseKey!);

const successUrlPath = '/payment-success?session_id={CHECKOUT_SESSION_ID}';
const cancelUrlPath = '/cart';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  price: number;
  cost_price_snapshot?: number | null;
  quantity: number;
  image_url?: string;
  product_id?: string;
  size?: string;
}

interface CheckoutRequest {
  items: OrderItem[];
  currency?: string;
  payment_method_types?: string[];
  shipping_address?: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

function ok(data: any): Response {
  return new Response(
    JSON.stringify({ code: "SUCCESS", message: "Success", data }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

function fail(msg: string, code = 400): Response {
  return new Response(
    JSON.stringify({ code: "FAIL", message: msg }),
    {
      status: code,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

function validateCheckoutRequest(request: CheckoutRequest): void {
  if (!request.items?.length) {
    throw new Error("Cart items cannot be empty");
  }
  for (const item of request.items) {
    if (!item.name || item.price <= 0 || item.quantity <= 0) {
      throw new Error("Invalid product information");
    }
  }
}

function processOrderItems(items: OrderItem[]) {
  const formattedItems = items.map(item => ({
    name: item.name.trim(),
    price: Math.round(item.price * 100),
    cost_price_snapshot: item.cost_price_snapshot ?? null,
    quantity: item.quantity,
    image_url: item.image_url?.trim() || "",
    product_id: item.product_id || "",
    size: item.size || "",
  }));
  const totalAmount = formattedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return { formattedItems, totalAmount };
}

async function createCheckoutSession(
  stripe: Stripe,
  userId: string | null,
  items: OrderItem[],
  currency: string,
  paymentMethods: string[],
  origin: string,
  shippingAddress?: any
) {
  const { formattedItems, totalAmount } = processOrderItems(items);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      items: formattedItems,
      total_amount: totalAmount / 100,
      currency: currency.toLowerCase(),
      status: "pending",
      shipping_address: shippingAddress || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create order: ${error.message}`);

  const session = await stripe.checkout.sessions.create({
    line_items: items.map(item => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: `${origin}${successUrlPath}`,
    cancel_url: `${origin}${cancelUrlPath}`,
    payment_method_types: paymentMethods,
    metadata: {
      order_id: order.id,
      user_id: userId || "",
    },
  });

  await supabase
    .from("orders")
    .update({
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq("id", order.id);

  return { order, session };
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const request = await req.json();
    validateCheckoutRequest(request);

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "";
    const { order, session } = await createCheckoutSession(
      stripe,
      user?.id || null,
      request.items,
      request.currency || 'zar',
      request.payment_method_types || ['card'],
      origin,
      request.shipping_address
    );

    return ok({
      url: session.url,
      sessionId: session.id,
      orderId: order.id,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Payment processing failed", 500);
  }
});
