import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/db/supabase'
import type { Product } from '@/types/types'
import { normaliseProducts } from '@/lib/product'
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import PageMeta from '@/components/common/PageMeta'
import { toast } from 'sonner'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .limit(3)

    setFeaturedProducts(normaliseProducts(data))
  }

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'One Size') {
      toast.error('Please select a size first')
      return
    }

    const size = product.sizes?.[0] || null
    addItem(product, 1, size)
    
    toast.success(`${product.name} added to cart`)
  }

  const featuredCollections = [...new Set(featuredProducts.map((product) => product.collection))]
  const featuredCollection = featuredCollections.length === 1 ? featuredCollections[0] : null
  const featuredCollectionLink = featuredCollection === 'teacher' ? '/teacher' : '/enlightened'
  const featuredCollectionLabel =
    featuredCollection === 'teacher' ? 'Teacher Collection' : 'Enlightened Collection'

  return (
    <div className="min-h-screen">
      <PageMeta
        title="Rapha Lumina | Spiritual Apparel, Awakening Wear & Conscious Living"
        description="Discover Rapha Lumina's spiritually inspired apparel and teacher collection, made in South Africa and designed to help you wear your purpose."
      />
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[88vh] border-b border-rl-espresso/10">
        <div className="flex flex-col justify-center px-6 py-20 md:px-12 lg:px-16">
          <p className="text-[10px] tracking-[0.2em] uppercase mb-6" style={{ color: 'var(--rl-gold)' }}>
            New Season — 2026
          </p>
          <h1 className="font-display text-6xl md:text-7xl lg:text-[76px] font-light leading-[1.03] mb-7">
            Wear your <em className="italic" style={{ color: 'var(--rl-gold)' }}>purpose</em>.
          </h1>
          <p className="text-[15px] leading-[1.8] max-w-[340px] mb-11" style={{ color: 'var(--rl-muted)' }}>
            Two collections born from light and intention. Clothing that carries meaning — for the spiritually awakened and the dedicated educator.
          </p>
          <div className="flex gap-3 mb-14">
            <Link to="/enlightened">
              <button className="btn-primary">
                Explore collections
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link to="/about">
              <button className="btn-outline">Our story</button>
            </Link>
          </div>
          <div className="flex gap-9 pt-8 border-t border-rl-espresso/10">
            <div>
              <p className="font-display text-2xl font-light" style={{ color: 'var(--rl-gold)' }}>Free</p>
              <p className="text-[10px] tracking-[0.08em] mt-1" style={{ color: 'var(--rl-muted)' }}>Shipping over R700</p>
            </div>
            <div>
              <p className="font-display text-2xl font-light" style={{ color: 'var(--rl-gold)' }}>SA</p>
              <p className="text-[10px] tracking-[0.08em] mt-1" style={{ color: 'var(--rl-muted)' }}>Made in South Africa</p>
            </div>
            <div>
              <p className="font-display text-2xl font-light" style={{ color: 'var(--rl-gold)' }}>2</p>
              <p className="text-[10px] tracking-[0.08em] mt-1" style={{ color: 'var(--rl-muted)' }}>Curated collections</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-[#C8BAA8] min-h-[400px] lg:min-h-full">
          <img
            src="https://miaoda-conversation-file.s3cdn.medo.dev/user-bj1l8lwrcxkw/conv-bj5sbqg4k64g/20260510/file-bj6z8fr73bi8.png"
            alt="Rapha Lumina Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-7 left-7 px-3.5 py-2 text-[10px] tracking-[0.14em] uppercase" style={{ backgroundColor: 'var(--rl-cream)', color: 'var(--rl-espresso)' }}>
            Enlightened Collection
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section id="collections" className="grid grid-cols-1 md:grid-cols-2 gap-0.5 border-b border-rl-espresso/10">
        <Link to="/enlightened" className="group relative h-[520px] overflow-hidden" style={{ backgroundColor: 'var(--rl-sage-lt)' }}>
          <div className="absolute inset-0 transition-transform ease-out group-hover:scale-[1.04]" style={{ backgroundColor: 'var(--rl-sage-lt)', transitionDuration: '600ms' }}>
            {/* Sacred geometry — Flower of Life */}
            <svg
              viewBox="-150 -150 300 300"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full text-rl-espresso opacity-[0.18] transition-transform ease-out group-hover:rotate-12"
              style={{ transitionDuration: '1200ms' }}
              aria-hidden
            >
              <g fill="none" stroke="currentColor" strokeWidth="1.2">
                {/* Outer boundary circle */}
                <circle cx="0" cy="0" r="120" />
                {/* Centre circle */}
                <circle cx="0" cy="0" r="40" />
                {/* Inner ring — 6 circles at distance 40 */}
                <circle cx="40" cy="0" r="40" />
                <circle cx="20" cy="34.64" r="40" />
                <circle cx="-20" cy="34.64" r="40" />
                <circle cx="-40" cy="0" r="40" />
                <circle cx="-20" cy="-34.64" r="40" />
                <circle cx="20" cy="-34.64" r="40" />
                {/* Second ring — 6 circles between inner ring */}
                <circle cx="60" cy="34.64" r="40" />
                <circle cx="0" cy="69.28" r="40" />
                <circle cx="-60" cy="34.64" r="40" />
                <circle cx="-60" cy="-34.64" r="40" />
                <circle cx="0" cy="-69.28" r="40" />
                <circle cx="60" cy="-34.64" r="40" />
                {/* Outer ring — 6 circles at distance 80 */}
                <circle cx="80" cy="0" r="40" />
                <circle cx="40" cy="69.28" r="40" />
                <circle cx="-40" cy="69.28" r="40" />
                <circle cx="-80" cy="0" r="40" />
                <circle cx="-40" cy="-69.28" r="40" />
                <circle cx="40" cy="-69.28" r="40" />
              </g>
            </svg>
          </div>
          <div className="absolute inset-0 flex flex-col justify-end p-12 transition-colors duration-300" style={{ backgroundColor: 'rgba(26, 18, 8, 0.32)' }}>
            <p className="text-[9px] tracking-[0.18em] uppercase mb-2" style={{ color: 'rgba(250, 248, 245, 0.65)' }}>
              The first collection
            </p>
            <h2 className="font-display text-[42px] font-light leading-[1.1] mb-4 text-[#FAF8F5]">
              Enlightened <em className="italic">Collection</em>
            </h2>
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase transition-all duration-200 group-hover:gap-2.5" style={{ color: 'rgba(250, 248, 245, 0.8)' }}>
              Shop now
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </Link>

        <Link to="/teacher" className="group relative h-[520px] overflow-hidden" style={{ backgroundColor: 'var(--rl-terra-lt)' }}>
          <div className="absolute inset-0 transition-transform ease-out group-hover:scale-[1.04]" style={{ backgroundColor: 'var(--rl-terra-lt)', transitionDuration: '600ms' }}>
            {/* Creative teaching tools — open book, pencil, apple, lightbulb, sparkles */}
            <svg
              viewBox="0 0 400 400"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full text-rl-espresso opacity-[0.22]"
              aria-hidden
            >
              <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {/* Open book — bottom centre */}
                <g transform="translate(150 230) rotate(-4)">
                  <path d="M0 0 Q50 -10 100 0 L100 70 Q50 60 0 70 Z" />
                  <path d="M100 0 Q150 -10 200 0 L200 70 Q150 60 100 70 Z" />
                  <line x1="100" y1="0" x2="100" y2="70" />
                  <line x1="20" y1="20" x2="80" y2="22" />
                  <line x1="20" y1="35" x2="80" y2="37" />
                  <line x1="20" y1="50" x2="65" y2="52" />
                  <line x1="120" y1="20" x2="180" y2="22" />
                  <line x1="120" y1="35" x2="180" y2="37" />
                  <line x1="120" y1="50" x2="165" y2="52" />
                </g>

                {/* Pencil — top left, tilted */}
                <g transform="translate(50 90) rotate(-28)">
                  <rect x="0" y="0" width="120" height="14" rx="2" />
                  <path d="M120 0 L142 7 L120 14 Z" fill="currentColor" />
                  <line x1="135" y1="7" x2="142" y2="7" />
                  <line x1="0" y1="0" x2="0" y2="14" strokeWidth="3" />
                </g>

                {/* Lightbulb — top right */}
                <g transform="translate(300 70)">
                  <path d="M30 0 Q60 0 60 30 Q60 45 50 55 L50 70 L10 70 L10 55 Q0 45 0 30 Q0 0 30 0 Z" />
                  <line x1="15" y1="78" x2="45" y2="78" />
                  <line x1="20" y1="86" x2="40" y2="86" />
                  {/* Filament glow */}
                  <path d="M22 30 Q30 22 38 30" />
                  <path d="M22 38 Q30 30 38 38" />
                  {/* Sparkles around */}
                  <g strokeWidth="1.5">
                    <line x1="-12" y1="20" x2="-4" y2="20" />
                    <line x1="-8" y1="16" x2="-8" y2="24" />
                    <line x1="70" y1="14" x2="78" y2="14" />
                    <line x1="74" y1="10" x2="74" y2="18" />
                  </g>
                </g>

                {/* Apple — bottom right */}
                <g transform="translate(310 270)">
                  <path d="M30 10 Q15 5 5 20 Q-5 40 10 60 Q20 75 30 70 Q40 75 50 60 Q65 40 55 20 Q45 5 30 10 Z" />
                  <path d="M30 10 Q33 0 40 -2" strokeWidth="2.5" />
                  <path d="M32 8 Q40 0 50 4" />
                </g>

                {/* Graduation cap — top centre, small */}
                <g transform="translate(180 40) rotate(-6)">
                  <path d="M0 12 L30 0 L60 12 L30 24 Z" fill="currentColor" fillOpacity="0.3" />
                  <line x1="58" y1="13" x2="58" y2="32" />
                  <circle cx="58" cy="33" r="2" fill="currentColor" />
                  <path d="M10 18 L10 28 Q30 36 50 28 L50 18" />
                </g>

                {/* Small stars/sparkles scattered */}
                <g strokeWidth="1.5">
                  <g transform="translate(80 320)">
                    <line x1="-6" y1="0" x2="6" y2="0" />
                    <line x1="0" y1="-6" x2="0" y2="6" />
                  </g>
                  <g transform="translate(255 130)">
                    <line x1="-5" y1="0" x2="5" y2="0" />
                    <line x1="0" y1="-5" x2="0" y2="5" />
                  </g>
                  <g transform="translate(370 200)">
                    <line x1="-5" y1="0" x2="5" y2="0" />
                    <line x1="0" y1="-5" x2="0" y2="5" />
                  </g>
                </g>

                {/* Doodly creative lines */}
                <path d="M240 350 Q260 340 280 350 Q300 360 320 350" strokeWidth="1.5" />
                <path d="M30 280 Q50 275 60 285" strokeWidth="1.5" />
              </g>
            </svg>
          </div>
          <div className="absolute inset-0 flex flex-col justify-end p-12 transition-colors duration-300" style={{ backgroundColor: 'rgba(26, 18, 8, 0.32)' }}>
            <p className="text-[9px] tracking-[0.18em] uppercase mb-2" style={{ color: 'rgba(250, 248, 245, 0.65)' }}>
              The second collection
            </p>
            <h2 className="font-display text-[42px] font-light leading-[1.1] mb-4 text-[#FAF8F5]">
              Teacher <em className="italic">Collection</em>
            </h2>
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase transition-all duration-200 group-hover:gap-2.5" style={{ color: 'rgba(250, 248, 245, 0.8)' }}>
              Shop now
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </Link>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="px-6 py-20 md:px-12 border-b border-rl-espresso/10">
          <div className="flex justify-between items-baseline mb-12 pb-4.5 border-b border-rl-espresso/10">
            <h2 className="font-display text-[42px] font-normal">Handpicked</h2>
            {featuredCollection ? (
              <Link
                to={featuredCollectionLink}
                className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase transition-colors"
                style={{ color: 'var(--rl-gold)' }}
              >
                View all in {featuredCollectionLabel}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <a
                href="#collections"
                className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase transition-colors"
                style={{ color: 'var(--rl-gold)' }}
              >
                Browse collections
                <ArrowRight className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden mb-3.5">
                  <div className="absolute inset-0 transition-transform ease-out group-hover:scale-105" style={{ transitionDuration: '450ms' }}>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <button 
                    className="absolute top-3 right-3 w-[30px] h-[30px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ backgroundColor: 'rgba(250, 248, 245, 0.88)' }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toast.success('Added to wishlist')
                    }}
                  >
                    <Heart className="h-3.5 w-3.5" style={{ stroke: 'var(--rl-espresso)' }} />
                  </button>

                  <div 
                    className="absolute top-3 left-3 px-2 py-0.5 text-[9px] tracking-[0.12em] uppercase text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ backgroundColor: product.collection === 'enlightened' ? 'var(--rl-sage)' : 'var(--rl-terra)' }}
                  >
                    {product.collection}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform ease-out" style={{ backgroundColor: 'rgba(250, 248, 245, 0.96)', transitionDuration: '280ms' }}>
                    <button 
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[10px] tracking-[0.12em] uppercase transition-colors duration-200"
                      style={{ backgroundColor: 'var(--rl-espresso)', color: 'var(--rl-cream)' }}
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingBag className="h-3 w-3" />
                      Add to cart
                    </button>
                  </div>
                </div>

                <p className="text-[9px] tracking-[0.14em] uppercase mb-1" style={{ color: product.collection === 'enlightened' ? 'var(--rl-sage)' : 'var(--rl-terra)' }}>
                  {product.collection === 'enlightened' ? 'Enlightened' : 'Teacher'} Collection
                </p>
                <p className="text-[15px] mb-1 transition-colors duration-200 group-hover:text-[var(--rl-gold)]">
                  {product.name}
                </p>
                <p className="text-[13px]" style={{ color: 'var(--rl-muted)' }}>
                  {formatPrice(product.price)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="px-6 py-24 md:px-12 text-center border-b border-rl-espresso/10" style={{ backgroundColor: 'var(--rl-gold-lt)' }}>
        <div className="w-8 h-px mx-auto mb-7" style={{ backgroundColor: 'var(--rl-gold)' }} />
        <h2 className="font-display text-[46px] font-light leading-[1.18] mb-4.5">
          Rapha means <em className="italic" style={{ color: 'var(--rl-gold)' }}>healing</em>.<br />
          Lumina means <em className="italic" style={{ color: 'var(--rl-gold)' }}>light</em>.
        </h2>
        <p className="text-[15px] leading-[1.9] max-w-[520px] mx-auto mb-9" style={{ color: 'var(--rl-muted)' }}>
          We believe clothing can carry intention. Each piece in our collections is designed for those who move through the world with purpose — the spiritually curious and the dedicated teacher alike. Made in South Africa. Worn everywhere.
        </p>
        <Link to="/about">
          <button className="btn-outline">
            Our story
            <ArrowRight className="h-4 w-4" />
          </button>
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
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 px-6 py-20 md:px-12 items-center border-b border-rl-espresso/10">
        <div>
          <p className="text-[10px] tracking-[0.18em] uppercase mb-4" style={{ color: 'var(--rl-gold)' }}>
            Stay connected
          </p>
          <h2 className="font-display text-[38px] font-light leading-[1.2] mb-3">
            Join the <br />community
          </h2>
          <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--rl-muted)' }}>
            New arrivals, exclusive offers, and stories of purpose — delivered to your inbox. Unsubscribe anytime.
          </p>
        </div>
        <div>
          <form 
            className="flex border border-rl-espresso/20 transition-colors focus-within:border-[var(--rl-espresso)]"
            onSubmit={(e) => {
              e.preventDefault()
              toast.success('Welcome to the community! ✓')
              e.currentTarget.reset()
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3.5 text-[13px] outline-none"
              style={{ backgroundColor: 'transparent', color: 'var(--rl-espresso)' }}
              required
            />
            <button 
              type="submit"
              className="px-5 py-3.5 text-[10px] tracking-[0.14em] uppercase whitespace-nowrap flex items-center gap-1.5 transition-colors duration-200"
              style={{ backgroundColor: 'var(--rl-espresso)', color: 'var(--rl-cream)' }}
            >
              Subscribe
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
