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

async function verifyPaystackTransaction(reference: string) {
  const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!paystackSecretKey) {
    throw new Error("PAYSTACK_SECRET_KEY not configured");
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${paystackSecretKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Paystack verification error: ${error.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data;
}

async function updateOrderStatus(reference: string, transactionData: any) {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, customer_email, total_amount, items, shipping_address, customer_name, shipping_cost, paystack_reference")
    .or(`id.eq.${reference},paystack_reference.eq.${reference}`)
    .maybeSingle();

  if (fetchError || !order) {
    console.error("Failed to fetch order:", fetchError);
    return { success: false, order: null };
  }

  const alreadyFinalized = ["completed", "processing", "shipped", "delivered"].includes(order.status);

  if (!alreadyFinalized) {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        payment_method: transactionData.channel,
        paystack_reference: order.paystack_reference ?? transactionData.reference ?? reference,
      })
      .eq("id", order.id)
      .eq("status", order.status);

    if (error) {
      console.error("Failed to update order:", error);
      return { success: false, order };
    }

    try {
      const stockUpdates = (order.items as any[]).map(async (item) => {
        if (item.product_id) {
          await supabase.rpc("decrement_stock", {
            product_id: item.product_id,
            quantity: item.quantity,
          });
        }
      });
      await Promise.all(stockUpdates);
    } catch (stockError) {
      console.error("Failed to update stock:", stockError);
    }

    try {
      const emailResponse = await supabase.functions.invoke("send_email", {
        body: {
          type: "order_confirmation",
          to: order.customer_email,
          data: {
            customerName: order.shipping_address?.name || order.customer_name || "Customer",
            orderId: order.id.slice(0, 8),
            orderDate: new Date().toLocaleDateString("en-ZA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            items: order.items,
            totalAmount: order.total_amount,
            shippingCost: order.shipping_cost ?? 0,
            shippingAddress: order.shipping_address,
          },
        },
      });
      if (emailResponse.error) {
        console.error("Email send error:", emailResponse.error);
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
    }
  }

  const { data: refreshedOrder } = await supabase
    .from("orders")
    .select("id, status, customer_email, total_amount, items, shipping_address, customer_name, shipping_cost")
    .eq("id", order.id)
    .single();

  return {
    success: true,
    order: refreshedOrder ?? order,
  };
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    const body = await req.json();
    
    const { reference } = body;
    if (!reference) {
      throw new Error("Missing reference parameter");
    }
    
    const transactionData = await verifyPaystackTransaction(reference);

    if (transactionData.status !== "success") {
      return ok({
        verified: false,
        status: transactionData.status,
        reference: transactionData.reference,
      });
    }
    
    const orderResult = await updateOrderStatus(reference, transactionData);

    const result = {
      verified: true,
      status: "success",
      reference: transactionData.reference,
      amount: transactionData.amount / 100,
      currency: transactionData.currency,
      customerEmail: transactionData.customer.email,
      paidAt: transactionData.paid_at,
      orderUpdated: orderResult.success,
      order: orderResult.order
        ? {
            id: orderResult.order.id,
            status: orderResult.order.status,
            customerEmail: orderResult.order.customer_email,
            customerName: orderResult.order.shipping_address?.name || orderResult.order.customer_name || null,
            totalAmount: orderResult.order.total_amount,
            shippingCost: Number(orderResult.order.shipping_cost ?? 0),
            items: orderResult.order.items,
            shippingAddress: orderResult.order.shipping_address,
          }
        : null,
    };
    
    return ok(result);
  } catch (error) {
    console.error("Payment verification failed:", error);
    return fail(error instanceof Error ? error.message : "Payment verification failed", 500);
  }
});
