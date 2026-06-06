import { useState, useEffect, useRef } from 'react';
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
  [Globe, '#ff2d9b', 'Your own domain', 'yourbusiness.co.za, registered for you.'],
  [Smartphone, '#22e0ff', 'Mobile-first build', 'Razor sharp on every screen.'],
  [Server, '#8b5cf6', '12 months hosting', 'Fast and live all year, zero setup.'],
  [Mail, '#f5b73c', 'Business email', 'A professional address on your domain.'],
  [MessageCircle, '#22e0ff', 'Click-to-WhatsApp', 'Turn a visitor into a chat instantly.'],
  [Search, '#ff2d9b', 'Found on Google', 'Search foundations done right, day one.'],
] as const;

const packages = [
  { name: 'Starter', price: 'R3 950', note: 'once-off', feature: false, blurb: 'Getting online for the first time.', items: ['Up to 5 pages', 'Domain + 12 months hosting', 'One business email', 'Enquiry form to your inbox', 'Live in roughly a week'] },
  { name: 'Business', price: 'R6 500', note: 'once-off', feature: true, blurb: 'For a brand that wants to look unmissable.', items: ['Up to 8 pages', 'Everything in Starter', 'Services / gallery sections', 'Click-to-WhatsApp', 'Google Maps + SEO'] },
  { name: 'Care Plan', price: 'R150', note: 'per month', feature: false, blurb: 'Keeps it live, safe and current.', items: ['Hosting + domain renewal', 'Monthly edits', 'Backups + updates', 'Priority support', 'Cancel any time'] },
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
  const starsRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const id = 'lw-fonts';
    if (!document.getElementById(id)) {
      const l = document.createElement('link');
      l.id = id; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  // cosmic starfield: drifting stars that connect into geometric webs
  useEffect(() => {
    const canvas = starsRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number; t: number; c: string };
    let pts: P[] = [];
    const neon = ['255,45,155', '34,224,255', '245,183,60', '139,92,246'];
    const build = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(120, Math.floor((w * h) / 13000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 0.5, t: Math.random() * Math.PI * 2,
        c: Math.random() < 0.16 ? neon[Math.floor(Math.random() * neon.length)] : '255,255,255',
      }));
    };
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 132) {
            ctx.strokeStyle = 'rgba(150,120,255,' + (1 - d / 132) * 0.2 + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const pt of pts) {
        pt.x += pt.vx; pt.y += pt.vy; pt.t += 0.03;
        if (pt.x < 0) pt.x = w; if (pt.x > w) pt.x = 0;
        if (pt.y < 0) pt.y = h; if (pt.y > h) pt.y = 0;
        const tw = 0.5 + 0.5 * Math.sin(pt.t);
        const glow = pt.c !== '255,255,255';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r * (glow ? 1.6 : 1), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + pt.c + ',' + (glow ? 0.4 + 0.5 * tw : 0.2 + 0.5 * tw) + ')';
        ctx.shadowColor = 'rgba(' + pt.c + ',0.9)';
        ctx.shadowBlur = glow ? 12 : 0;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    };
    build(); frame();
    const onResize = () => build();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 5 * 1024 * 1024) { toast.error('That file is larger than 5MB. Please choose a smaller logo.'); e.target.value = ''; return; }
    setLogoFile(f);
  };

  const hideImg = (e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.opacity = '0'; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) { toast.error('Please add at least your name, email and contact number.'); return; }
    setLoading(true);
    try {
      let logo: { name: string; type: string; base64: string } | null = null;
      if (logoChoice === 'have' && logoFile) logo = { name: logoFile.name, type: logoFile.type || 'application/octet-stream', base64: await fileToBase64(logoFile) };
      const { error } = await supabase.functions.invoke('webDesignEnquiry', {
        body: { name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), business: form.business.trim(), message: form.message.trim(), logoChoice, logo },
      });
      if (error) throw error;
      setDone(true);
      toast.success('Enquiry sent. We will be in touch shortly.');
    } catch (err) {
      console.error('Web design enquiry error:', err);
      toast.error('Something went wrong. Please try again or WhatsApp us on 079 333 0455.');
    } finally { setLoading(false); }
  };

  const logoOptions: { value: LogoChoice; title: string; desc: string }[] = [
    { value: 'have', title: 'I already have a logo', desc: 'Upload it and we will design around it.' },
    { value: 'make', title: 'Design one for me', desc: 'We can create a logo from R750 extra.' },
    { value: 'unsure', title: 'Not sure yet', desc: 'No problem, let us chat about it.' },
  ];

  return (
    <div className="lw-root">
      <PageMeta title="Beautiful Websites | Rapha Lumina Web Studio" description="Bold, glowing, Afrofuturist websites for South African businesses. Domain, hosting, email and SEO, all sorted by Rapha Lumina." />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        @keyframes lw-grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes lw-spin{to{transform:rotate(360deg)}}
        @keyframes lw-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        .lw-root{position:relative;overflow:hidden;color:#ECEAF5;font-family:'Space Grotesk',system-ui,sans-serif;
          background:
            radial-gradient(900px 600px at 78% 8%, rgba(255,45,155,.18), transparent 60%),
            radial-gradient(800px 600px at 12% 30%, rgba(139,92,246,.18), transparent 60%),
            radial-gradient(700px 500px at 60% 90%, rgba(34,224,255,.12), transparent 60%),
            #07060f;}
        .lw-root::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image:linear-gradient(rgba(140,120,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(140,120,255,.4) 1px,transparent 1px);
          background-size:54px 54px;opacity:.05;}
        .lw-wrap{position:relative;z-index:1;max-width:1140px;margin:0 auto;padding:0 24px;}
        .lw-display{font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:-.02em;line-height:1.04;}
        .lw-mono{font-family:'Space Mono',ui-monospace,monospace;}
        .lw-muted{color:#a8a3cc;}
        .lw-eyebrow{font-family:'Space Mono',monospace;font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:#22e0ff;text-shadow:0 0 16px rgba(34,224,255,.5);}
        .lw-kicker{font-family:'Space Mono',monospace;font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:#ff3db5;}
        .lw-gm{background:linear-gradient(100deg,#f5b73c,#ff7ad9 52%,#ff2d9b);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 26px rgba(255,45,155,.4));}
        .lw-spaced{font-family:'Space Mono',monospace;letter-spacing:.42em;text-transform:uppercase;font-size:.8rem;color:#cfc9f5;}
        .lw-cta{display:inline-flex;align-items:center;gap:.55rem;padding:.95rem 1.8rem;border-radius:999px;color:#fff;font-weight:600;
          background:linear-gradient(90deg,#ff2d9b,#8b5cf6,#22e0ff);background-size:220% 220%;animation:lw-grad 7s ease infinite;
          box-shadow:0 0 26px rgba(139,92,246,.55);transition:transform .18s,box-shadow .18s;border:none;cursor:pointer;}
        .lw-cta:hover{transform:translateY(-2px);box-shadow:0 0 36px rgba(255,45,155,.7);}
        .lw-cta:disabled{opacity:.65;cursor:default;transform:none;}
        .lw-out{display:inline-flex;align-items:center;gap:.5rem;padding:.95rem 1.7rem;border-radius:999px;font-weight:600;color:#ECEAF5;background:transparent;border:1.5px solid rgba(245,183,60,.6);transition:.18s;}
        .lw-out:hover{border-color:#f5b73c;color:#fff;box-shadow:0 0 22px rgba(245,183,60,.4);}
        .lw-chip{display:inline-flex;align-items:center;gap:.4rem;font-family:'Space Mono',monospace;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;padding:.42rem .75rem;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(140,120,255,.3);color:#cfc9f5;}
        .lw-panel{position:relative;background:rgba(255,255,255,.035);border:1px solid rgba(140,120,255,.18);border-radius:18px;transition:transform .2s,box-shadow .2s,border-color .2s;}
        .lw-panel:hover{transform:translateY(-5px);border-color:rgba(34,224,255,.5);box-shadow:0 0 30px rgba(34,224,255,.18);}
        .lw-input{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);border-radius:.65rem;padding:.72rem .9rem;color:#ECEAF5;font-family:'Space Grotesk',sans-serif;font-size:.95rem;outline:none;transition:border-color .15s,box-shadow .15s;}
        .lw-input::placeholder{color:#6f6b8c;}
        .lw-input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.22),0 0 18px rgba(139,92,246,.4);}
        textarea.lw-input{min-height:110px;resize:vertical;}
        .lw-lbl{display:block;font-family:'Space Mono',monospace;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:#a8a3cc;margin-bottom:.4rem;}
        /* hero portal portrait */
        .lw-herovis{position:relative;width:min(440px,90%);aspect-ratio:1;margin:0 auto;display:flex;align-items:center;justify-content:center;}
        .lw-portal{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,#ff2d9b,#8b5cf6,#22e0ff,#f5b73c,#ff2d9b);
          -webkit-mask:radial-gradient(farthest-side,transparent 71%,#000 73%);mask:radial-gradient(farthest-side,transparent 71%,#000 73%);animation:lw-spin 16s linear infinite;filter:drop-shadow(0 0 22px rgba(255,45,155,.55));}
        .lw-glow{position:absolute;width:84%;height:84%;border-radius:50%;background:radial-gradient(circle,rgba(255,45,155,.45),transparent 70%);filter:blur(28px);}
        .lw-heroimg{position:relative;width:80%;height:80%;object-fit:cover;object-position:center top;border-radius:50%;border:2px solid rgba(255,255,255,.16);box-shadow:0 0 44px rgba(139,92,246,.5);}
        /* framed images (mission + cta) */
        .lw-frame{position:relative;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 0 50px rgba(139,92,246,.4);aspect-ratio:1/1;background:linear-gradient(135deg,#2a1840,#101030);}
        .lw-frame img{width:100%;height:100%;object-fit:cover;display:block;}
        .lw-stars{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;}
        @keyframes lw-spinc{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
        .lw-sacred{position:fixed;top:50%;left:50%;width:min(125vh,1040px);height:min(125vh,1040px);z-index:0;pointer-events:none;opacity:.07;animation:lw-spinc 120s linear infinite;}
        .lw-tw{position:fixed;width:4px;height:4px;border-radius:50%;background:#fff;z-index:0;pointer-events:none;box-shadow:0 0 10px 2px rgba(255,255,255,.85),0 0 20px 5px rgba(255,45,155,.5);animation:lw-twk 3.6s ease-in-out infinite;}
        @keyframes lw-twk{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:1;transform:scale(1.25)}}
      `}</style>

      {/* cosmic background */}
      <canvas ref={starsRef} className="lw-stars" aria-hidden="true" />
      <svg className="lw-sacred" viewBox="0 0 600 600" aria-hidden="true">
        <defs>
          <linearGradient id="lwsg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f5b73c" />
            <stop offset="0.5" stopColor="#ff2d9b" />
            <stop offset="1" stopColor="#22e0ff" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#lwsg)" strokeWidth="1">
          <circle cx="300" cy="300" r="118" />
          <circle cx="300" cy="300" r="180" />
          <circle cx="300" cy="300" r="246" />
          <polygon points="300,70 491,190 491,410 300,530 109,410 109,190" />
          <path d="M300,80 L487,408 L113,408 Z" />
          <path d="M300,520 L113,192 L487,192 Z" />
        </g>
      </svg>
      <span className="lw-tw" style={{ top: '18%', left: '12%' }} />
      <span className="lw-tw" style={{ top: '64%', left: '7%', animationDelay: '1.2s' }} />
      <span className="lw-tw" style={{ top: '38%', right: '13%', animationDelay: '0.6s' }} />
      <span className="lw-tw" style={{ top: '80%', right: '20%', animationDelay: '1.9s' }} />
      <span className="lw-tw" style={{ top: '8%', right: '34%', animationDelay: '2.5s' }} />

      {/* ===== HERO ===== */}
      <section className="lw-wrap grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-28">
        <div>
          <span className="lw-chip"><Sparkles className="h-3.5 w-3.5" /> Rapha Lumina Web Studio</span>
          <h1 className="lw-display mt-6" style={{ fontSize: 'clamp(3rem,8vw,6rem)' }}>
            <span className="lw-gm">BEAUTIFUL</span><br /><span className="lw-gm">WEBSITES.</span>
          </h1>
          <p className="lw-spaced mt-5">Design &middot; Build &middot; Shine</p>
          <p className="lw-muted mt-6 max-w-xl" style={{ fontSize: '1.08rem', lineHeight: 1.7 }}>
            Want a beautiful website? Rapha Lumina has you covered. Bold, modern sites for South African
            businesses, with the domain, hosting and email all sorted for you.
          </p>
          <div className="flex flex-wrap gap-4 mt-9">
            <a href="#quote" className="lw-cta">Get my website <ArrowRight className="h-4 w-4" /></a>
            <a href="#packages" className="lw-out">View packages</a>
          </div>
        </div>
        <div style={{ animation: 'lw-float 7s ease-in-out infinite' }}>
          <div className="lw-herovis">
            <div className="lw-portal" />
            <div className="lw-glow" />
            <img className="lw-heroimg" src="/web-hero.png" alt="Rapha Lumina" onError={hideImg} />
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU GET ===== */}
      <section className="border-t" style={{ borderColor: 'rgba(140,120,255,.14)' }}>
        <div className="lw-wrap py-20">
          <p className="lw-kicker mb-3">// What you get</p>
          <h2 className="lw-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>The whole stack, sorted</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {features.map(([Icon, colour, title, desc]) => (
              <div key={title} className="lw-panel p-6">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ border: `1px solid ${colour}66`, background: `${colour}1a`, color: colour, boxShadow: `0 0 22px ${colour}55` }}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="lw-display mt-5" style={{ fontSize: '1.18rem', fontWeight: 600 }}>{title}</p>
                <p className="lw-muted text-sm mt-1.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MISSION BAND (image) ===== */}
      <section className="border-t" style={{ borderColor: 'rgba(140,120,255,.14)' }}>
        <div className="lw-wrap py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="lw-frame"><img src="/web-mission.png" alt="Rapha Lumina web design" onError={hideImg} /></div>
          <div>
            <p className="lw-kicker mb-3">// Our promise</p>
            <h2 className="lw-display" style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>
              Your business, <span className="lw-gm">online and glowing.</span>
            </h2>
            <p className="lw-muted mt-5" style={{ lineHeight: 1.75 }}>
              We blend bold, future-facing design with the practical tech a small business actually needs.
              You get a site that looks the part and works the part, so you can get back to your purpose.
            </p>
            <a href="#quote" className="lw-cta mt-8">Start your project <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>

      {/* ===== PACKAGES ===== */}
      <section id="packages" className="border-t" style={{ borderColor: 'rgba(140,120,255,.14)' }}>
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
                  <p className="mt-2"><span className="lw-gm lw-display" style={{ fontSize: '2rem' }}>{p.price}</span> <span className="lw-muted lw-mono text-xs">{p.note}</span></p>
                  <p className="lw-muted text-sm mt-2 mb-5">{p.blurb}</p>
                  <ul className="space-y-2.5 flex-1 mb-7">
                    {p.items.map((it) => (<li key={it} className="flex gap-2.5 text-sm"><Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#22e0ff' }} /><span style={{ color: '#cfc9f5' }}>{it}</span></li>))}
                  </ul>
                  {p.feature ? <a href="#quote" className="lw-cta justify-center">Get a quote</a> : <a href="#quote" className="lw-out justify-center">Get a quote</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="border-t" style={{ borderColor: 'rgba(140,120,255,.14)' }}>
        <div className="lw-wrap py-20">
          <p className="lw-kicker mb-3">// Process</p>
          <h2 className="lw-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>From idea to live</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {steps.map(([n, title, desc]) => (
              <div key={n}>
                <p className="lw-gm lw-display" style={{ fontSize: '3rem' }}>{n}</p>
                <p className="lw-display mt-2 mb-1" style={{ fontSize: '1.18rem', fontWeight: 600 }}>{title}</p>
                <p className="lw-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BAND (image) ===== */}
      <section className="border-t" style={{ borderColor: 'rgba(140,120,255,.14)' }}>
        <div className="lw-wrap py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="lw-kicker mb-3">// Join the glow</p>
            <h2 className="lw-display" style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>Ready to <span className="lw-gm">shine online?</span></h2>
            <p className="lw-muted mt-5" style={{ lineHeight: 1.75 }}>Tell us about your business and we will come back with a quote, usually within a day or two.</p>
            <a href="#quote" className="lw-cta mt-8">Get my website <ArrowRight className="h-4 w-4" /></a>
          </div>
          <div className="lw-frame"><img src="/web-cta.png" alt="Rapha Lumina" onError={hideImg} /></div>
        </div>
      </section>

      {/* ===== QUOTE FORM ===== */}
      <section id="quote" className="border-t" style={{ borderColor: 'rgba(140,120,255,.14)' }}>
        <div className="lw-wrap py-20">
          <div className="max-w-2xl mx-auto rounded-[19px] p-[1.5px]" style={{ background: 'linear-gradient(135deg,#ff2d9b,#8b5cf6,#22e0ff)', boxShadow: '0 0 40px rgba(139,92,246,.35)' }}>
            <div className="rounded-[18px] p-8 md:p-12" style={{ background: '#0c0a1a' }}>
              {done ? (
                <div className="text-center py-6">
                  <div className="mx-auto mb-5 h-16 w-16 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#8b5cf6,#22e0ff)', boxShadow: '0 0 30px rgba(34,224,255,.5)' }}><Check className="h-8 w-8" /></div>
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
                    <div><label className="lw-lbl" htmlFor="name">Name</label><input id="name" className="lw-input" value={form.name} onChange={set('name')} placeholder="Your full name" required /></div>
                    <div><label className="lw-lbl" htmlFor="email">Email address</label><input id="email" type="email" className="lw-input" value={form.email} onChange={set('email')} placeholder="you@email.com" required /></div>
                    <div><label className="lw-lbl" htmlFor="phone">Contact number</label><input id="phone" type="tel" className="lw-input" value={form.phone} onChange={set('phone')} placeholder="Call or WhatsApp" required /></div>
                    <div><label className="lw-lbl" htmlFor="business">Business name</label><input id="business" className="lw-input" value={form.business} onChange={set('business')} placeholder="Your business or project" /></div>
                  </div>
                  <div><label className="lw-lbl" htmlFor="message">Message</label><textarea id="message" rows={4} className="lw-input" value={form.message} onChange={set('message')} placeholder="What does your business do, and what do you need from the website?" /></div>
                  <div className="pt-4" style={{ borderTop: '1px solid rgba(140,120,255,.16)' }}>
                    <p className="lw-lbl">Your logo</p>
                    <div className="space-y-3">
                      {logoOptions.map((opt) => {
                        const active = logoChoice === opt.value;
                        return (
                          <label key={opt.value} className="flex gap-3 items-start p-3.5 rounded-xl cursor-pointer transition-all" style={{ border: active ? '1px solid rgba(34,224,255,.55)' : '1px solid rgba(255,255,255,.12)', background: active ? 'rgba(34,224,255,.06)' : 'transparent', boxShadow: active ? '0 0 20px rgba(34,224,255,.18)' : 'none' }}>
                            <input type="radio" name="logo" value={opt.value} checked={active} onChange={() => setLogoChoice(opt.value)} className="mt-1" style={{ accentColor: '#22e0ff' }} />
                            <span><span className="block lw-display text-sm" style={{ fontWeight: 600 }}>{opt.title}</span><span className="block lw-muted text-sm">{opt.desc}</span></span>
                          </label>
                        );
                      })}
                    </div>
                    {logoChoice === 'have' && (
                      <label className="mt-3 flex flex-col items-center justify-center gap-2 rounded-xl p-5 text-center cursor-pointer" style={{ border: '1px dashed rgba(34,224,255,.45)', background: 'rgba(34,224,255,.04)' }}>
                        <Upload className="h-5 w-5" style={{ color: '#22e0ff' }} />
                        <span className="lw-muted text-sm">{logoFile ? `Selected: ${logoFile.name}` : 'Click to upload your logo (PNG, JPG, SVG or PDF, up to 5MB)'}</span>
                        <input type="file" accept=".png,.jpg,.jpeg,.svg,.pdf" onChange={onFile} className="hidden" />
                      </label>
                    )}
                  </div>
                  <div className="text-center pt-2">
                    <button type="submit" disabled={loading} className="lw-cta justify-center" style={{ minWidth: '15rem' }}>{loading ? 'Sending...' : <>Send my enquiry <ArrowRight className="h-4 w-4" /></>}</button>
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
