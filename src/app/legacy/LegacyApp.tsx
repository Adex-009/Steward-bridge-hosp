'use client';
import { useEffect, useMemo, useState } from 'react';
import { auth, api } from '@/lib/client';

const countries = [
  ['NG', 'Nigeria', '+234', ['Lagos', 'Abuja', 'Rivers']],
  ['GH', 'Ghana', '+233', ['Greater Accra', 'Ashanti', 'Central']],
  [
    'KE',
    'Kenya',
    '+254',
    ['Nairobi County', 'Mombasa County', 'Kisumu County'],
  ],
  ['ZA', 'South Africa', '+27', ['Gauteng', 'Western Cape', 'KwaZulu-Natal']],
  ['GB', 'United Kingdom', '+44', ['England', 'Scotland', 'Wales']],
  ['US', 'United States', '+1', ['California', 'New York', 'Texas']],
  ['CA', 'Canada', '+1', ['Ontario', 'British Columbia', 'Quebec']],
  ['AE', 'United Arab Emirates', '+971', ['Dubai', 'Abu Dhabi', 'Sharjah']],
  ['DE', 'Germany', '+49', ['Bavaria', 'Berlin', 'North Rhine-Westphalia']],
  [
    'FR',
    'France',
    '+33',
    ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d’Azur'],
  ],
];
const flag = (c: string) =>
  String.fromCodePoint(...[...c].map(x => 127397 + x.charCodeAt(0)));

type User = { userId: string; email?: string; name?: string };
type Job = {
  id: string;
  title: string;
  category: string;
  location: string;
  workType: string;
  description: string;
  requirements: string;
  status: string;
  openings: number;
};

function useHash() {
  const [route, setRoute] = useState(location.hash.slice(1) || '/');
  useEffect(() => {
    const f = () => setRoute(location.hash.slice(1) || '/');
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return route;
}
function go(path: string) {
  location.hash = path;
}

export default function App() {
  const route = useHash();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  useEffect(() => {
    auth
      .getUser()
      .then(u => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <div className="boot">
        <div className="mark">SB</div>
        <span>Loading StewardBridge</span>
      </div>
    );
  const admin = user?.role === 'admin' || user?.email?.toLowerCase() === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'johnademuyiwa1@gmail.com').toLowerCase();
  return (
    <div className="app-shell">
      <Header user={user} admin={admin} />
      {route.startsWith('/admin') && user ? (
        <Admin route={route} />
      ) : route.startsWith('/workspace') && user ? (
        <Workspace user={user} route={route} />
      ) : (
        <Public route={route} user={user} />
      )}
      <button className="ai-fab" onClick={() => setAiOpen(true)}>
        <span>✦</span> Ask AI
      </button>
      {aiOpen && <AgentPanel user={user} onClose={() => setAiOpen(false)} />}
      <Footer />
    </div>
  );
}

function Header({ user, admin }: { user: User | null; admin: boolean }) {
  return (
    <header className="nav">
      <button className="brand" onClick={() => go('/')}>
        <span className="bridge-logo">SB</span>
        <span>
          <b>STEWARD</b>
          <em>BRIDGE</em>
        </span>
      </button>
      <nav>
        <button onClick={() => go('/opportunities')}>Opportunities</button>
        <button onClick={() => go('/services')}>Services</button>
        <button onClick={() => go('/how-it-works')}>How It Works</button>
        <button onClick={() => go('/about')}>About</button>
        <button onClick={() => go('/contact')}>Contact</button>
      </nav>
      <div className="nav-actions">
        {user ? (
          <>
            <button
              className="ghost"
              onClick={() => go(admin ? '/admin' : '/workspace')}
            >
              Workspace
            </button>
            <button
              className="gold-btn"
              onClick={async () => {
                await auth.signOut();
                go('/');
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <button className="gold-btn" onClick={() => go('/get-started')}>
            Get Started
          </button>
        )}
      </div>
    </header>
  );
}

function Public({ route, user }: { route: string; user: User | null }) {
  if (route === '/opportunities') return <Opportunities />;
  if (route === '/services')
    return (
      <Simple
        title="Services"
        kicker="WORKFORCE, RECRUITMENT, OPERATIONS"
        text="StewardBridge connects organizations with recruitment, staffing, managed workforce and deployment operations through one connected system."
      />
    );
  if (route === '/how-it-works') return <HowItWorks />;
  if (route === '/about')
    return (
      <Simple
        title="About StewardBridge"
        kicker="THE BRIDGE BETWEEN PEOPLE AND OPERATIONS"
        text="A workforce platform built to connect people, organizations and operational teams from first enquiry through deployment and follow-up."
      />
    );
  if (route === '/contact') return <Contact />;
  if (route === '/get-started') return <GetStarted />;
  if (route === '/login') return <AuthPage mode="signin" />;
  if (route === '/signup') return <AuthPage mode="signup" />;
  if (route === '/') return <Home user={user} />;
  return <Home user={user} />;
}
function Home({ user }: { user: User | null }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-copy">
          <div className="eyebrow">
            WORKFORCE • RECRUITMENT • STAFFING • OPERATIONS
          </div>
          <h1>
            Build the right workforce.
            <br />
            <span>Move with confidence.</span>
          </h1>
          <p>
            StewardBridge brings candidates, hospitality partners, team members
            and operations together in one connected workforce platform.
          </p>
          <div className="hero-ctas">
            <button
              className="gold-btn large"
              onClick={() => go(user ? '/workspace' : '/get-started')}
            >
              {user ? 'Open Workspace' : 'Get Started'} <span>→</span>
            </button>
            <button
              className="outline-btn large"
              onClick={() => go('/opportunities')}
            >
              Explore Opportunities
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb orb1" />
          <div className="orb orb2" />
          <div className="world">
            <div className="world-grid" />
            <div className="node n1" />
            <div className="node n2" />
            <div className="node n3" />
            <div className="route r1" />
            <div className="route r2" />
          </div>
          <div className="floating-card fc1">
            <small>WORKFORCE</small>
            <b>Nationwide</b>
            <span>● Connected</span>
          </div>
          <div className="floating-card fc2">
            <small>LIVE OPPORTUNITY</small>
            <b>Open roles</b>
            <span>Explore →</span>
          </div>
        </div>
      </section>
      <section className="ticker">
        <span>STEWARD BRIDGE</span>
        <i /> <span>REAL PEOPLE</span>
        <i /> <span>REAL OPPORTUNITIES</span>
        <i /> <span>CONNECTED OPERATIONS</span>
      </section>
      <section className="section split">
        <div>
          <div className="eyebrow">ONE CONNECTED SYSTEM</div>
          <h2>From first conversation to workforce deployment.</h2>
        </div>
        <p>
          Every important step stays connected: onboarding, opportunities,
          applications, documents, matching, messaging, calendar, approvals,
          deployment and feedback. The public site and private operations
          platform use the same source of truth.
        </p>
      </section>
    </main>
  );
}
function Simple({
  title,
  kicker,
  text,
}: {
  title: string;
  kicker: string;
  text: string;
}) {
  return (
    <main>
      <section className="page-hero">
        <div className="eyebrow">{kicker}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </section>
      <section className="cards section">
        <Info
          title="Recruitment"
          text="Structured candidate discovery, applications, screening and progression."
        />
        <Info
          title="Staffing"
          text="Request, match, review and coordinate workforce requirements."
        />
        <Info
          title="Operations"
          text="Keep documents, conversations, schedules, deployments and follow-ups connected."
        />
      </section>
    </main>
  );
}
function Info({ title, text }: { title: string; text: string }) {
  return (
    <article className="info-card">
      <span>✦</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
function HowItWorks() {
  return (
    <main>
      <section className="page-hero">
        <div className="eyebrow">THE FLOW</div>
        <h1>One bridge. Every stage connected.</h1>
        <p>
          Public discovery leads into secure workspaces, then into real
          operational workflows.
        </p>
      </section>
      <section className="timeline section">
        {[
          'Discover',
          'Authenticate',
          'Onboard',
          'Match & apply',
          'Review & approve',
          'Deploy',
          'Follow up',
        ].map((x, i) => (
          <div className="step" key={x}>
            <b>0{i + 1}</b>
            <h3>{x}</h3>
            <p>
              {
                [
                  'Explore opportunities or request workforce support.',
                  'Use Google or email authentication.',
                  'Complete only the profile path relevant to your role.',
                  'Applications and staffing requests become real records.',
                  'Authorized teams review, communicate and approve.',
                  'Team members move into deployment operations.',
                  'Feedback, ratings and future opportunities stay connected.',
                ][i]
              }
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
function Opportunities() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => {
    api
      .get('/api/jobs')
      .then(r => setJobs(r.data.jobs || []))
      .catch(() => setJobs([]));
  }, []);
  const filtered = jobs.filter(j =>
    (j.title + ' ' + j.category + ' ' + j.location)
      .toLowerCase()
      .includes(q.toLowerCase())
  );
  return (
    <main>
      <section className="page-hero compact">
        <div className="eyebrow">OPPORTUNITIES</div>
        <h1>Find your next opportunity.</h1>
        <p>Real openings published through StewardBridge operations.</p>
        <input
          className="search"
          placeholder="Search role, category or location"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </section>
      <section className="section job-grid">
        {filtered.length ? (
          filtered.map(j => (
            <article className="job-card" key={j.id}>
              <div className="job-top">
                <span>{j.category}</span>
                <small>{j.status}</small>
              </div>
              <h3>{j.title}</h3>
              <p>{j.description}</p>
              <div className="job-meta">
                <span>⌖ {j.location}</span>
                <span>◷ {j.workType}</span>
                <span>◉ {j.openings} openings</span>
              </div>
              <button
                className="outline-btn"
                onClick={() => go('/get-started')}
              >
                Apply / Get Started →
              </button>
            </article>
          ))
        ) : (
          <div className="empty">
            No published opportunities yet. The Admin Job Publisher can publish
            them into this page.
          </div>
        )}
      </section>
    </main>
  );
}
function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'General enquiry',
    message: '',
  });
  return (
    <main>
      <section className="page-hero">
        <div className="eyebrow">CONTACT STEWARDBRIDGE</div>
        <h1>Let’s connect the right next step.</h1>
        <p>
          Use the direct channels or send a structured enquiry into the
          operations inbox.
        </p>
      </section>
      <section className="section contact-grid">
        <div className="contact-panel">
          <h3>Direct channels</h3>
          <a href="https://wa.me/2347066510205" target="_blank">
            WhatsApp · +234 706 651 0205
          </a>
          <a href="mailto:elushadetimothy@gmail.com">
            elushadetimothy@gmail.com
          </a>
          <span>Coverage · Nationwide</span>
        </div>
        <form
          className="contact-form"
          onSubmit={async e => {
            e.preventDefault();
            await api.post('/api/contact', form);
            setSent(true);
          }}
        >
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
          >
            <option>General enquiry</option>
            <option>Find workers</option>
            <option>Find an opportunity</option>
            <option>Support</option>
          </select>
          <textarea
            required
            placeholder="How can StewardBridge help?"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
          />
          <button className="gold-btn">
            {sent ? 'Enquiry received' : 'Send enquiry'} →
          </button>
        </form>
      </section>
    </main>
  );
}
function GetStarted() {
  return (
    <main>
      <section className="page-hero">
        <div className="eyebrow">GET STARTED</div>
        <h1>Choose your entry point.</h1>
        <p>
          Sign in or create an account, then StewardBridge will guide you
          through the right onboarding path.
        </p>
      </section>
      <section className="section choice-grid">
        <button className="choice" onClick={() => go('/login')}>
          <span>01</span>
          <h2>Sign In</h2>
          <p>Continue to your existing StewardBridge workspace.</p>→
        </button>
        <button className="choice" onClick={() => go('/signup')}>
          <span>02</span>
          <h2>Sign Up</h2>
          <p>Create your account, verify your identity and choose your path.</p>
          →
        </button>
      </section>
    </main>
  );
}
function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const [err, setErr] = useState('');
  const sign = async () => {
    try {
      setErr('');
      await auth.signIn({ scope: 'openid email profile offline_access' });
      await api.post('/api/profile/bootstrap', {});
      go('/workspace');
    } catch (e: any) {
      setErr(
        e?.code === 'popup_blocked'
          ? 'Please allow popups for Google sign-in.'
          : e?.code === 'popup_closed'
            ? 'Sign-in was cancelled.'
            : 'Authentication could not be completed.'
      );
    }
  };
  return (
    <main>
      <section className="auth-page">
        <div className="auth-card">
          <div className="eyebrow">STEWARD BRIDGE ACCOUNT</div>
          <h1>
            {mode === 'signin' ? 'Welcome back.' : 'Create your account.'}
          </h1>
          <p>
            {mode === 'signin'
              ? 'Sign in with Google or email through the secure authentication layer.'
              : 'Start with secure authentication. Your role and full onboarding come next.'}
          </p>
          <button className="google-btn" onClick={sign}>
            G <span>Continue with Google</span>
          </button>
          <div className="or">
            <span>Secure sign-in</span>
          </div>
          <p className="small">
            Google authentication is connected to StewardBridge role/profile
            onboarding. Admin access is controlled separately.
          </p>
          {err && <div className="error">{err}</div>}
          <button
            className="text-btn"
            onClick={() => go(mode === 'signin' ? '/signup' : '/login')}
          >
            {mode === 'signin'
              ? 'Need an account? Sign up'
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </section>
    </main>
  );
}

function Workspace({ user, route }: { user: User; route: string }) {
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    api
      .get('/api/profile')
      .then(r => setProfile(r.data.profile))
      .catch(() => {});
  }, []);
  const [tab, setTab] = useState(route.split('/')[2] || 'overview');
  return (
    <main>
      <section className="workspace-head">
        <div>
          <div className="eyebrow">PRIVATE WORKSPACE</div>
          <h1>
            {profile?.role === 'hotel'
              ? 'Partner workspace'
              : 'Workforce workspace'}
          </h1>
          <p>
            {user.name || user.email} ·{' '}
            {profile?.country || 'Complete your location'}
          </p>
        </div>
        <button
          className="gold-btn"
          onClick={() => go('/workspace/onboarding')}
        >
          Complete profile →
        </button>
      </section>
      <div className="workspace section">
        <aside>
          <button
            className={tab === 'overview' ? 'active' : ''}
            onClick={() => setTab('overview')}
          >
            Overview
          </button>
          <button onClick={() => setTab('opportunities')}>Opportunities</button>
          <button onClick={() => setTab('applications')}>Applications</button>
          <button onClick={() => setTab('messages')}>Messages</button>
          <button onClick={() => setTab('calendar')}>Calendar</button>
          <button onClick={() => setTab('documents')}>Documents</button>
          <button onClick={() => setTab('ai')}>AI Assistant</button>
          <button onClick={() => setTab('settings')}>Settings</button>
        </aside>
        <div className="workspace-content">
          {tab === 'overview' && (
            <>
              <h2>Good to see you.</h2>
              <div className="dash-grid">
                <Info
                  title="Profile"
                  text={
                    profile?.onboardingComplete
                      ? 'Profile complete.'
                      : 'Finish your country, region, city and role path.'
                  }
                />
                <Info
                  title="Opportunities"
                  text="Browse published roles from the connected opportunity system."
                />
                <Info
                  title="Messages"
                  text="Persistent conversations with StewardBridge."
                />
                <Info
                  title="Calendar"
                  text="Internal events with Google Calendar sync where connected."
                />
              </div>
            </>
          )}
          {tab === 'opportunities' && <Opportunities />}
          {tab === 'applications' && (
            <DataPanel
              title="Applications"
              endpoint="/api/applications"
              empty="Your applications will appear here."
            />
          )}
          {tab === 'messages' && (
            <DataPanel
              title="Messages"
              endpoint="/api/messages"
              empty="Your conversations will appear here."
            />
          )}
          {tab === 'calendar' && (
            <DataPanel
              title="Calendar"
              endpoint="/api/calendar"
              empty="No events yet."
            />
          )}
          {tab === 'documents' && (
            <DataPanel
              title="Documents"
              endpoint="/api/documents"
              empty="No documents yet."
            />
          )}
          {tab === 'ai' && <AgentPanel embedded user={user} />}{' '}
          {tab === 'settings' && (
            <Onboarding
              profile={profile}
              onSaved={() =>
                api.get('/api/profile').then(r => setProfile(r.data.profile))
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}
function DataPanel({
  title,
  endpoint,
  empty,
}: {
  title: string;
  endpoint: string;
  empty: string;
}) {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    api
      .get(endpoint)
      .then(r => setData(r.data.items || []))
      .catch(() => setData([]));
  }, [endpoint]);
  return (
    <div>
      <h2>{title}</h2>
      {data.length ? (
        <div className="data-list">
          {data.map((x: any) => (
            <div className="data-row" key={x.id}>
              <b>{x.title || x.subject || x.name || x.type || 'Record'}</b>
              <span>{x.status || x.updatedAt || ''}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">{empty}</div>
      )}
    </div>
  );
}
function Onboarding({
  profile,
  onSaved,
}: {
  profile: any;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    country: profile?.country || 'Nigeria',
    region: profile?.region || '',
    city: profile?.city || '',
    role: profile?.role || '',
  });
  const [saved, setSaved] = useState(false);
  const c = countries.find(x => x[1] === f.country) || countries[0];
  return (
    <div>
      <h2>Profile & onboarding</h2>
      <p className="muted">
        Country determines the dial code and region hierarchy. Choose your role
        after authentication.
      </p>
      <input
        placeholder="Full name"
        value={f.name}
        onChange={e => setF({ ...f, name: e.target.value })}
      />
      <div className="two">
        <input
          placeholder="Phone number"
          value={f.phone}
          onChange={e => setF({ ...f, phone: e.target.value })}
        />
        <select
          value={f.country}
          onChange={e =>
            setF({ ...f, country: e.target.value, region: '', city: '' })
          }
        >
          {countries.map(x => (
            <option key={x[1]} value={x[1]}>
              {flag(x[0] as string)} {x[1]} {x[2]}
            </option>
          ))}
        </select>
      </div>
      <div className="two">
        <select
          value={f.region}
          onChange={e => setF({ ...f, region: e.target.value, city: '' })}
        >
          <option value="">Select region / state / province</option>
          {(c[3] as string[]).map(x => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <input
          placeholder="Searchable city / town / area"
          value={f.city}
          onChange={e => setF({ ...f, city: e.target.value })}
        />
      </div>
      <select
        value={f.role}
        onChange={e => setF({ ...f, role: e.target.value })}
      >
        <option value="">What are you joining as?</option>
        <option value="candidate">Job Seeker / Candidate</option>
        <option value="hotel">Hotel / Hospitality Partner</option>
      </select>
      <button
        className="gold-btn"
        onClick={async () => {
          await api.put('/api/profile', f);
          setSaved(true);
          onSaved();
        }}
      >
        {saved ? 'Saved ✓' : 'Save profile'}
      </button>
    </div>
  );
}
function Admin({ route }: { route: string }) {
  const [section, setSection] = useState(route.split('/')[2] || 'dashboard');
  return (
    <main>
      <section className="workspace-head admin-head">
        <div>
          <div className="eyebrow">OWNER / ADMIN CONTROL ROOM</div>
          <h1>StewardBridge Operations</h1>
          <p>Authorized administration · source of truth across the platform</p>
        </div>
        <button className="gold-btn" onClick={() => go('/workspace')}>
          Public workspace
        </button>
      </section>
      <div className="workspace section">
        <aside>
          <button
            className={section === 'dashboard' ? 'active' : ''}
            onClick={() => setSection('dashboard')}
          >
            Overview
          </button>
          <button onClick={() => setSection('users')}>Users</button>
          <button onClick={() => setSection('jobs')}>Jobs</button>
          <button onClick={() => setSection('requests')}>
            Staffing Requests
          </button>
          <button onClick={() => setSection('applications')}>
            Applications
          </button>
          <button onClick={() => setSection('documents')}>Documents</button>
          <button onClick={() => setSection('messages')}>Conversations</button>
          <button onClick={() => setSection('ai')}>AI & Approvals</button>
          <button onClick={() => setSection('calendar')}>Calendar</button>
          <button onClick={() => setSection('feedback')}>Feedback</button>
          <button onClick={() => setSection('updates')}>Updates / Site</button>
          <button onClick={() => setSection('integrations')}>
            Integrations
          </button>
          <button onClick={() => setSection('audit')}>Audit Log</button>
          <button onClick={() => setSection('settings')}>Settings</button>
        </aside>
        <div className="workspace-content">
          {section === 'dashboard' && <AdminDashboard />}
          {section === 'users' && (
            <AdminList title="Users" endpoint="/api/admin/users" />
          )}
          {section === 'jobs' && <AdminJobs />}
          {section === 'requests' && (
            <AdminList
              title="Staffing Requests"
              endpoint="/api/admin/requests"
            />
          )}
          {section === 'applications' && (
            <AdminList
              title="Applications"
              endpoint="/api/admin/applications"
            />
          )}
          {section === 'documents' && (
            <AdminList title="Documents" endpoint="/api/admin/documents" />
          )}
          {section === 'messages' && (
            <AdminList title="Conversations" endpoint="/api/admin/messages" />
          )}
          {section === 'ai' && <AdminAI />}
          {section === 'calendar' && (
            <AdminList title="Calendar" endpoint="/api/admin/calendar" />
          )}
          {section === 'feedback' && (
            <AdminList
              title="Feedback & Ratings"
              endpoint="/api/admin/feedback"
            />
          )}
          {section === 'updates' && <AdminUpdates />}
          {section === 'integrations' && <Integrations />}
          {section === 'audit' && (
            <AdminList title="Audit Log" endpoint="/api/admin/audit" />
          )}
          {section === 'settings' && <AdminSettings />}
        </div>
      </div>
    </main>
  );
}
function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  useEffect(() => {
    api.get('/api/admin/overview').then(r => setStats(r.data.stats || {}));
  }, []);
  return (
    <div>
      <h2>Overview</h2>
      <div className="stat-grid">
        {[
          ['Users', stats.users || 0],
          ['Candidates', stats.candidates || 0],
          ['Jobs', stats.jobs || 0],
          ['Applications', stats.applications || 0],
          ['Requests', stats.requests || 0],
          ['Open approvals', stats.approvals || 0],
        ].map(x => (
          <div className="stat" key={x[0]}>
            <small>{x[0]}</small>
            <b>{x[1]}</b>
          </div>
        ))}
      </div>
      <div className="admin-callout">
        <b>AI operational layer</b>
        <p>
          The website Ask AI, Admin AI and future Telegram channel use the same
          authorized webhook agent and StewardBridge records. Sensitive actions
          can be prepared and sent for approval before execution.
        </p>
      </div>
    </div>
  );
}
function AdminList({ title, endpoint }: { title: string; endpoint: string }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api
      .get(endpoint)
      .then(r => setItems(r.data.items || []))
      .catch(() => setItems([]));
  }, [endpoint]);
  return (
    <div>
      <h2>{title}</h2>
      {items.length ? (
        <div className="data-list">
          {items.map(x => (
            <div className="data-row" key={x.id}>
              <div>
                <b>{x.title || x.name || x.subject || x.email || 'Record'}</b>
                <small>{x.role || x.status || x.type || ''}</small>
              </div>
              <span>{x.location || x.createdAt || ''}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">No records yet.</div>
      )}
    </div>
  );
}
function AdminJobs() {
  const [f, setF] = useState({
    title: '',
    category: 'Hospitality',
    location: 'Nationwide',
    workType: 'Full-time',
    description: '',
    requirements: '',
    openings: 1,
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const load = () => api.get('/api/jobs').then(r => setJobs(r.data.jobs || []));
  useEffect(() => {
    load();
  }, []);
  return (
    <div>
      <h2>Real Job Publisher</h2>
      <div className="form-grid">
        <input
          placeholder="Job title"
          value={f.title}
          onChange={e => setF({ ...f, title: e.target.value })}
        />
        <input
          placeholder="Category"
          value={f.category}
          onChange={e => setF({ ...f, category: e.target.value })}
        />
        <input
          placeholder="Location"
          value={f.location}
          onChange={e => setF({ ...f, location: e.target.value })}
        />
        <input
          placeholder="Work type"
          value={f.workType}
          onChange={e => setF({ ...f, workType: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={f.description}
          onChange={e => setF({ ...f, description: e.target.value })}
        />
        <textarea
          placeholder="Requirements"
          value={f.requirements}
          onChange={e => setF({ ...f, requirements: e.target.value })}
        />
        <input
          type="number"
          min="1"
          value={f.openings}
          onChange={e => setF({ ...f, openings: Number(e.target.value) })}
        />
        <button
          className="gold-btn"
          onClick={async () => {
            await api.post('/api/admin/jobs', f);
            setF({
              ...f,
              title: '',
              description: '',
              requirements: '',
              openings: 1,
            });
            load();
          }}
        >
          Publish job
        </button>
      </div>
      <div className="data-list">
        {jobs.map(j => (
          <div className="data-row" key={j.id}>
            <b>{j.title}</b>
            <span>
              {j.status} · {j.location}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function AdminUpdates() {
  const [text, setText] = useState('');
  return (
    <div>
      <h2>Website Update Publisher</h2>
      <textarea
        placeholder="Write an update or ask the AI to prepare one."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        className="gold-btn"
        onClick={async () => {
          await api.post('/api/admin/updates', { text });
          setText('');
        }}
      >
        Publish update
      </button>
    </div>
  );
}
function AdminAI() {
  return (
    <div>
      <h2>AI & approvals</h2>
      <p className="muted">
        Webhook agent control. No OpenAI dependency is used by this application.
      </p>
      <AgentPanel embedded adminMode user={null} />
      <div className="approval-note">
        Consequential actions such as closing staffing opportunities, publishing
        sensitive content, or commercial actions should return an approval
        request and remain auditable.
      </div>
    </div>
  );
}
function Integrations() {
  const [s, setS] = useState<any>(null);
  useEffect(() => {
    api.get('/api/integrations/status').then(r => setS(r.data));
  }, []);
  return (
    <div>
      <h2>Integrations</h2>
      <div className="integration">
        <b>Agent Webhook</b>
        <span>
          {s?.webhookConfigured
            ? 'Configured'
            : 'Waiting for secure webhook URL'}
        </span>
      </div>
      <div className="integration">
        <b>Google Authentication</b>
        <span>Enabled</span>
      </div>
      <div className="integration">
        <b>Google Calendar</b>
        <span>Internal calendar ready · Google sync adapter</span>
      </div>
      <div className="integration">
        <b>Contact channels</b>
        <span>WhatsApp +234 706 651 0205 · elushadetimothy@gmail.com</span>
      </div>
    </div>
  );
}
function AdminSettings() {
  return (
    <div>
      <h2>Settings</h2>
      <p className="muted">
        Operational configuration is server-side. Secrets are never exposed in
        the UI or source.
      </p>
      <div className="setting-box">
        <b>Authorized Owner</b>
        <span>johnademuyiwa1@gmail.com</span>
      </div>
      <div className="setting-box">
        <b>Public coverage</b>
        <span>Nationwide</span>
      </div>
      <div className="setting-box">
        <b>AI provider</b>
        <span>External StewardBridge agent via protected webhook</span>
      </div>
      <div className="setting-box">
        <b>Agent control plane</b>
        <span>GET /api/agent/manifest · GET/POST /api/agent/events · POST /api/agent/control</span>
      </div>
      <div className="setting-box">
        <b>Agent security</b>
        <span>Shared signing secret is server-side only; consequential actions are auditable.</span>
      </div>
    </div>
  );
}
function AgentPanel({
  user,
  onClose,
  embedded = false,
  adminMode = false,
}: {
  user: User | null;
  onClose?: () => void;
  embedded?: boolean;
  adminMode?: boolean;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!input.trim() || busy) return;
    const q = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setBusy(true);
    try {
      const r = await api.post('/api/agent/chat', {
        message: q,
        channel: adminMode ? 'admin' : 'website',
        userContext: user,
      });
      setMessages(m => [
        ...m,
        {
          role: 'agent',
          text:
            r.data.reply ||
            r.data.message ||
            'The agent did not return a response.',
        },
      ]);
    } catch (e) {
      setMessages(m => [
        ...m,
        {
          role: 'agent',
          text: 'The AI agent connection is not available yet. Check the webhook configuration in Admin → Integrations.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={embedded ? 'agent-embedded' : 'agent-panel'}>
      {!embedded && (
        <div className="agent-head">
          <div>
            <b>StewardBridge AI</b>
            <span>Operational assistant</span>
          </div>
          <button onClick={onClose}>×</button>
        </div>
      )}
      <div className="agent-messages">
        {!messages.length && (
          <div className="agent-welcome">
            <span>✦</span>
            <b>Ask the StewardBridge agent.</b>
            <p>
              It can search, summarize, prepare, navigate and—when
              authorized—execute platform operations through the connected
              webhook.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={'bubble ' + m.role}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="agent-input">
        <input
          placeholder="Ask about jobs, people, requests, documents…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send}>{busy ? '…' : '→'}</button>
      </div>
    </div>
  );
}
function Footer() {
  return (
    <footer>
      <div>
        <b>
          STEWARD<span>BRIDGE</span>
        </b>
        <p>Connected workforce operations.</p>
      </div>
      <div>
        <span>Coverage · Nationwide</span>
        <span>WhatsApp · +234 706 651 0205</span>
        <span>
          <a href="mailto:elushadetimothy@gmail.com">
            elushadetimothy@gmail.com
          </a>
        </span>
      </div>
      <small>© 2026 StewardBridge. All rights reserved.</small>
    </footer>
  );
}
