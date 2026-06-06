import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import PageMeta from '@/components/common/PageMeta';

type LogoChoice = 'have' | 'make' | 'unsure';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

const included = [
  ['A custom-designed website', 'Built mobile-first, not a tired off-the-shelf template.'],
  ['Your own domain name', 'yourbusiness.co.za, registered and pointed for you.'],
  ['Twelve months hosting', 'So your site stays live and fast all year.'],
  ['A professional email address', 'On your own domain, not a free Gmail.'],
  ['An enquiry form', 'That lands straight in your inbox or on WhatsApp.'],
  ['Found on Google', 'The search basics done properly from day one.'],
];

const packages = [
  {
    name: 'Starter Site',
    price: 'from R3 950',
    note: 'once-off',
    blurb: 'For a small business getting online for the first time.',
    feature: false,
    items: ['Up to 5 pages, mobile-first', 'Domain + 12 months hosting', 'One business email address', 'Enquiry form to your inbox', 'Live in roughly a week'],
  },
  {
    name: 'Business Site',
    price: 'from R6 500',
    note: 'once-off',
    blurb: 'For an established business that wants to look the part.',
    feature: true,
    items: ['Up to 8 pages, mobile-first', 'Everything in Starter', 'Services / gallery sections', 'Click-to-WhatsApp button', 'Google Maps + basic SEO'],
  },
  {
    name: 'Care Plan',
    price: 'from R150',
    note: 'per month',
    blurb: 'Keeps your site live, safe and current after launch.',
    feature: false,
    items: ['Hosting + domain renewal', 'Small edits each month', 'Backups and updates', 'You on call when you need us', 'Cancel any time'],
  },
];

const steps = [
  ['01', 'Send your brief', 'Fill in the form below and tell us about your business and what you need.'],
  ['02', 'Pay a deposit', 'Half to get started, the balance once you are happy and ready to go live.'],
  ['03', 'We build it', 'With your logo and details, we design and build. Usually live within a week or two.'],
  ['04', 'Launch and care', 'We hand it over, and the optional care plan keeps everything running.'],
];

const work = [
  ['Law firm', 'JM Bouwer Attorneys', 'A clean, professional site that turns visitors into enquiries.', '#'],
  ['School', 'Carissa Primary School', 'A colourful school site with news, an e-newspaper and an e-learning dashboard.', 'https://lera2able.github.io/carissa'],
  ['Web app', 'Dikgomo Register', 'A livestock app tracking a herd, health records and stats, working offline.', '#'],
  ['Online shop', 'Rapha Lumina', 'Our own store, with secure checkout, email receipts and a purpose-led look.', '/'],
];

export default function WebDesignPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', business: '', message: '' });
  const [logoChoice, setLogoChoice] = useState<LogoChoice>('have');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 5 * 1024 * 1024) {
      toast.error('That file is larger than 5MB. Please choose a smaller logo.');
      e.target.value = '';
      return;
    }
    setLogoFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Please add at least your name, email and contact number.');
      return;
    }
    setLoading(true);
    try {
      let logo: { name: string; type: string; base64: string } | null = null;
      if (logoChoice === 'have' && logoFile) {
        logo = { name: logoFile.name, type: logoFile.type || 'application/octet-stream', base64: await fileToBase64(logoFile) };
      }
      const { error } = await supabase.functions.invoke('webDesignEnquiry', {
        body: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          business: form.business.trim(),
          message: form.message.trim(),
          logoChoice,
          logo,
        },
      });
      if (error) throw error;
      setDone(true);
      toast.success('Enquiry sent. We will be in touch shortly.');
    } catch (err) {
      console.error('Web design enquiry error:', err);
      toast.error('Something went wrong. Please try again or WhatsApp us on 079 333 0455.');
    } finally {
      setLoading(false);
    }
  };

  const logoOptions: { value: LogoChoice; title: string; desc: string }[] = [
    { value: 'have', title: 'I already have a logo', desc: 'Upload it here and we will design around it.' },
    { value: 'make', title: 'I would like Rapha Lumina to design one', desc: 'We can create a logo from R750 extra, included in your quote.' },
    { value: 'unsure', title: 'Not sure yet', desc: 'No problem, let us chat about it.' },
  ];

  return (
    <div className="bg-rl-cream text-rl-espresso">
      <PageMeta
        title="Websites by Rapha Lumina | Your business, beautifully online"
        description="Clean, mobile-first websites for small South African businesses. Design, domain, hosting and email, all in one place."
      />

      {/* Hero */}
      <section className="section-pad text-center max-w-3xl mx-auto">
        <p className="text-label text-rl-gold mb-5">Websites by Rapha Lumina</p>
        <h1 className="font-display text-5xl md:text-6xl font-light leading-tight mb-6">
          Your business, beautifully online.
        </h1>
        <p className="text-rl-muted text-lg leading-relaxed mb-9 max-w-xl mx-auto">
          Clean, mobile-first websites for small South African businesses. We design the site, sort your domain,
          hosting and email, and get you found, all from one place. No jargon, no fuss.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="#quote" className="btn-primary">Request a quote</a>
          <a href="#work" className="btn-outline">See our work</a>
        </div>
      </section>

      {/* What you get */}
      <section className="section-pad bg-white/60">
        <div className="max-w-5xl mx-auto">
          <p className="text-label text-rl-gold mb-3">Everything in one place</p>
          <h2 className="section-title mb-10">What you get</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-7">
            {included.map(([title, desc]) => (
              <div key={title} className="flex gap-4 border-t border-rl-espresso/10 pt-5">
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-rl-gold shrink-0" />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-rl-muted text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="section-pad">
        <div className="max-w-5xl mx-auto">
          <p className="text-label text-rl-gold mb-3">Simple, honest pricing</p>
          <h2 className="section-title mb-3">Choose a package</h2>
          <p className="text-rl-muted mb-10 max-w-xl">
            Pick a starting point. Every quote is confirmed once we have read your brief, so you never get a surprise bill.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((p) => (
              <div
                key={p.name}
                className={`flex flex-col p-7 bg-white border transition-shadow hover:shadow-lg ${
                  p.feature ? 'border-rl-gold shadow-md' : 'border-rl-espresso/10'
                }`}
              >
                {p.feature && <span className="text-label text-rl-gold mb-3">Most popular</span>}
                <h3 className="font-display text-2xl font-light">{p.name}</h3>
                <p className="text-rl-gold font-medium mt-1">
                  {p.price} <span className="text-rl-muted text-sm font-normal">{p.note}</span>
                </p>
                <p className="text-rl-muted text-sm mt-2 mb-5">{p.blurb}</p>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-rl-gold shrink-0 mt-0.5" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <a href="#quote" className={p.feature ? 'btn-primary justify-center' : 'btn-outline justify-center'}>
                  Get a quote
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-pad bg-white/60">
        <div className="max-w-5xl mx-auto">
          <p className="text-label text-rl-gold mb-3">No surprises</p>
          <h2 className="section-title mb-10">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(([n, title, desc]) => (
              <div key={n}>
                <p className="font-display text-4xl font-light text-rl-gold">{n}</p>
                <p className="font-medium mt-2 mb-1">{title}</p>
                <p className="text-rl-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="section-pad">
        <div className="max-w-5xl mx-auto">
          <p className="text-label text-rl-gold mb-3">A little of our work</p>
          <h2 className="section-title mb-10">Recent builds</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {work.map(([tag, title, desc, href]) => (
              <a
                key={title}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="block bg-white border border-rl-espresso/10 p-7 transition-shadow hover:shadow-lg"
              >
                <span className="text-label text-rl-gold">{tag}</span>
                <h3 className="font-display text-2xl font-light mt-1 mb-2">{title}</h3>
                <p className="text-rl-muted text-sm">{desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Quote form */}
      <section id="quote" className="section-pad bg-rl-gold-lt/40">
        <div className="max-w-2xl mx-auto bg-white border border-rl-espresso/10 p-8 md:p-12">
          {done ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-rl-gold/15 flex items-center justify-center">
                <Check className="h-8 w-8 text-rl-gold" />
              </div>
              <h2 className="font-display text-3xl font-light mb-2">Thank you</h2>
              <p className="text-rl-muted">
                Your enquiry is on its way. We will be in touch shortly. For anything urgent, WhatsApp us on 079 333 0455.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="section-title">Request a Quote</h2>
                <p className="text-rl-muted mt-2">Tell us a little about your business and we will come back with a quote.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={set('name')} placeholder="Your full name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" required />
                </div>
                <div>
                  <Label htmlFor="phone">Contact number</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="Call or WhatsApp" required />
                </div>
                <div>
                  <Label htmlFor="business">Business name</Label>
                  <Input id="business" value={form.business} onChange={set('business')} placeholder="Your business or project" />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="What does your business do, and what do you need from the website?"
                />
              </div>

              <div className="border-t border-rl-espresso/10 pt-5">
                <p className="text-label text-rl-muted mb-3">Your logo</p>
                <div className="space-y-3">
                  {logoOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex gap-3 items-start p-3.5 border cursor-pointer transition-colors ${
                        logoChoice === opt.value ? 'border-rl-gold bg-rl-gold-lt/30' : 'border-rl-espresso/15 hover:border-rl-gold/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="logo"
                        value={opt.value}
                        checked={logoChoice === opt.value}
                        onChange={() => setLogoChoice(opt.value)}
                        className="mt-1 accent-rl-gold"
                      />
                      <span>
                        <span className="block font-medium text-sm">{opt.title}</span>
                        <span className="block text-rl-muted text-sm">{opt.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>

                {logoChoice === 'have' && (
                  <label className="mt-3 flex flex-col items-center justify-center gap-2 border border-dashed border-rl-gold/60 bg-rl-gold-lt/20 p-5 text-center cursor-pointer">
                    <Upload className="h-5 w-5 text-rl-gold" />
                    <span className="text-sm text-rl-muted">
                      {logoFile ? `Selected: ${logoFile.name}` : 'Click to upload your logo (PNG, JPG, SVG or PDF, up to 5MB)'}
                    </span>
                    <input type="file" accept=".png,.jpg,.jpeg,.svg,.pdf" onChange={onFile} className="hidden" />
                  </label>
                )}
              </div>

              <div className="text-center pt-2">
                <Button type="submit" disabled={loading} className="min-w-56">
                  {loading ? 'Sending...' : 'Send my enquiry'}
                </Button>
                <p className="text-rl-muted text-xs mt-3">
                  Or WhatsApp us directly on{' '}
                  <a href="https://wa.me/27793330455" target="_blank" rel="noopener noreferrer" className="text-rl-gold">
                    079 333 0455
                  </a>.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
