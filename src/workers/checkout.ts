/**
 * Cloudflare Worker - Paystack Checkout Handler
 */

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
  shippingAddress?: Record<string, unknown>;
  shippingCost?: number;
}

interface Env {
  PAYSTACK_SECRET_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function ok(data: unknown): Response {
  return new Response(JSON.stringify({ code: "SUCCESS", message: "Success", data }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function fail(msg: string, code = 400): Response {
  return new Response(JSON.stringify({ code: "FAIL", message: msg }), {
    status: code,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function validateCheckoutRequest(request: CheckoutRequest): void {
  if (!request.items?.length) throw new Error("Cart items cannot be empty");
  if (!request.email?.trim()) throw new Error("Email is required");
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
    quantity: item.quantity,
    image_url: item.image_url?.trim() || "",
    product_id: item.product_id,
    size: item.size || "",
  }));

  const paystackItems = items.map(item => ({
    name: item.name.trim(),
    price: Math.round(item.price * 100),
    quantity: item.quantity,
  }));

  const totalAmount = paystackItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { dbItems, paystackItems, totalAmount };
}

async function createSupabaseOrder(
  env: Env,
  orderData: Record<string, unknown>
) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Prefer: "return=representation",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error: ${response.status} ${error}`);
  }

  const orders = await response.json();
  return orders[0];
}

async function initializePaystackTransaction(
  env: Env,
  params: {
    email: string;
    amount: number;
    currency: string;
    orderId: string;
    callbackUrl: string;
  }
) {
  const { email, amount, currency, orderId, callbackUrl } = params;
  const paystackSecretKey = env.PAYSTACK_SECRET_KEY?.trim();

  if (!paystackSecretKey?.startsWith("sk_")) {
    throw new Error("Invalid Paystack secret key");
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      currency,
      reference: orderId,
      callback_url: callbackUrl,
      metadata: { order_id: orderId },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Paystack error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    status: boolean;
    data?: { authorization_url: string };
  };

  if (!data.status || !data.data?.authorization_url) {
    throw new Error("Invalid Paystack response");
  }

  return data.data.authorization_url;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      const rawBody = await request.text();
      const checkoutRequest: CheckoutRequest = JSON.parse(rawBody);

      validateCheckoutRequest(checkoutRequest);

      const { dbItems, totalAmount } = processOrderItems(checkoutRequest.items);
      const shippingCostInCents = Math.round((checkoutRequest.shippingCost || 0) * 100);
      const grandTotalAmount = totalAmount + shippingCostInCents;

      const orderId = crypto.randomUUID();
      const callbackUrl = `https://raphalumina.com/payment/callback?order_id=${orderId}`;

      // Create order in Supabase
      const order = await createSupabaseOrder(env, {
        items: dbItems,
        total_amount: grandTotalAmount / 100,
        currency: (checkoutRequest.currency || "ZAR").toUpperCase(),
        customer_email: checkoutRequest.email,
        shipping_address: checkoutRequest.shippingAddress,
        shipping_cost: checkoutRequest.shippingCost || 0,
        status: "pending",
      });

      // Initialize Paystack transaction
      const authUrl = await initializePaystackTransaction(env, {
        email: checkoutRequest.email,
        amount: grandTotalAmount,
        currency: checkoutRequest.currency || "ZAR",
        orderId,
        callbackUrl,
      });

      return ok({ authorization_url: authUrl });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return fail(message, 500);
    }
  },
};
