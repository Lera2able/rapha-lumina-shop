import { useState, useEffect } from 'react';
import {
  Upload, Check, ArrowRight, Sparkles, Globe, Smartphone,
  Server, Mail, MessageCircle, Search,
} from 'lucide-react';
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
  ['01', Globe, 'Your own domain', 'yourbusiness.co.za, registered and pointed for you.'],
  ['02', Smartphone, 'Mobile-first build', 'Razor sharp on every phone, tablet and laptop.'],
  ['03', Server, '12 months hosting', 'Fast, secure and live all year. Zero setup for you.'],
  ['04', Mail, 'Business email', 'A professional address on your own domain.'],
  ['05', MessageCircle, 'Click-to-WhatsApp', 'Turn a visitor into a chat with a single tap.'],
  ['06', Search, 'Found on Google', 'The search foundations done properly, day one.'],
] as const;

const packages = [
  {
    name: 'Starter', price: 'R3 950', note: 'once-off', feature: false,
    blurb: 'Getting online for the first time.',
    items: ['Up to 5 pages', 'Domain + 12 months hosting', 'One business email', 'Enquiry form to your inbox', 'Live in roughly a week'],
  },
  {
    name: 'Business', price: 'R6 500', note: 'once-off', feature: true,
    blurb: 'For a brand that wants to look unmissable.',
    items: ['Up to 8 pages', 'Everything in Starter', 'Services / gallery sections', 'Click-to-WhatsApp', 'Google Maps + SEO'],
  },
  {
    name: 'Care Plan', price: 'R150', note: 'per month', feature: false,
    blurb: 'Keeps it live, safe and current.',
    items: ['Hosting + domain renewal', 'Monthly edits', 'Backups + updates', 'Priority support', 'Cancel any time'],
  },
];

const steps = [
  ['01', 'Send your brief', 'Tell us about your business in the form below.'],
  ['02', 'Pay a deposit', 'Half to start, balance when you are happy to launch.'],
  ['03', 'We build it', 'We design and build around your logo, fast.'],
  ['04', 'Launch + glow', 'We hand it over and keep it running.'],
];

export default function WebDesignPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', business: '', message: '' });
  const [logoChoice, setLogoChoice] = useState<LogoChoice>('have');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // load the tech fonts once
  useEffect(() => {
    const id = 'lw-fonts';
    if (!document.getElementById(id)) {
      const l = document.createElement('link');
      l.id = id;
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';
      document.head.appendChild(l);
    }
  }, []);

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
    { value: 'have', title: 'I already have a logo', desc: 'Upload it and we will design around it.' },
    { value: 'make', title: 'Design one for me', desc: 'We can create a logo from R750 extra.' },
    { value: 'unsure', title: 'Not sure yet', desc: 'No problem, let us chat about it.' },
  ];

  return (
    <div className="lw-root">
      <PageMeta
        title="Websites by Rapha Lumina | Want a beautiful website?"
        description="Bold, glowing, modern websites for South African businesses. Domain, hosting, email and SEO, all sorted by Rapha Lumina."
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        @keyframes lw-grad { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes lw-spin { to { transform:rotate(360deg) } }
        @keyframes lw-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes lw-pulse { 0%,100%{opacity:.55} 50%{opacity:1} }

        .lw-root{ position:relative; overflow:hidden; background:#08070f; color:#ECEAF5;
          font-family:'Space Grotesk',system-ui,sans-serif; }
        .lw-root::before{ content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image:linear-gradient(rgba(140,120,255,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(140,120,255,.35) 1px,transparent 1px);
          background-size:48px 48px; opacity:.07; }
        .lw-wrap{ position:relative; z-index:1; max-width:1120px; margin:0 auto; padding:0 24px; }

        .lw-display{ font-family:'Space Grotesk',sans-serif; font-weight:700; letter-spacing:-.02em; line-height:1.05; }
        .lw-mono{ font-family:'Space Mono',ui-monospace,monospace; }
        .lw-eyebrow{ font-family:'Space Mono',monospace; font-size:.72rem; letter-spacing:.22em; text-transform:uppercase; color:#22e0ff; text-shadow:0 0 16px rgba(34,224,255,.5); }
        .lw-kicker{ font-family:'Space Mono',monospace; font-size:.72rem; letter-spacing:.22em; text-transform:uppercase; color:#ff3db5; }
        .lw-muted{ color:#a39fc4; }

        .lw-grad{ background:linear-gradient(90deg,#ff2d9b,#8b5cf6,#22e0ff,#f5b73c); -webkit-background-clip:text; background-clip:text; color:transparent; background-size:240% 240%; animation:lw-grad 8s ease infinite; filter:drop-shadow(0 0 22px rgba(139,92,246,.45)); }
        .lw-glow-w{ color:#fff; text-shadow:0 0 26px rgba(34,224,255,.6),0 0 54px rgba(34,224,255,.3); }

        .lw-blob{ position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; z-index:0; }

        .lw-cta{ display:inline-flex; align-items:center; gap:.55rem; padding:.95rem 1.8rem; border-radius:999px; color:#fff; font-weight:600; font-family:'Space Grotesk',sans-serif;
          background:linear-gradient(90deg,#ff2d9b,#8b5cf6,#22e0ff); background-size:220% 220%; animation:lw-grad 7s ease infinite;
          box-shadow:0 0 26px rgba(139,92,246,.55),0 0 50px rgba(255,45,155,.3); transition:transform .18s ease, box-shadow .18s ease; border:none; cursor:pointer; }
        .lw-cta:hover{ transform:translateY(-2px); box-shadow:0 0 34px rgba(255,45,155,.7),0 0 70px rgba(139,92,246,.45); }
        .lw-cta:disabled{ opacity:.65; cursor:default; transform:none; }
        .lw-ghost{ display:inline-flex; align-items:center; gap:.5rem; padding:.95rem 1.7rem; border-radius:999px; font-weight:600; color:#ECEAF5;
          background:rgba(255,255,255,.04); border:1px solid rgba(140,120,255,.4); transition:.18s; }
        .lw-ghost:hover{ border-color:#22e0ff; color:#fff; box-shadow:0 0 22px rgba(34,224,255,.35); }

        .lw-chip{ display:inline-flex; align-items:center; gap:.4rem; font-family:'Space Mono',monospace; font-size:.7rem; letter-spacing:.08em; text-transform:uppercase; padding:.42rem .75rem; border-radius:999px; background:rgba(255,255,255,.04); border:1px solid rgba(140,120,255,.3); color:#cfc9f5; }

        .lw-panel{ position:relative; background:rgba(255,255,255,.035); border:1px solid rgba(140,120,255,.18); border-radius:18px; transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .lw-panel:hover{ transform:translateY(-5px); border-color:rgba(34,224,255,.5); box-shadow:0 0 30px rgba(34,224,255,.18); }
        .lw-iconbox{ height:46px; width:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#fff; border:1px solid rgba(255,255,255,.2); background:rgba(139,92,246,.18); box-shadow:0 0 22px rgba(139,92,246,.4); }

        .lw-input{ width:100%; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.14); border-radius:.65rem; padding:.72rem .9rem; color:#ECEAF5; font-family:'Space Grotesk',sans-serif; font-size:.95rem; outline:none; transition:border-color .15s, box-shadow .15s; }
        .lw-input::placeholder{ color:#6f6b8c; }
        .lw-input:focus{ border-color:#8b5cf6; box-shadow:0 0 0 3px rgba(139,92,246,.22),0 0 18px rgba(139,92,246,.4); }
        textarea.lw-input{ min-height:110px; resize:vertical; }
        .lw-lbl{ display:block; font-family:'Space Mono',monospace; font-size:.66rem; letter-spacing:.16em; text-transform:uppercase; color:#a39fc4; margin-bottom:.4rem; }

        .lw-orbwrap{ position:relative; width:300px; height:300px; margin:0 auto; }
        .lw-ring{ position:absolute; inset:0; border-radius:50%; background:conic-gradient(from 0deg,#ff2d9b,#8b5cf6,#22e0ff,#f5b73c,#ff2d9b); animation:lw-spin 9s linear infinite;
          -webkit-mask:radial-gradient(farthest-side,transparent 63%,#000 65%); mask:radial-gradient(farthest-side,transparent 63%,#000 65%); filter:drop-shadow(0 0 18px rgba(139,92,246,.6)); }
        .lw-core{ position:absolute; inset:19%; border-radius:50%; background:radial-gradient(circle at 35% 28%,#ffffff,#ff2d9b 32%,#8b5cf6 72%,#1a1340 100%); box-shadow:0 0 70px rgba(139,92,246,.7),0 0 130px rgba(255,45,155,.45) inset; }
        .lw-dot{ position:absolute; border-radius:50%; background:#22e0ff; box-shadow:0 0 12px #22e0ff; animation:lw-pulse 3s ease-in-out infinite; }
      `}</style>

      {/* ===================== HERO ===================== */}
      <section className="relative">
        <div className="lw-blob" style={{ top: '-80px', right: '-40px', height: '24rem', width: '24rem', background: '#ff2d9b', opacity: .35 }} />
        <div className="lw-blob" style={{ top: '120px', left: '-90px', height: '22rem', width: '22rem', background: '#22e0ff', opacity: .28 }} />
        <div className="lw-blob" style={{ bottom: '-60px', left: '40%', height: '20rem', width: '20rem', background: '#8b5cf6', opacity: .3 }} />

        <div className="lw-wrap grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-28">
          <div>
            <span className="lw-chip"><Sparkles className="h-3.5 w-3.5" /> Rapha Lumina Web Studio</span>
            <h1 className="lw-display mt-6" style={{ fontSize: 'clamp(2.6rem,6vw,4.8rem)' }}>
              Want a <span className="lw-glow-w">beautiful</span> website?
              <span className="lw-grad" style={{ display: 'block', marginTop: '.4rem' }}>We've got you covered.</span>
            </h1>
            <p className="lw-muted mt-6 max-w-xl" style={{ fontSize: '1.08rem', lineHeight: 1.7 }}>
              Bold, modern websites for South African businesses, engineered to make you look
              unmissable online. Domain, hosting, email and the whole tech stack, handled by us.
            </p>
            <div className="flex flex-wrap gap-4 mt-9">
              <a href="#quote" className="lw-cta">Get my website <ArrowRight className="h-4 w-4" /></a>
              <a href="#packages" className="lw-ghost">View packages</a>
            </div>
            <div className="flex flex-wrap gap-2.5 mt-9">
              {['Domain', 'Hosting', 'Email', 'SEO', 'WhatsApp'].map((t) => (
                <span key={t} className="lw-chip">{t}</span>
              ))}
            </div>
          </div>

          {/* glowing core (pure CSS, no image needed) */}
          <div className="lw-float" style={{ animation: 'lw-float 7s ease-in-out infinite' }}>
            <div className="lw-orbwrap">
              <div className="lw-ring" />
              <div className="lw-core" />
              <span className="lw-dot" style={{ top: '8%', left: '14%', height: 8, width: 8 }} />
              <span className="lw-dot" style={{ bottom: '12%', right: '10%', height: 10, width: 10, animationDelay: '1s' }} />
              <span className="lw-dot" style={{ top: '46%', right: '-6%', height: 6, width: 6, animationDelay: '1.8s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WHAT YOU GET ===================== */}
      <section className="relative border-t" style={{ borderColor: 'rgba(140,120,255,.14)' }}>
        <div className="lw-wrap py-20">
          <p className="lw-kicker mb-3">// What you get</p>
          <h2 className="lw-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>The whole stack, sorted</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {features.map(([num, Icon, title, desc]) => (
              <div key={title} className="lw-panel p-6">
                <div className="flex items-center justify-between">
                  <div className="lw-iconbox"><Icon className="h-5 w-5" /></div>
                  <span className="lw-mono" style={{ color: '#4d4870', fontSize: '.95rem' }}>{num}</span>
                </div>
                <p className="lw-display mt-5" style={{ fontSize: '1.18rem', fontWeight: 600 }}>{title}</p>
                <p className="lw-muted text-sm mt-1.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PACKAGES ===================== */}
      <section id="packages" className="relative border-t" style={{ borderColor: 'rgba(140,120,255,.14)' }}>
        <div className="lw-blob" style={{ top: '30%', left: '50%', height: '22rem', width: '22rem', background: '#ff2d9b', opacity: .16 }} />
        <div className="lw-wrap py-20">
          <p className="lw-kicker mb-3">// Pricing</p>
          <h2 className="lw-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Pick your package</h2>
          <p className="lw-muted mt-3 max-w-xl">Every quote is confirmed once we have read your brief. No surprise bills, ever.</p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {packages.map((p) => (
              <div key={p.name} className={p.feature ? 'rounded-[19px] p-[1.5px]' : ''} style={p.feature ? { background: 'linear-gradient(135deg,#ff2d9b,#8b5cf6,#22e0ff)', boxShadow: '0 0 36px rgba(139,92,246,.4)' } : {}}>
                <div className="lw-panel h-full p-7 flex flex-col" style={p.feature ? { background: '#0d0b1c' } : {}}>
                  {p.feature && <span className="lw-mono self-start mb-3" style={{ fontSize: '.62rem', letterSpacing: '.14em', textTransform: 'uppercase', color: '#08070f', background: 'linear-gradient(90deg,#ff2d9b,#22e0ff)', padding: '.25rem .6rem', borderRadius: '999px', fontWeight: 700 }}>Most popular</span>}
                  <p className="lw-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{p.name}</p>
                  <p className="mt-2"><span className="lw-grad lw-display" style={{ fontSize: '2rem' }}>{p.price}</span> <span className="lw-muted lw-mono text-xs">{p.note}</span></p>
                  <p className="lw-muted text-sm mt-2 mb-5">{p.blurb}</p>
                  <ul className="space-y-2.5 flex-1 mb-7">
                    {p.items.map((it) => (
                      <li key={it} className="flex gap-2.5 text-sm">
                        <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#22e0ff' }} />
                        <span style={{ color: '#cfc9f5' }}>{it}</span>
                      </li>
                    ))}
                  </ul>
                  {p.feature ? <a href="#quote" className="lw-cta justify-center">Get a quote</a> : <a href="#quote" className="lw-ghost justify-center">Get a quote</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="relative border-t" style={{ borderColor: 'rgba(140,120,255,.14)' }}>
        <div className="lw-wrap py-20">
          <p className="lw-kicker mb-3">// Process</p>
          <h2 className="lw-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>From idea to live</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {steps.map(([n, title, desc]) => (
              <div key={n}>
                <p className="lw-grad lw-display" style={{ fontSize: '3rem' }}>{n}</p>
                <p className="lw-display mt-2 mb-1" style={{ fontSize: '1.18rem', fontWeight: 600 }}>{title}</p>
                <p className="lw-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== QUOTE FORM ===================== */}
      <section id="quote" className="relative border-t" style={{ borderColor: 'rgba(140,120,255,.14)' }}>
        <div className="lw-blob" style={{ bottom: '-40px', left: '10%', height: '22rem', width: '22rem', background: '#8b5cf6', opacity: .25 }} />
        <div className="lw-blob" style={{ top: '-20px', right: '5%', height: '18rem', width: '18rem', background: '#22e0ff', opacity: .18 }} />
        <div className="lw-wrap py-20">
          <div className="max-w-2xl mx-auto rounded-[19px] p-[1.5px]" style={{ background: 'linear-gradient(135deg,#ff2d9b,#8b5cf6,#22e0ff)', boxShadow: '0 0 40px rgba(139,92,246,.35)' }}>
            <div className="rounded-[18px] p-8 md:p-12" style={{ background: '#0c0a1a' }}>
              {done ? (
                <div className="text-center py-6">
                  <div className="mx-auto mb-5 h-16 w-16 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#8b5cf6,#22e0ff)', boxShadow: '0 0 30px rgba(34,224,255,.5)' }}>
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="lw-display" style={{ fontSize: '1.9rem' }}>Thank you</h2>
                  <p className="lw-muted mt-2">Your enquiry is on its way. We will be in touch shortly. For anything urgent, WhatsApp us on 079 333 0455.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="text-center mb-2">
                    <p className="lw-eyebrow mb-2">// Start your project</p>
                    <h2 className="lw-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)' }}>Let's build yours</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="lw-lbl" htmlFor="name">Name</label>
                      <input id="name" className="lw-input" value={form.name} onChange={set('name')} placeholder="Your full name" required />
                    </div>
                    <div>
                      <label className="lw-lbl" htmlFor="email">Email address</label>
                      <input id="email" type="email" className="lw-input" value={form.email} onChange={set('email')} placeholder="you@email.com" required />
                    </div>
                    <div>
                      <label className="lw-lbl" htmlFor="phone">Contact number</label>
                      <input id="phone" type="tel" className="lw-input" value={form.phone} onChange={set('phone')} placeholder="Call or WhatsApp" required />
                    </div>
                    <div>
                      <label className="lw-lbl" htmlFor="business">Business name</label>
                      <input id="business" className="lw-input" value={form.business} onChange={set('business')} placeholder="Your business or project" />
                    </div>
                  </div>

                  <div>
                    <label className="lw-lbl" htmlFor="message">Message</label>
                    <textarea id="message" rows={4} className="lw-input" value={form.message} onChange={set('message')} placeholder="What does your business do, and what do you need from the website?" />
                  </div>

                  <div className="pt-4" style={{ borderTop: '1px solid rgba(140,120,255,.16)' }}>
                    <p className="lw-lbl">Your logo</p>
                    <div className="space-y-3">
                      {logoOptions.map((opt) => {
                        const active = logoChoice === opt.value;
                        return (
                          <label key={opt.value} className="flex gap-3 items-start p-3.5 rounded-xl cursor-pointer transition-all"
                            style={{ border: active ? '1px solid rgba(34,224,255,.55)' : '1px solid rgba(255,255,255,.12)', background: active ? 'rgba(34,224,255,.06)' : 'transparent', boxShadow: active ? '0 0 20px rgba(34,224,255,.18)' : 'none' }}>
                            <input type="radio" name="logo" value={opt.value} checked={active} onChange={() => setLogoChoice(opt.value)} className="mt-1" style={{ accentColor: '#22e0ff' }} />
                            <span>
                              <span className="block lw-display text-sm" style={{ fontWeight: 600 }}>{opt.title}</span>
                              <span className="block lw-muted text-sm">{opt.desc}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {logoChoice === 'have' && (
                      <label className="mt-3 flex flex-col items-center justify-center gap-2 rounded-xl p-5 text-center cursor-pointer"
                        style={{ border: '1px dashed rgba(34,224,255,.45)', background: 'rgba(34,224,255,.04)' }}>
                        <Upload className="h-5 w-5" style={{ color: '#22e0ff' }} />
                        <span className="lw-muted text-sm">{logoFile ? `Selected: ${logoFile.name}` : 'Click to upload your logo (PNG, JPG, SVG or PDF, up to 5MB)'}</span>
                        <input type="file" accept=".png,.jpg,.jpeg,.svg,.pdf" onChange={onFile} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="text-center pt-2">
                    <button type="submit" disabled={loading} className="lw-cta justify-center" style={{ minWidth: '15rem' }}>
                      {loading ? 'Sending...' : <>Send my enquiry <ArrowRight className="h-4 w-4" /></>}
                    </button>
                    <p className="lw-muted text-xs mt-3">Or WhatsApp us directly on <a href="https://wa.me/27793330455" target="_blank" rel="noopener noreferrer" style={{ color: '#22e0ff' }}>079 333 0455</a>.</p>
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
