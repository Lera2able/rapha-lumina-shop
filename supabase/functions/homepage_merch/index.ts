import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const [productsRes, ordersRes] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('items')
        .in('status', ['processing', 'shipped', 'delivered', 'completed']),
    ])

    if (productsRes.error) throw productsRes.error
    if (ordersRes.error) throw ordersRes.error

    const soldUnits = new Map<string, number>()

    for (const order of ordersRes.data ?? []) {
      const items = (order as { items?: Array<Record<string, unknown>> }).items
      if (!Array.isArray(items)) continue

      for (const item of items) {
        const productId = String(item.product_id ?? '')
        if (!productId) continue
        soldUnits.set(productId, (soldUnits.get(productId) ?? 0) + Number(item.quantity ?? 0))
      }
    }

    const rankedIds = [...soldUnits.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([productId]) => productId)

    const products = (productsRes.data ?? []).map((product) => {
      const units = soldUnits.get(String((product as { id: string }).id)) ?? 0
      const rankIndex = rankedIds.indexOf(String((product as { id: string }).id))

      return {
        ...product,
        sold_units: units,
        bestseller_rank: rankIndex >= 0 ? rankIndex + 1 : null,
      }
    })

    products.sort((a, b) => {
      const soldDiff = Number(b.sold_units ?? 0) - Number(a.sold_units ?? 0)
      if (soldDiff !== 0) return soldDiff
      if (Boolean(b.featured) !== Boolean(a.featured)) return Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      return new Date(String(b.created_at ?? 0)).getTime() - new Date(String(a.created_at ?? 0)).getTime()
    })

    return Response.json(
      {
        products,
        stats: {
          totalProducts: products.length,
          bestSellerCount: products.filter((product) => Number(product.sold_units ?? 0) > 0).length,
        },
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error('homepage_merch error', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders },
    )
  }
})
