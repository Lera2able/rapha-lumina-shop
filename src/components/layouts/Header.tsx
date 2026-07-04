import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'

export function Header() {
  const { user, signOut, profile } = useAuth()
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/enlightened', label: 'Enlightened' },
    { to: '/teacher', label: 'Teacher' },
    { to: '/about', label: 'About' },
    { to: '/faq', label: 'FAQ' },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        FREE SHIPPING ON ORDERS OVER R700 <span>·</span> WEAR YOUR PURPOSE
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-rl-espresso/10 bg-rl-cream/95 backdrop-blur-sm">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/rapha-lumina-logo.png"
              alt="Rapha Lumina"
              className="h-10 w-10 object-contain"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <span className="font-display text-xl font-light text-rl-espresso">Rapha Lumina</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-label text-rl-muted hover:text-rl-espresso transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative">
            <button className="p-2 text-rl-espresso hover:text-rl-gold transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rl-espresso text-rl-cream text-[10px] flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {profile?.role === 'admin' && (
                <Link to="/admin">
                  <button className="btn-outline">
                    Admin
                  </button>
                </Link>
              )}
              <Link to="/account">
                <button className="p-2 text-rl-espresso hover:text-rl-gold transition-colors">
                  <User className="h-5 w-5" />
                </button>
              </Link>
              <button className="btn-ghost" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <button className="btn-ghost">
                Sign In
              </button>
            </Link>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-rl-espresso" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-rl-cream border-l border-rl-espresso/10">
              <nav className="flex flex-col gap-6 mt-8">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-label text-rl-muted hover:text-rl-espresso transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-rl-espresso/10 pt-6 space-y-4">
                  <Link
                    to="/cart"
                    className="flex items-center justify-between text-label text-rl-muted hover:text-rl-espresso transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Cart</span>
                    <span className="text-xs tracking-[0.12em] uppercase">{totalItems} item{totalItems === 1 ? '' : 's'}</span>
                  </Link>
                  <Link
                    to="/shipping"
                    className="block text-label text-rl-muted hover:text-rl-espresso transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shipping & Delivery
                  </Link>
                  <Link
                    to="/contact"
                    className="block text-label text-rl-muted hover:text-rl-espresso transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                </div>
                <div className="border-t border-rl-espresso/10 pt-6 mt-6">
                  {user ? (
                    <>
                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block text-label text-rl-muted hover:text-rl-espresso transition-colors mb-4"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin
                        </Link>
                      )}
                      <Link
                        to="/account"
                        className="block text-label text-rl-muted hover:text-rl-espresso transition-colors mb-4"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <button
                        className="btn-ghost w-full justify-start"
                        onClick={() => {
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <button className="btn-ghost w-full justify-start">
                        Sign In
                      </button>
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    </>
  )
}
