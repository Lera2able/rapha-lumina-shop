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
  cost_price_snapshot?: number | null;
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
        ...corsHeaders,
      },
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
        ...corsHeaders,
      },
    }
  );
}

function validateCheckoutRequest(request: CheckoutRequest): void {
  console.log("[VALIDATE] Checking request...");
  console.log("[VALIDATE] Request type:", typeof request);
  console.log("[VALIDATE] Request keys:", Object.keys(request));
  console.log("[VALIDATE] Email value:", request.email);
  console.log("[VALIDATE] Email type:", typeof request.email);
  
  if (!request.items?.length) {
    throw new Error("Cart items cannot be empty");
  }
  if (!request.email?.trim()) {
    console.log("[VALIDATE] Email validation FAILED");
    throw new Error("Email is required");
  }
  console.log("[VALIDATE] All checks passed");
  for (const item of request.items) {
    if (!item.name || item.price <= 0 || item.quantity <= 0) {
      throw new Error("Invalid item information");
    }
  }
}

function processOrderItems(items: OrderItem[]) {
  const dbItems = items.map(item => ({
    name: item.name.trim(),
    price: item.price,
    cost_price_snapshot: item.cost_price_snapshot ?? null,
    quantity: item.quantity,
    image_url: item.image_url?.trim() || "",
    product_id: item.product_id,
    size: item.size || "",
  }));

  const paystackItems = items.map(item => ({
    name: item.name.trim(),
    price: Math.round(item.price * 100),
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
    throw new Error("PAYSTACK_SECRET_KEY not configured in Supabase secrets");
  }

  // Clean and validate the key
  const cleanKey = paystackSecretKey.trim();
  if (!cleanKey.startsWith("sk_")) {
    throw new Error("Invalid Paystack secret key format");
  }

  console.log("[PAYSTACK] Initializing transaction for:", email);
  console.log("[PAYSTACK] Amount:", amount, "cents");

  // Use a Headers object to avoid ByteString issues
  const headers = new Headers({
    Authorization: `Bearer ${cleanKey}`,
    "Content-Type": "application/json",
  });

  const body = JSON.stringify({
    email,
    amount,
    currency,
    reference: orderId,
    callback_url: callbackUrl,
    metadata: { order_id: orderId },
  });

  console.log("[PAYSTACK] Sending request...");

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: headers,
    body: body,
  });

  console.log("[PAYSTACK] Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[PAYSTACK] Error response:", errorText);
    throw new Error(`Paystack API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log("[PAYSTACK] Success! Auth URL:", !!data.data?.authorization_url);

  if (!data.status || !data.data?.authorization_url) {
    throw new Error("Invalid Paystack response - missing authorization URL");
  }

  return data.data.authorization_url;
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const rawBody = await req.text();
    console.log("[CHECKOUT] Received request, body length:", rawBody.length);

    const request: CheckoutRequest = JSON.parse(rawBody);
    console.log("[CHECKOUT] Parsed email:", request.email);

    validateCheckoutRequest(request);

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };

    const { dbItems, paystackItems, totalAmount } = processOrderItems(request.items);

    const shippingCostInCents = Math.round((request.shippingCost || 0) * 100);
    const grandTotalAmount = totalAmount + shippingCostInCents;

    const origin = req.headers.get("origin") ||
      Deno.env.get("SITE_URL") ||
      "https://raphalumina.com";
    const orderId = crypto.randomUUID();
    const callbackUrl = `${origin}/payment/callback?order_id=${orderId}`;

    console.log("[CHECKOUT] Creating order in database...");

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        items: dbItems,
        total_amount: grandTotalAmount / 100,
        currency: (request.currency || "ZAR").toUpperCase(),
        customer_email: request.email,
        shipping_address: request.shippingAddress,
        shipping_cost: (request.shippingCost || 0),
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("[CHECKOUT] Database error:", error);
      throw error;
    }

    console.log("[CHECKOUT] Order created:", order?.id);

    // Initialize Paystack transaction
    const authUrl = await createPaystackTransaction(
      request.email,
      grandTotalAmount,
      request.currency || "ZAR",
      orderId,
      callbackUrl
    );

    console.log("[CHECKOUT] Success! Returning auth URL");

    return ok({ authorization_url: authUrl });
  } catch (error) {
    console.error("[ERROR]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(message, 500);
  }
});
