import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://raphalumina.com",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { items, email, currency = "ZAR", shippingAddress, shippingCost = 0 } = await req.json()

    if (!items?.length) throw new Error("Cart empty")
    if (!email) throw new Error("Email required")

    // Calculate totals
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * 100 * item.quantity), 0)
    const shippingTotal = Math.round(shippingCost * 100)
    const grandTotal = itemsTotal + shippingTotal

    const orderId = crypto.randomUUID()
    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY")

    console.log("Paystack Key exists:", !!paystackKey)
    console.log("Amount:", grandTotal)

    // Call Paystack FIRST (before creating order)
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: grandTotal,
        currency,
        reference: orderId,
        callback_url: `https://raphalumina.com/payment/callback?order_id=${orderId}`,
      }),
    })

    const paystackJson = await paystackRes.json()
    console.log("Paystack status:", paystackRes.status)
    console.log("Paystack response:", JSON.stringify(paystackJson))

    if (!paystackRes.ok || !paystackJson.data?.authorization_url) {
      throw new Error(`Paystack failed: ${JSON.stringify(paystackJson)}`)
    }

    // NOW create order in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
      },
      body: JSON.stringify({
        items,
        total_amount: grandTotal / 100,
        currency,
        customer_email: email,
        shipping_address: shippingAddress,
        shipping_cost: shippingCost,
        status: "pending",
      }),
    })

    console.log("Supabase status:", supabaseRes.status)

    if (!supabaseRes.ok) {
      const err = await supabaseRes.text()
      console.error("Supabase error:", err)
    }

    return new Response(
      JSON.stringify({
        code: "SUCCESS",
        data: { authorization_url: paystackJson.data.authorization_url },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ code: "FAIL", message: error instanceof Error ? error.message : "Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    )
  }
})
