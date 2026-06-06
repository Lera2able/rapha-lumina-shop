import { useState } from 'react';
import {
  Upload, Check, ArrowRight, Sparkles, Globe, Smartphone,
  Server, Mail, MessageCircle, Search,
} from 'lucide-react';
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

const features = [
  [Globe, 'Your own domain', 'yourbusiness.co.za, registered and pointed for you.'],
  [Smartphone, 'Mobile-first design', 'Looks sharp on every phone, tablet and laptop.'],
  [Server, '12 months hosting', 'Fast, secure and live all year, no extra setup.'],
  [Mail, 'Business email', 'A professional address on your own domain.'],
  [MessageCircle, 'Click-to-WhatsApp', 'Turn visitors into chats with one tap.'],
  [Search, 'Found on Google', 'The search basics done properly from day one.'],
] as const;

const packages = [
  {
    name: 'Starter Site', price: 'from R3 950', note: 'once-off', feature: false,
    blurb: 'For a small business getting online for the first time.',
    items: ['Up to 5 pages, mobile-first', 'Domain + 12 months hosting', 'One business email address', 'Enquiry form to your inbox', 'Live in roughly a week'],
  },
  {
    name: 'Business Site', price: 'from R6 500', note: 'once-off', feature: true,
    blurb: 'For an established business that wants to look unmissable.',
    items: ['Up to 8 pages, mobile-first', 'Everything in Starter', 'Services / gallery sections', 'Click-to-WhatsApp button', 'Google Maps + basic SEO'],
  },
  {
    name: 'Care Plan', price: 'from R150', note: 'per month', feature: false,
    blurb: 'Keeps your site live, safe and current after launch.',
    items: ['Hosting + domain renewal', 'Small edits each month', 'Backups and updates', 'You on call when you need us', 'Cancel any time'],
  },
];

const steps = [
  ['01', 'Send your brief', 'Fill in the form below and tell us about your business.'],
  ['02', 'Pay a deposit', 'Half to start, the balance once you are happy to go live.'],
  ['03', 'We build it', 'With your logo and details, we design and build, fast.'],
  ['04', 'Launch and glow', 'We hand it over, and the care plan keeps it running.'],
];

const work = [
  ['Law firm', 'JM Bouwer Attorneys', 'A clean, professional site that turns visitors into enquiries.', '#'],
  ['School', 'Carissa Primary School', 'A colourful school site with news, an e-newspaper and an e-learning hub.', 'https://lera2able.github.io/carissa'],
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

  const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="relative overflow-hidden bg-rl-cream text-rl-espresso">
      <PageMeta
        title="Websites by Rapha Lumina | Want a beautiful website?"
        description="Bold, modern websites for South African businesses. Domain, hosting, email and SEO, all sorted by Rapha Lumina."
      />

      <style>{`
        @keyframes lw-grad { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes lw-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        .lw-grad-text{ background:linear-gradient(90deg,#ff2db5,#8b5cf6,#22d3ee,#f5a623); -webkit-background-clip:text; background-clip:text; color:transparent; background-size:240% 240%; animation:lw-grad 7s ease infinite; }
        .lw-cta{ display:inline-flex; align-items:center; gap:.55rem; padding:.95rem 1.7rem; border-radius:999px; color:#fff; font-weight:600; letter-spacing:.01em; background:linear-gradient(90deg,#ff2db5,#8b5cf6,#22d3ee); background-size:220% 220%; animation:lw-grad 7s ease infinite; box-shadow:0 12px 34px rgba(139,92,246,.35); transition:transform .18s ease, box-shadow .18s ease; border:none; cursor:pointer; }
        .lw-cta:hover{ transform:translateY(-2px); box-shadow:0 18px 44px rgba(255,45,181,.42); }
        .lw-cta:disabled{ opacity:.7; cursor:default; transform:none; }
        .lw-float{ animation:lw-float 7s ease-in-out infinite; }
        .lw-chip{ display:inline-flex; align-items:center; gap:.4rem; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.72rem; letter-spacing:.06em; text-transform:uppercase; padding:.4rem .7rem; border-radius:999px; background:rgba(139,92,246,.08); border:1px solid rgba(139,92,246,.25); color:#6d28d9; }
        .lw-grid{ background-image:linear-gradient(rgba(34,30,24,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(34,30,24,.5) 1px,transparent 1px); background-size:44px 44px; }
        .lw-cardtop{ height:4px; background:linear-gradient(90deg,#ff2db5,#8b5cf6,#22d3ee); background-size:220% 220%; animation:lw-grad 7s ease infinite; }
      `}</style>

      {/* ===================== HERO ===================== */}
      <section className="relative">
        {/* glow blobs (light, not dark) */}
        <div className="pointer-events-none absolute -top-24 -right-20 h-[26rem] w-[26rem] rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(circle,#ff2db5,transparent 70%)' }} />
        <div className="pointer-events-none absolute top-32 -left-28 h-[24rem] w-[24rem] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle,#22d3ee,transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-10 right-1/3 h-[20rem] w-[20rem] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle,#8b5cf6,transparent 70%)' }} />
        <div className="pointer-events-none absolute inset-0 lw-grid opacity-[0.05]" />

        <div className="relative container mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="lw-chip mb-6"><Sparkles className="h-3.5 w-3.5" /> Rapha Lumina Web Studio</span>
            <h1 className="font-display font-light leading-[1.05] text-5xl md:text-6xl lg:text-7xl mt-5">
              Want a beautiful website?
              <span className="block lw-grad-text mt-2">Rapha Lumina has you covered.</span>
            </h1>
            <p className="text-rl-muted text-lg leading-relaxed mt-6 max-w-xl">
              Bold, modern websites for South African businesses, designed to make you look
              unmissable online. Domain, hosting, email and all the tech, sorted by us.
            </p>
            <div className="flex flex-wrap gap-4 mt-9">
              <a href="#quote" className="lw-cta">Get my website <ArrowRight className="h-4 w-4" /></a>
              <a href="#work" className="btn-outline">See our work</a>
            </div>
            <div className="flex flex-wrap gap-2.5 mt-8">
              {['Domain', 'Hosting', 'Business email', 'SEO', 'WhatsApp'].map((t) => (
                <span key={t} className="lw-chip">{t}</span>
              ))}
            </div>
          </div>

          {/* hero visual */}
          <div className="relative lw-float mx-auto w-full max-w-sm">
            <div className="absolute -inset-5 rounded-[2.2rem] blur-2xl opacity-60" style={{ background: 'linear-gradient(135deg,#ff2db5,#8b5cf6,#22d3ee)' }} />
            <div className="relative aspect-[4/5] rounded-[1.6rem] overflow-hidden shadow-2xl ring-1 ring-white/60" style={{ background: 'linear-gradient(135deg,#ff2db5,#8b5cf6,#22d3ee)' }}>
              <img src="/lumina-web-hero.png" alt="Rapha Lumina web design" onError={hideOnError} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: 'linear-gradient(to top,rgba(34,30,24,.6),transparent)' }} />
              <span className="absolute bottom-5 left-5 right-5 font-display text-2xl text-white drop-shadow">
                Wear Your Purpose. Online.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WHAT YOU GET ===================== */}
      <section className="relative bg-white/70 border-y border-rl-espresso/10">
        <div className="container mx-auto px-6 py-20">
          <p className="text-label text-rl-gold mb-3">Everything in one place</p>
          <h2 className="section-title mb-12">What you get</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {features.map(([Icon, title, desc]) => (
              <div key={title} className="group p-6 rounded-2xl bg-rl-cream/60 border border-rl-espresso/10 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-medium">{title}</p>
                <p className="text-rl-muted text-sm mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PACKAGES ===================== */}
      <section className="relative">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[24rem] w-[24rem] rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle,#ff2db5,transparent 70%)' }} />
        <div className="relative container mx-auto px-6 py-20">
          <p className="text-label text-rl-gold mb-3">Simple, honest pricing</p>
          <h2 className="section-title mb-3">Choose a package</h2>
          <p className="text-rl-muted mb-12 max-w-xl">Pick a starting point. Every quote is confirmed once we have read your brief, so you never get a surprise bill.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((p) => (
              <div key={p.name} className={`rounded-2xl ${p.feature ? 'p-[2px]' : ''}`} style={p.feature ? { background: 'linear-gradient(135deg,#ff2db5,#8b5cf6,#22d3ee)' } : {}}>
                <div className={`flex flex-col h-full p-7 rounded-2xl bg-white ${p.feature ? '' : 'border border-rl-espresso/10'} transition-shadow hover:shadow-xl`}>
                  {p.feature && (
                    <span className="self-start text-[0.7rem] font-semibold tracking-wider uppercase text-white px-3 py-1 rounded-full mb-3" style={{ background: 'linear-gradient(90deg,#ff2db5,#8b5cf6)' }}>Most popular</span>
                  )}
                  <h3 className="font-display text-2xl font-light">{p.name}</h3>
                  <p className="font-medium mt-1"><span className="lw-grad-text">{p.price}</span> <span className="text-rl-muted text-sm">{p.note}</span></p>
                  <p className="text-rl-muted text-sm mt-2 mb-5">{p.blurb}</p>
                  <ul className="space-y-2.5 flex-1 mb-7">
                    {p.items.map((it) => (
                      <li key={it} className="flex gap-2.5 text-sm">
                        <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#8b5cf6' }} />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  {p.feature
                    ? <a href="#quote" className="lw-cta justify-center">Get a quote</a>
                    : <a href="#quote" className="btn-outline justify-center">Get a quote</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="bg-white/70 border-y border-rl-espresso/10">
        <div className="container mx-auto px-6 py-20">
          <p className="text-label text-rl-gold mb-3">No surprises</p>
          <h2 className="section-title mb-12">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(([n, title, desc]) => (
              <div key={n}>
                <p className="font-display text-5xl font-light lw-grad-text">{n}</p>
                <p className="font-medium mt-3 mb-1">{title}</p>
                <p className="text-rl-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WORK ===================== */}
      <section id="work" className="relative">
        <div className="pointer-events-none absolute -top-10 right-0 h-80 w-80 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle,#22d3ee,transparent 70%)' }} />
        <div className="relative container mx-auto px-6 py-20">
          <p className="text-label text-rl-gold mb-3">A little of our work</p>
          <h2 className="section-title mb-12">Recent builds</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {work.map(([tag, title, desc, href]) => (
              <a
                key={title}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="group block rounded-2xl bg-white border border-rl-espresso/10 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="lw-cardtop" />
                <div className="p-7">
                  <span className="text-label text-rl-gold">{tag}</span>
                  <h3 className="font-display text-2xl font-light mt-1 mb-2">{title}</h3>
                  <p className="text-rl-muted text-sm">{desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== QUOTE FORM ===================== */}
      <section id="quote" className="relative">
        <div className="pointer-events-none absolute inset-0 lw-grid opacity-[0.04]" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-80 w-80 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle,#8b5cf6,transparent 70%)' }} />
        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto rounded-2xl p-[2px]" style={{ background: 'linear-gradient(135deg,#ff2db5,#8b5cf6,#22d3ee)' }}>
            <div className="rounded-2xl bg-white p-8 md:p-12">
              {done ? (
                <div className="text-center py-6">
                  <div className="mx-auto mb-5 h-16 w-16 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="font-display text-3xl font-light mb-2">Thank you</h2>
                  <p className="text-rl-muted">Your enquiry is on its way. We will be in touch shortly. For anything urgent, WhatsApp us on 079 333 0455.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="text-center mb-2">
                    <h2 className="section-title">Let's build yours</h2>
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
                    <Textarea id="message" rows={4} value={form.message} onChange={set('message')} placeholder="What does your business do, and what do you need from the website?" />
                  </div>

                  <div className="border-t border-rl-espresso/10 pt-5">
                    <p className="text-label text-rl-muted mb-3">Your logo</p>
                    <div className="space-y-3">
                      {logoOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex gap-3 items-start p-3.5 rounded-xl border cursor-pointer transition-colors ${
                            logoChoice === opt.value ? 'border-transparent bg-[#8b5cf6]/8 ring-1 ring-[#8b5cf6]/40' : 'border-rl-espresso/15 hover:border-[#8b5cf6]/50'
                          }`}
                        >
                          <input type="radio" name="logo" value={opt.value} checked={logoChoice === opt.value} onChange={() => setLogoChoice(opt.value)} className="mt-1" style={{ accentColor: '#8b5cf6' }} />
                          <span>
                            <span className="block font-medium text-sm">{opt.title}</span>
                            <span className="block text-rl-muted text-sm">{opt.desc}</span>
                          </span>
                        </label>
                      ))}
                    </div>

                    {logoChoice === 'have' && (
                      <label className="mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-5 text-center cursor-pointer" style={{ borderColor: 'rgba(139,92,246,.5)', background: 'rgba(139,92,246,.05)' }}>
                        <Upload className="h-5 w-5" style={{ color: '#8b5cf6' }} />
                        <span className="text-sm text-rl-muted">
                          {logoFile ? `Selected: ${logoFile.name}` : 'Click to upload your logo (PNG, JPG, SVG or PDF, up to 5MB)'}
                        </span>
                        <input type="file" accept=".png,.jpg,.jpeg,.svg,.pdf" onChange={onFile} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="text-center pt-2">
                    <button type="submit" disabled={loading} className="lw-cta justify-center min-w-56">
                      {loading ? 'Sending...' : <>Send my enquiry <ArrowRight className="h-4 w-4" /></>}
                    </button>
                    <p className="text-rl-muted text-xs mt-3">
                      Or WhatsApp us directly on{' '}
                      <a href="https://wa.me/27793330455" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6' }}>079 333 0455</a>.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
