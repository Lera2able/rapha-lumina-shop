import { Link } from 'react-router-dom'
import { Mail, Phone, ArrowUpRight } from 'lucide-react'

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

            <div className="space-y-2 text-xs text-rl-cream/60 font-body">
              <a
                href="mailto:support@raphalumina.com"
                className="flex items-center gap-2 hover:text-rl-gold transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                support@raphalumina.com
              </a>
              <a
                href="tel:+27793330455"
                className="flex items-center gap-2 hover:text-rl-gold transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                079 333 0455
              </a>
            </div>

            <a
              href="https://web.raphalumina.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-6 text-sm text-rl-gold hover:text-rl-cream transition-colors font-body"
            >
              Create a website
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
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

        {/* Business identity strip */}
        <div className="mt-16 pt-8 border-t border-rl-cream/10">
          <div className="text-[11px] text-rl-cream/50 font-body leading-relaxed">
            <p>
              <span className="text-rl-cream/70">Rapha Lumina (Pty) Ltd</span>
              {' · '}Reg no. 2024/620336/07
              {' · '}28 Heide Street, Highveld Park, Witbank, 1034, South Africa
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-rl-cream/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-rl-cream/50 font-body">
              © {new Date().getFullYear()} Rapha Lumina. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs">
              <Link to="/privacy" className="text-rl-cream/50 hover:text-rl-cream transition-colors font-body">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-rl-cream/50 hover:text-rl-cream transition-colors font-body">
                Terms & Conditions
              </Link>
              <Link to="/refund-policy" className="text-rl-cream/50 hover:text-rl-cream transition-colors font-body">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
