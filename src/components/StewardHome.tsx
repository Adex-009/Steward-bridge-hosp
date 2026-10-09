'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BriefcaseBusiness, Building2, Check, ChevronDown,
  ChevronRight, CirclePlay, Globe2, MapPin, Menu, MessageCircle,
  Search, ShieldCheck, Sparkles, Users, UserRound, X
} from 'lucide-react';

const opportunities = [
  { title: 'Front Office Supervisor', organization: 'The Meridian Lagos', location: 'Victoria Island, Lagos', type: 'Full-time', pay: '₦280k–₦350k', tag: 'Hospitality' },
  { title: 'Operations Assistant', organization: 'Growing Services Co.', location: 'Ikeja, Lagos', type: 'Full-time', pay: '₦180k–₦240k', tag: 'Operations' },
  { title: 'Customer Support Associate', organization: 'Digital Commerce Hub', location: 'Remote / Lagos', type: 'Full-time', pay: '₦160k–₦220k', tag: 'Customer Service' },
  { title: 'Event & Guest Experience Lead', organization: 'Creative Events Group', location: 'Lekki, Lagos', type: 'Contract', pay: '₦200k–₦300k', tag: 'Events' },
];

const heroImages = [
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2000&q=88',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2000&q=88',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=2000&q=88',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=2000&q=88',
];

const images = {
  team: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=88',
  people: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=88',
  work: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=88',
};

export default function StewardHome() {
  const [menu, setMenu] = useState(false);
  const [role, setRole] = useState<'talent' | 'organization'>('talent');
  const [query, setQuery] = useState('');
  const [videoOpen, setVideoOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chat, setChat] = useState('');
  const [slide, setSlide] = useState(0);
  const [cinematic, setCinematic] = useState(true);
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi — I’m the StewardBridge Assistant. I can help you find opportunities, register an organization, or explain how staffing works.' }
  ]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return opportunities;
    return opportunities.filter(j => `${j.title} ${j.organization} ${j.location} ${j.tag}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const saved = window.localStorage.getItem('sb-cinematic');
    if (saved !== null) setCinematic(saved !== 'off');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.cinematic = cinematic ? 'on' : 'off';
    window.localStorage.setItem('sb-cinematic', cinematic ? 'on' : 'off');
  }, [cinematic]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.sb-reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty('--mx', `${event.clientX}px`);
      document.documentElement.style.setProperty('--my', `${event.clientY}px`);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => window.removeEventListener('pointermove', onPointer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide(v => (v + 1) % heroImages.length), 5200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(false); setVideoOpen(false); setChatOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sendChat = () => {
    if (!chat.trim()) return;
    const text = chat.trim();
    setMessages(m => [...m, { from: 'user', text }, {
      from: 'ai',
      text: /register|organization|staff|hire/i.test(text)
        ? 'Absolutely. An organization can register its name, what it does, where it operates and the kind of staff it needs. StewardBridge then organizes that request into the staffing process.'
        : /job|work|opportun/i.test(text)
          ? 'You can search opportunities by role, organization, category or location. When the live platform is connected, these results will come from the real database.'
          : 'I can help with opportunities, organization registration, staffing requests, applications and getting started.'
    }]);
    setChat('');
  };

  return (
    <div className={`sb-site ${cinematic ? "cinematic-on" : "cinematic-off"}`}>
      <header className="sb-nav">
        <a className="sb-brand" href="#top"><span className="sb-mark"><span>SB</span></span><span><strong>STEWARD</strong><em>BRIDGE</em></span></a>
        <nav className={`sb-links ${menu ? 'open' : ''}`}>
          <a href="#opportunities" onClick={() => setMenu(false)}>Find work</a>
          <a href="#organizations" onClick={() => setMenu(false)}>For organizations</a>
          <a href="#how-it-works" onClick={() => setMenu(false)}>How it works</a>
          <a href="#about" onClick={() => setMenu(false)}>About</a>
        </nav>
        <div className="sb-nav-actions">
          <a className="sb-login" href="/auth/sign-in">Sign in</a>
          <a className="sb-nav-cta" href="#start">Get started <ArrowRight size={16}/></a>
          <button className={`sb-cinematic-toggle ${cinematic ? "active" : ""}`} onClick={() => setCinematic(v => !v)} aria-pressed={cinematic} title="Toggle cinematic effects"><Sparkles size={14}/><span>{cinematic ? "Cinematic" : "Calm"}</span></button>
          <button className="sb-menu" onClick={() => setMenu(v => !v)} aria-label="Menu">{menu ? <X/> : <Menu/>}</button>
        </div>
      </header>

      <main id="top">
        <section className="sb-hero">
          <div className="sb-hero-media" aria-hidden="true">
            <video className="sb-hero-video" autoPlay muted loop playsInline poster={heroImages[0]}>
              <source src="https://cdn.coverr.co/videos/coverr-aerial-view-of-beautiful-resort-4739/1080p.mp4" type="video/mp4" />
            </video>
            {heroImages.map((src, i) => <div key={src} className={`sb-hero-slide ${slide === i ? 'active' : ''}`} style={{ backgroundImage: `url(${src})` }} />)}
            <div className="sb-hero-shade" />
            <div className="sb-hero-light" />
            <div className="sb-hero-grain" />
          </div>
          <div className="sb-hero-content">
            <div className="sb-kicker"><span className="pulse-dot" /> PEOPLE. ORGANIZATIONS. OPPORTUNITY.</div>
            <h1>Where people find<br/><span>the work that fits.</span></h1>
            <p>StewardBridge connects people looking for meaningful work with organizations looking for the right people — across hospitality, services, business, operations and beyond.</p>
            <div className="sb-hero-actions">
              <a className="sb-btn gold" href="#opportunities">Find opportunities <ArrowRight size={18}/></a>
              <a className="sb-btn glass" href="#organizations">I need staff <Building2 size={18}/></a>
            </div>
            <div className="sb-trust-row">
              <div><strong>01</strong><span>For people</span></div>
              <div><strong>02</strong><span>For organizations</span></div>
              <div><strong>03</strong><span>For every industry</span></div>
            </div>
          </div>
          <div className="sb-hero-dots">{heroImages.map((_, i) => <button key={i} className={slide === i ? 'active' : ''} onClick={() => setSlide(i)} aria-label={`Show scene ${i + 1}`} />)}</div>
          <button className="sb-video-button" onClick={() => setVideoOpen(true)}><CirclePlay size={23}/><span>Watch the vision</span></button>
          <div className="sb-scroll">SCROLL TO EXPLORE <ChevronDown size={15}/></div>
        </section>

        <section className="sb-proof sb-reveal"><div><span>One bridge for people, organizations and the work between them.</span></div><div className="proof-items"><span><ShieldCheck size={16}/> Human-led</span><span><Globe2 size={16}/> Built to scale</span><span><Sparkles size={16}/> Industry-flexible</span></div></section>

        <section className="sb-section sb-intro sb-reveal" id="about">
          <div className="sb-section-label">01 — THE BRIDGE</div>
          <div className="sb-intro-grid"><div><h2>Not just a job board. A bridge between <i>people and need.</i></h2></div><div><p className="sb-lead">A person should be able to say what they can do and what they are looking for. An organization should be able to say who they are, what they do and what kind of staff they need. StewardBridge brings both sides into one structured system.</p><a className="sb-text-link" href="#how-it-works">See how it works <ArrowRight size={16}/></a></div></div>
          <div className="sb-stat-strip"><div><b>01</b><span>People can create professional profiles</span></div><div><b>02</b><span>Organizations can register their workforce needs</span></div><div><b>∞</b><span>Any industry. Any organization. Any opportunity.</span></div></div>
        </section>

        <section className="sb-section sb-opportunities sb-reveal" id="opportunities">
          <div className="sb-section-head"><div><div className="sb-section-label">02 — OPPORTUNITIES</div><h2>Work is bigger than one industry.</h2></div><a className="sb-text-link" href="/workspace/jobs">Explore all opportunities <ArrowRight size={16}/></a></div>
          <div className="sb-searchbar"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs, organizations, skills or locations…"/><span>Search</span></div>
          <div className="sb-category-row"><span>Hospitality</span><span>Operations</span><span>Customer Service</span><span>Events</span><span>Administration</span><span>More industries</span></div>
          <div className="sb-jobs">{filtered.map((job, i) => <a href="/workspace/jobs" className="sb-job" key={job.title}><div className="job-index">0{i + 1}</div><div className="job-main"><span className="job-tag">{job.tag}</span><h3>{job.title}</h3><p>{job.organization}</p><div className="job-meta"><span><MapPin size={14}/>{job.location}</span><span><BriefcaseBusiness size={14}/>{job.type}</span></div></div><div className="job-side"><b>{job.pay}</b><span>View opportunity <ArrowRight size={15}/></span></div></a>)}</div>
          {filtered.length === 0 && <div className="sb-empty">No matching opportunity in this preview. Try another keyword, industry or location.</div>}
        </section>

        <section className="sb-section sb-split sb-reveal" id="organizations">
          <div className="sb-photo-card"><div className="sb-photo-stack"><img src={images.team} alt="People collaborating"/><img src={images.people} alt="Professional team"/><img src={images.work} alt="Workplace collaboration"/></div><div className="sb-photo-caption"><span>For every organization</span><strong>Tell us what you do. Tell us who you need.</strong></div></div>
          <div className="sb-split-copy"><div className="sb-section-label">03 — FOR ORGANIZATIONS</div><h2>Register your organization.<br/><span>Build your team.</span></h2><p>Whether you run a hotel, school, restaurant, agency, shop, startup, office, event company or any other organization, StewardBridge gives you a place to explain your work and request the people you need.</p><ul><li><Check size={17}/> Register your organization and what you do</li><li><Check size={17}/> Tell us the roles, skills and number of staff you need</li><li><Check size={17}/> Receive and manage people through one structured process</li></ul><a className="sb-btn dark" href="/auth/sign-in">Register an organization <ArrowRight size={17}/></a></div>
        </section>

        <section className="sb-section sb-process sb-reveal" id="how-it-works"><div className="sb-section-head centered"><div className="sb-section-label">04 — HOW IT WORKS</div><h2>Start with who you are.</h2><p>Then StewardBridge handles the bridge between your need and the right next step.</p></div><div className="sb-process-grid">{[['01','Create your profile','People tell us who they are, what they can do, where they want to work and what kind of opportunity they want.'],['02','Register your organization','Organizations tell us their name, what they do, where they operate and exactly what staff they need.'],['03','Connect the need','Jobs, staffing requests and applications move through one structured platform, with human support where needed.']].map(([n,t,d]) => <div className="sb-process-card" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p><ChevronRight/></div>)}</div></section>

        <section className="sb-section sb-vision sb-reveal"><div className="sb-vision-image"><img src={images.work} alt="Professional workplace"/></div><div className="sb-vision-copy"><div className="sb-section-label">05 — THE VISION</div><h2>A professional bridge for <i>real-world work.</i></h2><p>StewardBridge is designed to grow beyond one category. Hospitality is part of the story — not the boundary. The goal is a trusted workforce network where people and organizations can find each other, explain what they need and move forward.</p><div className="sb-mini-proof"><UserRound size={19}/><span><strong>People first.</strong> Technology second. Better matches always.</span></div></div></section>

        <section className="sb-start sb-reveal" id="start"><div className="sb-start-orb"/><div className="sb-section-label">06 — START HERE</div><h2>What brings you<br/><span>to StewardBridge?</span></h2><div className="sb-role-switch"><button className={role === 'talent' ? 'active' : ''} onClick={() => setRole('talent')}><Users/><div><small>I am</small><strong>Looking for work</strong></div><ArrowRight/></button><button className={role === 'organization' ? 'active' : ''} onClick={() => setRole('organization')}><Building2/><div><small>I am an</small><strong>Organization that needs staff</strong></div><ArrowRight/></button></div><a className="sb-btn gold start-btn" href="/auth/sign-in">{role === 'talent' ? 'Create my profile' : 'Register my organization'} <ArrowRight size={18}/></a></section>
      </main>

      <footer className="sb-footer"><div className="footer-brand"><a className="sb-brand" href="#top"><span className="sb-mark"><span>SB</span></span><span><strong>STEWARD</strong><em>BRIDGE</em></span></a><p>A workforce bridge connecting people with organizations across industries.</p></div><div className="footer-links"><div><b>Explore</b><a href="#opportunities">Find work</a><a href="#organizations">For organizations</a><a href="#how-it-works">How it works</a></div><div><b>Account</b><a href="/auth/sign-in">Sign in</a><a href="/auth/sign-in">Get started</a><a href="/contact">Contact</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} StewardBridge. All rights reserved.</span><span>Built around people and opportunity.</span></div></footer>

      <button className="sb-ai-fab" onClick={() => setChatOpen(v => !v)}><MessageCircle size={19}/><span>Ask StewardBridge</span></button>
      {chatOpen && <div className="sb-chat"><div className="chat-head"><div><strong>StewardBridge Assistant</strong><small>Opportunities • Organizations • Staffing</small></div><button onClick={() => setChatOpen(false)}><X/></button></div><div className="chat-body">{messages.map((m,i) => <div className={`chat-bubble ${m.from}`} key={i}>{m.text}</div>)}</div><div className="chat-input"><input value={chat} onChange={e => setChat(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Ask about work or staffing…"/><button onClick={sendChat}><ArrowRight/></button></div></div>}
      {videoOpen && <div className="sb-modal" onClick={() => setVideoOpen(false)}><div className="sb-video-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setVideoOpen(false)}><X/></button><video autoPlay controls playsInline poster={heroImages[0]}><source src="https://cdn.coverr.co/videos/coverr-aerial-view-of-beautiful-resort-4739/1080p.mp4" type="video/mp4"/></video></div></div>}
    </div>
  );
}
