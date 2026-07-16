import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/db/supabase'
import type { Product } from '@/types/types'
import { getAvailableStock, getDefaultSize, getEffectivePrice, isSaleActive, normaliseProducts } from '@/lib/product'
import { ArrowLeft, ArrowRight, Heart, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import PageMeta from '@/components/common/PageMeta'
import { toast } from 'sonner'

const MERCH_PER_VIEW = 4

type HomeProduct = Product & {
  sold_units?: number
  bestseller_rank?: number | null
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<HomeProduct[]>([])
  const [activeMerchTab, setActiveMerchTab] = useState<'all' | 'best' | 'new' | 'featured'>('all')
  const [merchPage, setMerchPage] = useState(0)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    const { data: merchData, error: merchError } = await supabase.functions.invoke('homepage_merch')

    if (!merchError && Array.isArray(merchData?.products)) {
      const normalised = normaliseProducts(merchData.products)
      const enhanced = normalised.map((product, index) => ({
        ...product,
        sold_units: Number(merchData.products[index]?.sold_units ?? 0),
        bestseller_rank: merchData.products[index]?.bestseller_rank
          ? Number(merchData.products[index].bestseller_rank)
          : null,
      }))
      setFeaturedProducts(enhanced)
      return
    }

    const { data } = await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    setFeaturedProducts(normaliseProducts(data).map((product) => ({ ...product, sold_units: 0, bestseller_rank: null })))
  }

  useEffect(() => {
    setMerchPage(0)
  }, [activeMerchTab])

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const defaultSize = getDefaultSize(product)
    
    if (product.sizes && product.sizes.length > 0 && defaultSize !== 'One Size') {
      toast.error('Please select a size first')
      return
    }

    const size = defaultSize || null
    if (getAvailableStock(product, size) <= 0) {
      toast.error('This size is out of stock')
      return
    }
    addItem(product, 1, size)
    
    toast.success(`${product.name} added to cart`)
  }

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const cleaned = newsletterEmail.trim().toLowerCase()
    if (!cleaned || !cleaned.includes('@') || !cleaned.includes('.')) {
      toast.error('Please enter a valid email address')
      return
    }

    setNewsletterLoading(true)

    try {
      const { data, error } = await supabase.rpc('subscribe_newsletter', {
        p_email: cleaned,
      })

      if (error) throw error

      if (data && typeof data === 'object' && 'success' in data && !data.success) {
        toast.error(data.message || 'Something went wrong. Please try again.')
        return
      }

      supabase.functions
        .invoke('send_newsletter_welcome', { body: { email: cleaned } })
        .catch((welcomeErr) => {
          console.warn('Welcome email dispatch failed (non-fatal):', welcomeErr)
        })

      toast.success('Welcome to the community! ✓')
      setNewsletterEmail('')
    } catch (err) {
      console.error('Newsletter signup failed:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setNewsletterLoading(false)
    }
  }

  const newestProducts = [...featuredProducts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const bestSellerProducts = [...featuredProducts]
    .filter((product) => Number(product.sold_units ?? 0) > 0)
    .sort((a, b) => {
      const soldDiff = Number(b.sold_units ?? 0) - Number(a.sold_units ?? 0)
      if (soldDiff !== 0) return soldDiff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  const featuredOnlyProducts = featuredProducts.filter((product) => product.featured)
  const merchTabs = [
    { key: 'all' as const, label: 'All products', products: featuredProducts },
    { key: 'best' as const, label: 'Best sellers', products: bestSellerProducts.length > 0 ? bestSellerProducts : featuredProducts },
    { key: 'new' as const, label: 'New arrivals', products: newestProducts },
    { key: 'featured' as const, label: 'Featured', products: featuredOnlyProducts.length > 0 ? featuredOnlyProducts : featuredProducts },
  ]
  const activeMerchProducts = merchTabs.find((tab) => tab.key === activeMerchTab)?.products ?? featuredProducts
  const totalMerchPages = Math.max(1, Math.ceil(activeMerchProducts.length / MERCH_PER_VIEW))
  const visibleMerchProducts = activeMerchProducts.slice(
    merchPage * MERCH_PER_VIEW,
    merchPage * MERCH_PER_VIEW + MERCH_PER_VIEW,
  )
  const merchStart = activeMerchProducts.length === 0 ? 0 : merchPage * MERCH_PER_VIEW + 1
  const merchEnd = Math.min(merchStart + visibleMerchProducts.length - 1, activeMerchProducts.length)
  useEffect(() => {
    if (activeMerchProducts.length <= MERCH_PER_VIEW) return

    const interval = window.setInterval(() => {
      setMerchPage((current) => (current + 1) % Math.ceil(activeMerchProducts.length / MERCH_PER_VIEW))
    }, 4800)

    return () => window.clearInterval(interval)
  }, [activeMerchProducts])

  const renderProductCard = (product: HomeProduct, tone: 'sage' | 'terra' | 'neutral' = 'neutral') => (
    <article key={product.id} className="group rounded-[26px] border border-rl-espresso/10 p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(26,18,8,0.08)]">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[22px] mb-4"
        style={{
          background:
            tone === 'sage'
              ? 'linear-gradient(180deg, rgba(185,198,190,0.45), rgba(250,248,245,0.98))'
              : tone === 'terra'
                ? 'linear-gradient(180deg, rgba(208,181,162,0.4), rgba(250,248,245,0.98))'
                : 'linear-gradient(180deg, rgba(212,168,74,0.12), rgba(250,248,245,0.98))',
        }}
      >
        <Link
          to={`/product/${product.id}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.name}`}
        />
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 to-transparent" />

        <button
          className="absolute top-3 right-3 z-20 h-10 w-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(250, 248, 245, 0.92)' }}
          aria-label={`Add ${product.name} to wishlist`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toast.success('Added to wishlist')
          }}
        >
          <Heart className="h-4 w-4" style={{ stroke: 'var(--rl-espresso)' }} />
        </button>

        <div
          className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full text-[9px] tracking-[0.14em] uppercase text-white"
          style={{ backgroundColor: 'var(--rl-gold)' }}
        >
          Rapha Lumina
        </div>

        {product.bestseller_rank ? (
          <div className="absolute top-14 left-3 z-20 px-3 py-1.5 rounded-full text-[9px] tracking-[0.14em] uppercase" style={{ backgroundColor: 'rgba(250, 248, 245, 0.92)', color: 'var(--rl-espresso)' }}>
            No. {product.bestseller_rank} best seller
          </div>
        ) : null}

        <div className="absolute left-4 right-4 bottom-4 z-20 space-y-1.5 text-white">
          <p className="text-[9px] tracking-[0.16em] uppercase opacity-80">
            {product.featured ? 'Curated favourite' : 'Available now'}
          </p>
          {isSaleActive(product) && product.sale_price !== null ? (
            <div className="space-y-1">
              <p className="text-[11px] line-through opacity-80">{formatPrice(product.price)}</p>
              <p className="font-display text-[24px] leading-none">
                {formatPrice(getEffectivePrice(product))}
              </p>
            </div>
          ) : (
            <p className="font-display text-[24px] leading-none">
              {formatPrice(product.price)}
            </p>
          )}
        </div>
      </div>

      <Link to={`/product/${product.id}`} className="block">
        <p className="text-[10px] tracking-[0.14em] uppercase mb-1.5" style={{ color: 'var(--rl-gold)' }}>
          Rapha Lumina Collection
        </p>
        <p className="font-display text-[22px] leading-[1.15] mb-2 transition-colors duration-200 group-hover:text-[var(--rl-gold)]">
          {product.name}
        </p>
        <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--rl-muted)' }}>
          Designed to stand out, start conversations, and pull the right shopper closer.
        </p>
      </Link>

      <div className="grid grid-cols-[1fr_auto] gap-3 items-center mt-5">
        <div>
          <p className="text-[10px] tracking-[0.14em] uppercase" style={{ color: 'var(--rl-gold)' }}>
            Made to entice
          </p>
          <p className="text-[12px] mt-1" style={{ color: 'var(--rl-muted)' }}>
            {product.bestseller_rank
              ? `${product.sold_units ?? 0} sold · ${product.stock} in stock`
              : `${product.stock} in stock`}
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full text-[10px] tracking-[0.14em] uppercase transition-colors"
          style={{ backgroundColor: 'var(--rl-espresso)', color: 'var(--rl-cream)' }}
          onClick={(e) => handleAddToCart(product, e)}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
    </article>
  )

  return (
    <div className="min-h-screen">
      <PageMeta
        title="Rapha Lumina | Spiritual Apparel, Awakening Wear & Conscious Living"
        description="Shop spiritually inspired apparel, teacher gifts, classroom-friendly accessories, journals, and conscious-living essentials from Rapha Lumina, a South African brand shaped by healing, purpose, and sacred symbolism."
        canonicalPath="/"
        ogImage="https://raphalumina.com/og-home.svg"
        ogImageAlt="Rapha Lumina social preview card"
      />
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[72vh] lg:min-h-[88vh] border-b border-rl-espresso/10">
        <div className="flex flex-col justify-center px-6 py-14 md:px-12 md:py-20 lg:px-16">
          <p className="text-[10px] tracking-[0.2em] uppercase mb-6" style={{ color: 'var(--rl-gold)' }}>
            New Season — 2026
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-light leading-[1.03] mb-7">
            Wear your <em className="italic" style={{ color: 'var(--rl-gold)' }}>purpose</em>.
          </h1>
          <p className="text-[15px] leading-[1.8] max-w-[440px] mb-9 md:mb-11" style={{ color: 'var(--rl-muted)' }}>
            Shop spiritually inspired apparel, teacher gifts, journals, tote bags, bottles, and meaningful everyday accessories from Rapha Lumina. The symbolism stays soulful, but the collection is especially strong for teachers and people who want purpose-led tools they can actually use.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-10 md:mb-14">
            <Link to="/products" className="btn-primary">
              Explore collection
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/about" className="btn-outline">Our story</Link>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-9 pt-8 border-t border-rl-espresso/10">
            <div>
              <p className="font-display text-2xl font-light" style={{ color: 'var(--rl-gold)' }}>Free</p>
              <p className="text-[10px] tracking-[0.08em] mt-1" style={{ color: 'var(--rl-muted)' }}>Shipping over R700</p>
            </div>
            <div>
              <p className="font-display text-2xl font-light" style={{ color: 'var(--rl-gold)' }}>SA</p>
              <p className="text-[10px] tracking-[0.08em] mt-1" style={{ color: 'var(--rl-muted)' }}>Made in South Africa</p>
            </div>
            <div>
              <p className="font-display text-2xl font-light" style={{ color: 'var(--rl-gold)' }}>1</p>
              <p className="text-[10px] tracking-[0.08em] mt-1" style={{ color: 'var(--rl-muted)' }}>Unified collection</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-[#C8BAA8] min-h-[320px] sm:min-h-[400px] lg:min-h-full">
          <video
            src="/publicweb-hero-video.mp4"
            poster="/publicweb-hero.png"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-contain"
            aria-label="Rapha Lumina hero video"
          />
        </div>
      </section>

      {/* Collections Section */}
      <section id="collections" className="grid grid-cols-1 gap-0.5 border-b border-rl-espresso/10">
        <Link to="/products" className="group relative h-[420px] sm:h-[520px] overflow-hidden" style={{ backgroundColor: 'var(--rl-sage-lt)' }}>
          <div className="absolute inset-0 transition-transform ease-out group-hover:scale-[1.04]" style={{ backgroundColor: 'var(--rl-sage-lt)', transitionDuration: '600ms' }}>
            <svg
              viewBox="-150 -150 300 300"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full text-rl-espresso opacity-[0.18] transition-transform ease-out group-hover:rotate-12"
              style={{ transitionDuration: '1200ms' }}
              aria-hidden
            >
              <g fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="0" cy="0" r="120" />
                <circle cx="0" cy="0" r="40" />
                <circle cx="40" cy="0" r="40" />
                <circle cx="20" cy="34.64" r="40" />
                <circle cx="-20" cy="34.64" r="40" />
                <circle cx="-40" cy="0" r="40" />
                <circle cx="-20" cy="-34.64" r="40" />
                <circle cx="20" cy="-34.64" r="40" />
                <circle cx="60" cy="34.64" r="40" />
                <circle cx="0" cy="69.28" r="40" />
                <circle cx="-60" cy="34.64" r="40" />
                <circle cx="-60" cy="-34.64" r="40" />
                <circle cx="0" cy="-69.28" r="40" />
                <circle cx="60" cy="-34.64" r="40" />
                <circle cx="80" cy="0" r="40" />
                <circle cx="40" cy="69.28" r="40" />
                <circle cx="-40" cy="69.28" r="40" />
                <circle cx="-80" cy="0" r="40" />
                <circle cx="-40" cy="-69.28" r="40" />
                <circle cx="40" cy="-69.28" r="40" />
              </g>
            </svg>
          </div>
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 transition-colors duration-300" style={{ backgroundColor: 'rgba(26, 18, 8, 0.32)' }}>
            <p className="text-[9px] tracking-[0.18em] uppercase mb-2" style={{ color: 'rgba(250, 248, 245, 0.65)' }}>
              Sacred geometry, healing, and light
            </p>
            <h2 className="font-display text-[32px] sm:text-[42px] font-light leading-[1.1] mb-4 text-[#FAF8F5]">
              Rapha Lumina <em className="italic">Collection</em>
            </h2>
            <p className="max-w-[520px] text-[13px] leading-[1.7] mb-4 text-[#FAF8F5]/85">
              One collection with the same spiritual symbolism and visual identity appearing throughout the brand.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase transition-all duration-200 group-hover:gap-2.5" style={{ color: 'rgba(250, 248, 245, 0.8)' }}>
              Shop now
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </Link>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="px-6 py-16 md:px-12 md:py-20 border-b border-rl-espresso/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-8 md:mb-10 pb-5 border-b border-rl-espresso/10">
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase mb-2" style={{ color: 'var(--rl-gold)' }}>
                Discover more
              </p>
              <h2 className="font-display text-[34px] sm:text-[42px] font-normal">Shop the edit</h2>
              <p className="text-[13px] leading-[1.7] mt-2 max-w-[620px]" style={{ color: 'var(--rl-muted)' }}>
                Bigger cards, rotating picks, and curated tabs that help shoppers discover what fits their energy faster.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <p className="text-[10px] tracking-[0.14em] uppercase" style={{ color: 'var(--rl-gold)' }}>
                Showing {merchStart}-{merchEnd} of {activeMerchProducts.length}
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase transition-colors"
                style={{ color: 'var(--rl-gold)' }}
              >
                Browse full collection
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {merchTabs.filter((tab) => tab.products.length > 0).map((tab) => (
              <button
                key={tab.key}
                type="button"
                className="px-4 py-2 rounded-full text-[10px] tracking-[0.14em] uppercase transition-colors border"
                style={{
                  backgroundColor: activeMerchTab === tab.key ? 'var(--rl-espresso)' : 'transparent',
                  color: activeMerchTab === tab.key ? 'var(--rl-cream)' : 'var(--rl-espresso)',
                  borderColor: 'rgba(26, 18, 8, 0.12)',
                }}
                onClick={() => setActiveMerchTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 xl:gap-8">
            {visibleMerchProducts.map((product) => renderProductCard(product))}
          </div>
          {totalMerchPages > 1 && (
            <div className="flex items-center justify-between gap-4 mt-10">
              <div className="flex items-center gap-2">
                {Array.from({ length: totalMerchPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Show merch set ${index + 1}`}
                    className="h-2.5 rounded-full transition-all"
                    style={{
                      width: merchPage === index ? '28px' : '10px',
                      backgroundColor: merchPage === index ? 'var(--rl-gold)' : 'rgba(26, 18, 8, 0.18)',
                    }}
                    onClick={() => setMerchPage(index)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Show previous products"
                  className="h-10 w-10 rounded-full border border-rl-espresso/10 flex items-center justify-center transition-colors hover:bg-rl-cream"
                  onClick={() => setMerchPage((current) => (current - 1 + totalMerchPages) % totalMerchPages)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Show next products"
                  className="h-10 w-10 rounded-full border border-rl-espresso/10 flex items-center justify-center transition-colors hover:bg-rl-cream"
                  onClick={() => setMerchPage((current) => (current + 1) % totalMerchPages)}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Brand Story */}
      <section className="px-6 py-16 md:px-12 md:py-24 text-center border-b border-rl-espresso/10" style={{ backgroundColor: 'var(--rl-gold-lt)' }}>
        <div className="w-8 h-px mx-auto mb-7" style={{ backgroundColor: 'var(--rl-gold)' }} />
        <h2 className="font-display text-[34px] sm:text-[46px] font-light leading-[1.18] mb-4.5">
          Rapha means <em className="italic" style={{ color: 'var(--rl-gold)' }}>healing</em>.<br />
          Lumina means <em className="italic" style={{ color: 'var(--rl-gold)' }}>light</em>.
        </h2>
        <p className="text-[15px] leading-[1.9] max-w-[520px] mx-auto mb-9" style={{ color: 'var(--rl-muted)' }}>
          We believe clothing can carry intention. Each piece in our collections is designed for those who move through the world with purpose — the spiritually curious and the dedicated teacher alike. Made in South Africa. Worn everywhere.
        </p>
        <Link to="/about" className="btn-outline">
          Our story
          <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[720px] mx-auto mt-12 text-left">
          <div>
            <div className="w-5 h-px mb-3" style={{ backgroundColor: 'var(--rl-gold)' }} />
            <h3 className="font-display text-[22px] font-light mb-2">Intention</h3>
            <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--rl-muted)' }}>
              Every design begins with meaning. We ask what the wearer carries — their purpose, their calling — before we create.
            </p>
          </div>
          <div>
            <div className="w-5 h-px mb-3" style={{ backgroundColor: 'var(--rl-gold)' }} />
            <h3 className="font-display text-[22px] font-light mb-2">Craft</h3>
            <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--rl-muted)' }}>
              Made in South Africa with materials chosen for how they feel against skin and how they last season after season.
            </p>
          </div>
          <div>
            <div className="w-5 h-px mb-3" style={{ backgroundColor: 'var(--rl-gold)' }} />
            <h3 className="font-display text-[22px] font-light mb-2">Community</h3>
            <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--rl-muted)' }}>
              Rapha Lumina is for people who choose to live with awareness. Whether you teach, seek, or both.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 px-6 py-16 md:px-12 md:py-20 items-center border-b border-rl-espresso/10">
        <div>
          <p className="text-[10px] tracking-[0.18em] uppercase mb-4" style={{ color: 'var(--rl-gold)' }}>
            Stay connected
          </p>
          <h2 className="font-display text-[32px] sm:text-[38px] font-light leading-[1.2] mb-3">
            Join the <br />community
          </h2>
          <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--rl-muted)' }}>
            New arrivals, exclusive offers, and stories of purpose — delivered to your inbox. Unsubscribe anytime.
          </p>
        </div>
        <div>
          <form 
            className="flex flex-col sm:flex-row border border-rl-espresso/20 transition-colors focus-within:border-[var(--rl-espresso)]"
            onSubmit={handleNewsletterSubmit}
          >
            <input
              type="email"
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-3.5 text-[13px] outline-none min-w-0"
              style={{ backgroundColor: 'transparent', color: 'var(--rl-espresso)' }}
              required
              disabled={newsletterLoading}
            />
            <button 
              type="submit"
              disabled={newsletterLoading}
              className="px-5 py-3.5 text-[10px] tracking-[0.14em] uppercase whitespace-nowrap flex items-center justify-center gap-1.5 transition-colors duration-200"
              style={{ backgroundColor: 'var(--rl-espresso)', color: 'var(--rl-cream)' }}
            >
              {newsletterLoading ? 'Subscribing…' : 'Subscribe'}
              <ArrowRight className="h-3 w-3" />
            </button>
          </form>
          <p className="text-[10px] leading-[1.6] mt-2.5" style={{ color: 'var(--rl-muted)', opacity: 0.6 }}>
            By subscribing you agree to our privacy policy. We respect your inbox.
          </p>
        </div>
      </section>
    </div>
  )
}
