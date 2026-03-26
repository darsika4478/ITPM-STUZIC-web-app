
import { Link } from "react-router-dom";
import logoText from '../assets/logo-text.png';

/**
 * Home — Public landing page
 *
 * Sections:
 *  1. Navbar       — logo + Login / Sign Up links
 *  2. Hero         — animated logo ring, headline, CTA buttons
 *  3. Stats bar    — social proof numbers
 *  4. Features     — 4 feature cards
 *  5. How it works — 3-step process
 *  6. CTA banner   — final call to action
 *  7. Footer
 *
 * All styling uses inline styles (dark purple theme) so it doesn't
 * interfere with the dashboard's CSS variables or Tailwind classes.
 */

const features = [
    { icon: "📝", title: "Smart Notes", desc: "Capture lectures, ideas & summaries in one place with rich formatting." },
    { icon: "✅", title: "Task Manager", desc: "Plan assignments, set deadlines & track progress effortlessly." },
    { icon: "⏱️", title: "Focus Timer", desc: "Pomodoro-powered study sessions to keep you in the zone." },
    { icon: "🎵", title: "Study Music", desc: "Curated lo-fi & ambient playlists to boost your concentration." },
];

const stats = [
    { value: "10K+", label: "Active Students" },
    { value: "50K+", label: "Tasks Completed" },
    { value: "99%", label: "Uptime" },
    { value: "4.9★", label: "User Rating" },
];

const steps = [
    { step: "01", title: "Sign Up", desc: "Create your free account in seconds — no credit card required." },
    { step: "02", title: "Organize", desc: "Add your courses, tasks, and notes. STUZIC keeps everything tidy." },
    { step: "03", title: "Focus & Achieve", desc: "Use the timer & music to study effectively and crush your goals." },
];

const cardStyle = {
    borderRadius: '24px',
    border: '1px solid rgba(167,139,250,0.15)',
    background: 'rgba(255,255,255,0.05)',
    padding: '1.75rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
};

export default function Home() {
    return (
        <div style={{
            position: 'relative', minHeight: '100vh',
            background: 'linear-gradient(135deg, #1c1848 0%, #231f5c 50%, #2b2570 100%)',
            color: '#f0ecff', overflowX: 'hidden',
        }}>
            {/* ── Ambient background blobs ── */}
            <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-160px', left: '-160px', height: '500px', width: '500px', borderRadius: '50%', background: 'rgba(109,95,231,0.22)', filter: 'blur(120px)' }} />
                <div style={{ position: 'absolute', top: '33%', right: '-128px', height: '400px', width: '400px', borderRadius: '50%', background: 'rgba(80,60,200,0.18)', filter: 'blur(100px)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: '25%', height: '350px', width: '350px', borderRadius: '50%', background: 'rgba(140,100,240,0.15)', filter: 'blur(100px)' }} />
            </div>

            {/* ── Navbar ── */}
            <nav style={{
                position: 'relative', zIndex: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 4rem',
            }}>
                <img src={logoText} alt="STUZIC" style={{ height: '180px', width: 'auto', objectFit: 'contain' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link to="/login" style={{ borderRadius: '12px', border: '1.5px solid rgba(167,139,250,0.35)', padding: '8px 20px', fontSize: '0.875rem', fontWeight: 500, color: '#c4b5fd', textDecoration: 'none', background: 'rgba(255,255,255,0.05)' }}>
                        Log In
                    </Link>
                    <Link to="/Register" style={{ borderRadius: '12px', padding: '8px 20px', fontSize: '0.875rem', fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', boxShadow: '0 4px 16px rgba(109,95,231,0.45)' }}>
                        Sign Up Free
                    </Link>
                </div>
            </nav>

            {/* ── Hero section ── */}
            <section style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 1.5rem 6rem', textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 3rem' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed rgba(109,95,231,0.35)', animation: 'spin 20s linear infinite' }} />
                    <div style={{ position: 'absolute', inset: '1.5rem', borderRadius: '50%', border: '1px solid rgba(109,95,231,0.2)', animation: 'spin 30s linear infinite reverse' }} />
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <h1 style={{ maxWidth: '768px', fontSize: 'clamp(2rem, 5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#f0ecff', margin: 0 }}>
                            Your All-in-One{' '}
                            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Student Companion
                            </span>
                        </h1>
                        <p style={{ marginTop: '1.25rem', maxWidth: '560px', fontSize: '1.125rem', color: '#c4b5fd', lineHeight: 1.6, margin: '1.25rem auto 0' }}>
                            Notes, tasks, focus timer &amp; study music — everything you need to ace your academics, beautifully organized in one place.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '2.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <Link to="/Register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '16px', padding: '14px 32px', fontSize: '1rem', fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', boxShadow: '0 8px 32px rgba(109,95,231,0.45)' }}>
                        Get Started — It's Free
                        <svg style={{ height: '1.25rem', width: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                    <a href="#features" style={{ borderRadius: '16px', border: '1.5px solid rgba(167,139,250,0.35)', padding: '14px 32px', fontSize: '1rem', fontWeight: 500, color: '#c4b5fd', textDecoration: 'none', background: 'rgba(255,255,255,0.05)' }}>
                        Explore Features
                    </a>
                </div>

                <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
                    <span style={{ position: 'absolute', left: '10%', top: '20%', fontSize: '1.875rem', opacity: 0.4 }}>📚</span>
                    <span style={{ position: 'absolute', right: '12%', top: '18%', fontSize: '1.875rem', opacity: 0.4 }}>🎧</span>
                    <span style={{ position: 'absolute', left: '18%', bottom: '15%', fontSize: '1.5rem', opacity: 0.4 }}>☕</span>
                    <span style={{ position: 'absolute', right: '15%', bottom: '20%', fontSize: '1.5rem', opacity: 0.4 }}>✨</span>
                </div>
            </section>

            {/* ── Stats bar ── */}
            <section style={{ position: 'relative', zIndex: 10, maxWidth: '1024px', margin: '0 auto', padding: '0 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderRadius: '24px', border: '1px solid rgba(167,139,250,0.15)', background: 'rgba(255,255,255,0.05)', padding: '2rem 1.5rem', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
                    {stats.map((s, i) => (
                        <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', borderRight: i < stats.length - 1 ? '1px solid rgba(167,139,250,0.2)' : 'none' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#f0ecff' }}>{s.value}</span>
                            <span style={{ fontSize: '0.875rem', color: '#a78bfa' }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features section ── */}
            <section id="features" style={{ position: 'relative', zIndex: 10, maxWidth: '1152px', margin: '0 auto', padding: '7rem 1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', borderRadius: '999px', background: 'rgba(109,95,231,0.18)', padding: '6px 16px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a78bfa' }}>Features</span>
                    <h2 style={{ marginTop: '1rem', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#f0ecff', lineHeight: 1.2 }}>
                        Everything You Need to{' '}
                        <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Study Smarter</span>
                    </h2>
                    <p style={{ margin: '1rem auto 0', maxWidth: '640px', color: '#c4b5fd', lineHeight: 1.6 }}>
                        Built by students, for students — STUZIC combines the tools you actually use into one distraction-free workspace.
                    </p>
                </div>
                <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {features.map((f) => (
                        <div key={f.title} style={cardStyle}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.35)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)'; }}
                        >
                            <span style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block' }}>{f.icon}</span>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', margin: 0 }}>{f.title}</h3>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', lineHeight: 1.6, color: '#c4b5fd', marginBottom: 0 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section style={{ position: 'relative', zIndex: 10, maxWidth: '1024px', margin: '0 auto', padding: '0 1.5rem 7rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', borderRadius: '999px', background: 'rgba(109,95,231,0.18)', padding: '6px 16px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a78bfa' }}>How It Works</span>
                    <h2 style={{ marginTop: '1rem', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#f0ecff', lineHeight: 1.2 }}>
                        Three Steps to{' '}
                        <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Better Grades</span>
                    </h2>
                </div>
                <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
                    {steps.map((item) => (
                        <div key={item.step} style={{ ...cardStyle, textAlign: 'center' }}>
                            <div style={{ margin: '0 auto 1rem', display: 'flex', height: '56px', width: '56px', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', fontSize: '1.25rem', fontWeight: 700, color: '#fff', boxShadow: '0 4px 16px rgba(109,95,231,0.45)' }}>
                                {item.step}
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', margin: 0 }}>{item.title}</h3>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#c4b5fd', marginBottom: 0 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA banner ── */}
            <section style={{ position: 'relative', zIndex: 10, maxWidth: '896px', margin: '0 auto', padding: '0 1.5rem 7rem' }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '28px', background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', padding: '4rem', textAlign: 'center', boxShadow: '0 20px 60px rgba(109,95,231,0.5)' }}>
                    <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
                        <div style={{ position: 'absolute', top: '-80px', right: '-80px', height: '240px', width: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', filter: 'blur(40px)' }} />
                        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', height: '240px', width: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', filter: 'blur(40px)' }} />
                    </div>
                    <h2 style={{ position: 'relative', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#fff', margin: 0 }}>
                        Ready to Level Up Your Studies?
                    </h2>
                    <p style={{ position: 'relative', margin: '1rem auto 0', maxWidth: '512px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                        Join thousands of students who are already studying smarter with STUZIC. It's free, fast, and built for you.
                    </p>
                    <Link to="/Register" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', padding: '14px 32px', fontWeight: 700, color: '#fff', textDecoration: 'none', backdropFilter: 'blur(10px)' }}>
                        Create Your Free Account
                        <svg style={{ height: '1.25rem', width: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(109,95,231,0.2)', padding: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#c4b5fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <img src={logoText} alt="STUZIC" style={{ height: '24px', width: 'auto', opacity: 0.6 }} />
                    <span>© {new Date().getFullYear()} STUZIC. Built for students, by students.</span>
                </div>
            </footer>
        </div>
    );
}
