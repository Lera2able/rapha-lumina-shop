import { Link } from 'react-router-dom'
import { Linkedin, Facebook, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-rl-espresso text-rl-cream mt-24">
      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">
          {/* Brand Column */}
          <div>
            <h3 className="font-display text-2xl font-light mb-6">Rapha Lumina</h3>
            <p className="text-sm text-rl-cream/70 mb-3 font-body">
              Wear Your Purpose.
            </p>
            <p className="text-sm text-rl-cream/70 mb-6 font-body">
              Made in South Africa.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-rl-cream/30 flex items-center justify-center hover:border-rl-gold hover:text-rl-gold transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-rl-cream/30 flex items-center justify-center hover:border-rl-gold hover:text-rl-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="mailto:info@raphalumina.com"
                className="w-10 h-10 border border-rl-cream/30 flex items-center justify-center hover:border-rl-gold hover:text-rl-gold transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Collections Column */}
          <div>
            <h3 className="text-[10px] tracking-[0.15em] uppercase text-rl-gold mb-6 font-body">Collections</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/enlightened" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  Enlightened Collection
                </Link>
              </li>
              <li>
                <Link to="/teacher" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  Teacher Collection
                </Link>
              </li>
              <li>
                <Link to="/" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  Featured
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="text-[10px] tracking-[0.15em] uppercase text-rl-gold mb-6 font-body">Help</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/shipping" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Column */}
          <div>
            <h3 className="text-[10px] tracking-[0.15em] uppercase text-rl-gold mb-6 font-body">Account</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/account" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/account/favorites" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-rl-cream/70 hover:text-rl-cream transition-colors font-body">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-rl-cream/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-rl-cream/50 font-body">
              © {new Date().getFullYear()} Rapha Lumina. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs">
              <Link to="/refund-policy" className="text-rl-cream/50 hover:text-rl-cream transition-colors font-body">
                Privacy Policy
              </Link>
              <Link to="/refund-policy" className="text-rl-cream/50 hover:text-rl-cream transition-colors font-body">
                Terms of Service
              </Link>
              <Link to="/refund-policy" className="text-rl-cream/50 hover:text-rl-cream transition-colors font-body">
                POPIA Compliance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
