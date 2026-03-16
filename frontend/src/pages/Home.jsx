import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const features = [
  { icon: "📝", title: "Smart Notes",   desc: "Capture lectures, ideas & summaries in one place with rich formatting." },
  { icon: "✅", title: "Task Manager",  desc: "Plan assignments, set deadlines & track progress effortlessly." },
  { icon: "⏱️", title: "Focus Timer",   desc: "Pomodoro-powered study sessions to keep you in the zone." },
  { icon: "🎵", title: "Study Music",   desc: "Curated lo-fi & ambient playlists to boost your concentration." },
];

const stats = [
  { value: "10K+", label: "Active Students" },
  { value: "50K+", label: "Tasks Completed" },
  { value: "99%",  label: "Uptime" },
  { value: "4.9★", label: "User Rating" },
];

export default function Home() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(135deg, #1c1848 0%, #231f5c 50%, #2b2570 100%)', color: '#f0ecff', overflowX: 'hidden' }}>

      {/* ── Background blobs ── */}
      <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-160px', left: '-160px', height: '500px', width: '500px', borderRadius: '50%', background: 'rgba(109,95,231,0.2)', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', top: '33%', right: '-128px', height: '400px', width: '400px', borderRadius: '50%', background: 'rgba(74,63,168,0.25)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '25%', height: '350px', width: '350px', borderRadius: '50%', background: 'rgba(167,139,250,0.15)', filter: 'blur(100px)' }} />
      </div>

      {/* ── Navbar ── */}
      <nav style={{ position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 4rem' }}>
        <img src={logo} alt="STUZIC" style={{ height: '120px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/login" style={{ borderRadius: '12px', border: '1.5px solid rgba(167,139,250,0.35)', padding: '8px 20px', fontSize: '0.875rem', fontWeight: 500, color: '#c4b5fd', textDecoration: 'none', background: 'rgba(255,255,255,0.05)' }}>
            Log In
          </Link>
          <Link to="/signup" style={{ borderRadius: '12px', padding: '8px 20px', fontSize: '0.875rem', fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', boxShadow: '0 4px 16px rgba(109,95,231,0.45)' }}>
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 1.5rem 6rem', textAlign: 'center' }}>
        {/* Rotating rings around headline text */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 4rem' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed rgba(109,95,231,0.35)', animation: 'spin 20s linear infinite' }} />
          <div style={{ position: 'absolute', inset: '1.5rem', borderRadius: '50%', border: '1px solid rgba(167,139,250,0.2)', animation: 'spin 30s linear infinite reverse' }} />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ maxWidth: '700px', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
              Your All-in-One{' '}
              <span style={{ background: 'linear-gradient(to right, #a78bfa, #6d5fe7, #4a3fa8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Student Companion
              </span>
            </h1>
            <p style={{ marginTop: '1.25rem', maxWidth: '480px', fontSize: '1.1rem', color: '#c4b5fd', lineHeight: 1.6, marginBottom: 0 }}>
              Notes, tasks, focus timer &amp; study music — everything you need to ace your academics, beautifully organized in one place.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <Link
            to="/signup"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '16px', background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', padding: '14px 32px', fontSize: '1rem', fontWeight: 600, color: '#fff', textDecoration: 'none', boxShadow: '0 8px 32px rgba(109,95,231,0.4)', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(109,95,231,0.55)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(109,95,231,0.4)'; }}
          >
            Get Started — It's Free
            <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="#features"
            style={{ borderRadius: '16px', border: '1.5px solid rgba(167,139,250,0.3)', padding: '14px 32px', fontSize: '1rem', fontWeight: 500, color: '#c4b5fd', textDecoration: 'none', backdropFilter: 'blur(8px)', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Explore Features
          </a>
        </div>

        {/* Floating emojis */}
        <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
          <span style={{ position: 'absolute', left: '10%', top: '20%', fontSize: '1.875rem', opacity: 0.6, animation: 'bounce 3s ease-in-out infinite' }}>📚</span>
          <span style={{ position: 'absolute', right: '12%', top: '18%', fontSize: '1.875rem', opacity: 0.6, animation: 'bounce 3.5s ease-in-out infinite 0.5s' }}>🎧</span>
          <span style={{ position: 'absolute', left: '18%', bottom: '15%', fontSize: '1.5rem', opacity: 0.6, animation: 'bounce 4s ease-in-out infinite 1s' }}>☕</span>
          <span style={{ position: 'absolute', right: '15%', bottom: '20%', fontSize: '1.5rem', opacity: 0.6, animation: 'bounce 3.2s ease-in-out infinite 1.5s' }}>✨</span>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ position: 'relative', zIndex: 10, margin: '0 auto', maxWidth: '900px', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderRadius: '24px', border: '1px solid rgba(167,139,250,0.15)', background: 'rgba(255,255,255,0.05)', padding: '2rem 1.5rem', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', gap: '1rem' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#f0ecff' }}>{s.value}</span>
              <span style={{ fontSize: '0.875rem', color: '#c4b5fd' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" style={{ position: 'relative', zIndex: 10, margin: '0 auto', maxWidth: '1100px', padding: '7rem 1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'inline-block', borderRadius: '999px', background: 'rgba(109,95,231,0.2)', padding: '6px 16px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa' }}>
            Features
          </span>
          <h2 style={{ marginTop: '1rem', fontSize: 'clamp(1.75rem, 3vw, 3rem)', fontWeight: 700 }}>
            Everything You Need to{' '}
            <span style={{ background: 'linear-gradient(to right, #a78bfa, #6d5fe7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Study Smarter
            </span>
          </h2>
          <p style={{ margin: '1rem auto 0', maxWidth: '560px', color: '#c4b5fd', lineHeight: 1.6 }}>
            Built by students, for students — STUZIC combines the tools you actually use into one distraction-free workspace.
          </p>
        </div>

        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{ borderRadius: '24px', border: '1px solid rgba(167,139,250,0.15)', background: 'rgba(255,255,255,0.05)', padding: '1.75rem', backdropFilter: 'blur(20px)', transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(109,95,231,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(109,95,231,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '2.5rem', display: 'inline-block', marginBottom: '1rem' }}>{f.icon}</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0ecff', margin: 0 }}>{f.title}</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', lineHeight: 1.6, color: '#c4b5fd', marginBottom: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ position: 'relative', zIndex: 10, margin: '0 auto', maxWidth: '900px', padding: '0 1.5rem 7rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'inline-block', borderRadius: '999px', background: 'rgba(74,63,168,0.3)', padding: '6px 16px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa' }}>
            How It Works
          </span>
          <h2 style={{ marginTop: '1rem', fontSize: 'clamp(1.75rem, 3vw, 3rem)', fontWeight: 700 }}>
            Three Steps to{' '}
            <span style={{ background: 'linear-gradient(to right, #6d5fe7, #9b7ef8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Better Grades
            </span>
          </h2>
        </div>

        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {[
            { step: "01", title: "Sign Up",         desc: "Create your free account in seconds — no credit card required." },
            { step: "02", title: "Organize",        desc: "Add your courses, tasks, and notes. STUZIC keeps everything tidy." },
            { step: "03", title: "Focus & Achieve", desc: "Use the timer & music to study effectively and crush your goals." },
          ].map((item) => (
            <div key={item.step} style={{ borderRadius: '24px', border: '1px solid rgba(167,139,250,0.15)', background: 'rgba(255,255,255,0.05)', padding: '2rem', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
              <span style={{ display: 'flex', margin: '0 auto 1rem', height: '56px', width: '56px', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', fontSize: '1.25rem', fontWeight: 700, boxShadow: '0 4px 16px rgba(109,95,231,0.4)' }}>
                {item.step}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0ecff', margin: 0 }}>{item.title}</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#c4b5fd', marginBottom: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ position: 'relative', zIndex: 10, margin: '0 auto', maxWidth: '800px', padding: '0 1.5rem 7rem' }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '28px', background: 'linear-gradient(135deg, #6d5fe7 0%, #4a3fa8 100%)', padding: '4rem 4rem', textAlign: 'center', boxShadow: '0 20px 60px rgba(109,95,231,0.35)' }}>
          <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', height: '240px', width: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', height: '240px', width: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
          </div>
          <h2 style={{ position: 'relative', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, margin: 0 }}>
            Ready to Level Up Your Studies?
          </h2>
          <p style={{ position: 'relative', margin: '1rem auto 0', maxWidth: '420px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
            Join thousands of students who are already studying smarter with STUZIC. It's free, fast, and built for you.
          </p>
          <Link
            to="/signup"
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '2rem', borderRadius: '16px', background: '#fff', padding: '14px 32px', fontWeight: 600, color: '#1c1848', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'transform 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Create Your Free Account
            <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(167,139,250,0.15)', padding: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#c4b5fd' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <img src={logo} alt="STUZIC" style={{ height: '24px', width: 'auto', opacity: 0.7, filter: 'brightness(0) invert(1)' }} />
          <span>© {new Date().getFullYear()} STUZIC. Built for students, by students.</span>
        </div>
      </footer>

    </div>
  );
}
