import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

/**
 * Newsletter popup for Rapha Lumina.
 *
 * Appears 10 seconds after the user lands on the site.
 * Saves to the `newsletter_subscribers` table with source = 'popup'.
 * Will not reappear for POPUP_SNOOZE_DAYS after the user closes it or signs up.
 * Skips checkout, cart, account and admin routes so we don't interrupt purchases.
 */

const POPUP_DELAY_MS = 10_000;
const POPUP_SNOOZE_DAYS = 14;
const POPUP_DISMISSED_KEY = 'rl_newsletter_popup_dismissed_at';

const ROUTES_TO_SKIP = ['/cart', '/checkout', '/account', '/admin', '/login', '/signup'];

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Skip on routes where a popup would be intrusive
    const path = window.location.pathname;
    if (ROUTES_TO_SKIP.some((r) => path.startsWith(r))) return;

    // Honour the snooze if we have one
    try {
      const dismissedAt = localStorage.getItem(POPUP_DISMISSED_KEY);
      if (dismissedAt) {
        const snoozeUntil =
          parseInt(dismissedAt, 10) + POPUP_SNOOZE_DAYS * 24 * 60 * 60 * 1000;
        if (Date.now() < snoozeUntil) return;
      }
    } catch {
      // localStorage can throw in private mode, ignore and show as normal
    }

    const timer = setTimeout(() => setOpen(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Allow Escape key to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const snooze = () => {
    try {
      localStorage.setItem(POPUP_DISMISSED_KEY, Date.now().toString());
    } catch {
      // best effort, no fallback needed
    }
  };

  const handleClose = () => {
    setOpen(false);
    snooze();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned = email.trim().toLowerCase();
    if (!cleaned || !cleaned.includes('@') || !cleaned.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Call RPC function to handle subscription with validation and duplicate checking
      const { data, error } = await supabase.rpc('subscribe_newsletter', {
        p_email: cleaned,
      });

      if (error) {
        console.error('Newsletter popup signup failed:', error);
        throw error;
      }

      // RPC returns { success: boolean, message: string }
      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          setSuccess(true);
          snooze();
          setTimeout(() => setOpen(false), 2400);
        } else {
          // Show the message from the RPC function
          toast.error(data.message || 'Something went wrong. Please try again.');
        }
      } else {
        // Fallback for unexpected response format
        setSuccess(true);
        snooze();
        setTimeout(() => setOpen(false), 2400);
      }
    } catch (err) {
      console.error('Newsletter popup signup failed:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-rl-espresso/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[calc(100%-2rem)] md:max-w-lg bg-rl-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-rl-espresso/60 hover:text-rl-espresso transition-colors"
          aria-label="Close newsletter popup"
        >
          <X className="w-5 h-5" />
        </button>

        {!success ? (
          <>
            {/* Small gold accent bar to tie into brand palette */}
            <div className="h-1 bg-gradient-to-r from-rl-gold via-rl-gold/60 to-transparent" />

            <div className="p-6 md:p-8">
              <h2 className="font-display text-2xl md:text-3xl font-medium text-rl-espresso mb-3 tracking-wide text-balance">
                Join the Lumina list.
              </h2>

              <p className="text-rl-espresso/70 mb-6 leading-relaxed text-pretty">
                Be first to hear about new arrivals, restocks, and the kind of
                specials we save for our inner circle. From both of our
                collections.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="popup-email" className="block text-sm font-medium text-rl-espresso mb-2">
                    Email *
                  </label>
                  <input
                    id="popup-email"
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-rl-espresso/20 bg-white focus:outline-none focus:border-rl-gold transition-colors disabled:opacity-50"
                  />
                </div>

                <p className="text-xs text-rl-espresso/50">
                  No spam, ever. Unsubscribe at any time.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary h-12"
                >
                  {loading ? 'Signing you up…' : 'Sign me up'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="p-6 md:p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-rl-sage-lt/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-rl-sage"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-medium text-rl-espresso mb-3 tracking-wide">
              You're in.
            </h2>
            <p className="text-rl-espresso/70 leading-relaxed text-pretty">
              Welcome to the Lumina list. Keep an eye on your inbox for our
              next note.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsletterPopup;
