import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  product_id: string;
  size?: string;
}

interface CheckoutRequest {
  items: OrderItem[];
  email: string;
  currency?: string;
  shippingAddress?: any;
  shippingCost?: number;
}

function ok(data: unknown): Response {
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
  if (!request.email) {
    throw new Error("Email is required");
  }
  for (const item of request.items) {
    if (!item.name || item.price <= 0 || item.quantity <= 0) {
      throw new Error("Invalid item information");
    }
  }
}

function processOrderItems(items: OrderItem[]) {
  // For database — keep Rand prices
  const dbItems = items.map(item => ({
    name: item.name.trim(),
    price: item.price,  // Rands as received
    quantity: item.quantity,
    image_url: item.image_url?.trim() || "",
    product_id: item.product_id,
    size: item.size || "",
  }));
  
  // For Paystack — convert to cents
  const paystackItems = items.map(item => ({
    name: item.name.trim(),
    price: Math.round(item.price * 100),  // Convert to cents
    quantity: item.quantity,
    image_url: item.image_url?.trim() || "",
    product_id: item.product_id,
    size: item.size || "",
  }));
  
  const totalAmount = paystackItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  return { dbItems, paystackItems, totalAmount };
}

async function createPaystackTransaction(
  email: string,
  amount: number,
  currency: string,
  orderId: string,
  callbackUrl: string
) {
  const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!paystackSecretKey) {
    throw new Error("PAYSTACK_SECRET_KEY not configured");
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      currency,
      reference: orderId,
      callback_url: callbackUrl,
      metadata: {
        order_id: orderId,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Paystack API error: ${error.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data;
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    
    const request = await req.json();
    
    validateCheckoutRequest(request);

    const authHeader = req.headers.get("Authorization");
    
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };

    const { dbItems, paystackItems, totalAmount } = processOrderItems(request.items);
    
    // Add shipping cost (convert to cents)
    const shippingCostInCents = Math.round((request.shippingCost || 0) * 100);
    const grandTotalAmount = totalAmount + shippingCostInCents;

    const origin = req.headers.get("origin") 
      || Deno.env.get("SITE_URL") 
      || "https://raphalumina.com";
    const callbackUrl = `${origin}/payment/callback?order_id=${crypto.randomUUID()}`;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        items: dbItems,  // Store Rand prices
        total_amount: grandTotalAmount / 100,
        currency: (request.currency || 'ZAR').toUpperCase(),
        status: "pending",
        customer_email: request.email,
        customer_name: request.shippingAddress?.name || null,
        shipping_address: request.shippingAddress || null,
        shipping_cost: (request.shippingCost || 0),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    const paystackData = await createPaystackTransaction(
      request.email,
      grandTotalAmount,
      request.currency || 'ZAR',
      order.id,
      callbackUrl
    ).catch(async (err) => {
      // Clean up orphan order if Paystack fails
      await supabase.from("orders").delete().eq("id", order.id);
      throw err;
    });

    await supabase
      .from("orders")
      .update({
        paystack_reference: paystackData.reference,
        paystack_access_code: paystackData.access_code,
      })
      .eq("id", order.id);

    return ok({
      authorization_url: paystackData.authorization_url,
      access_code: paystackData.access_code,
      reference: paystackData.reference,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return fail(error instanceof Error ? error.message : "Payment processing failed", 500);
  }
});
