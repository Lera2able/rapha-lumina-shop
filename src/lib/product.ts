import type { Product, CollectionType } from '@/types/types'

/**
 * Clean up a raw products row from Supabase into a properly-shaped Product.
 *
 * Why this exists:
 *   - Supabase returns Postgres `numeric` columns as strings (e.g. "60.00")
 *     to preserve precision. Code that calls `.toFixed(2)` directly on these
 *     crashes with "is not a function".
 *   - Arrays like `sizes` and `additional_images` come back as `null` when
 *     they were never set, not as empty arrays. Code that calls `.length`
 *     or `.map` on `null` crashes the page.
 *   - `featured` can come back as null on older rows; we default to false.
 *
 * Always pass DB rows through this before handing them to React.
 */
export function normaliseProduct(raw: unknown): Product {
  const r = raw as Record<string, unknown>

  return {
    id: String(r.id ?? ''),
    name: String(r.name ?? ''),
    description: String(r.description ?? ''),
    collection: (r.collection ?? 'enlightened') as CollectionType,
    category: String(r.category ?? ''),
    price: Number(r.price ?? 0),
    sale_enabled: Boolean(r.sale_enabled),
    sale_price:
      r.sale_price === null || r.sale_price === undefined || r.sale_price === ''
        ? null
        : Number(r.sale_price),
    sale_start_date: r.sale_start_date ? String(r.sale_start_date) : null,
    sale_end_date: r.sale_end_date ? String(r.sale_end_date) : null,
    image_url: String(r.image_url ?? ''),
    additional_images: Array.isArray(r.additional_images)
      ? (r.additional_images as string[])
      : [],
    video_url: r.video_url ? String(r.video_url) : null,
    sizes: Array.isArray(r.sizes) ? (r.sizes as string[]) : [],
    stock: Number(r.stock ?? 0),
    featured: Boolean(r.featured),
    created_at: String(r.created_at ?? ''),
    updated_at: String(r.updated_at ?? ''),
  }
}

/**
 * Convenience for normalising an array of raw rows.
 */
export function normaliseProducts(raw: unknown[] | null | undefined): Product[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normaliseProduct)
}

export function isSaleActive(product: Pick<Product, 'sale_enabled' | 'sale_price' | 'sale_start_date' | 'sale_end_date'>, now = new Date()) {
  if (!product.sale_enabled || product.sale_price === null || product.sale_price <= 0) {
    return false
  }

  const start = product.sale_start_date ? new Date(product.sale_start_date) : null
  const end = product.sale_end_date ? new Date(product.sale_end_date) : null

  if (start && now < start) return false
  if (end) {
    const inclusiveEnd = new Date(end)
    inclusiveEnd.setHours(23, 59, 59, 999)
    if (now > inclusiveEnd) return false
  }

  return true
}

export function getEffectivePrice(product: Product, now = new Date()) {
  return isSaleActive(product, now) ? Number(product.sale_price ?? product.price) : product.price
}

export function getOriginalPrice(product: Product) {
  return product.price
}
