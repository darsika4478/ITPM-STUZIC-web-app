import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const features = [
  {
    icon: "📝",
    title: "Smart Notes",
    desc: "Capture lectures, ideas & summaries in one place with rich formatting.",
  },
  {
    icon: "✅",
    title: "Task Manager",
    desc: "Plan assignments, set deadlines & track progress effortlessly.",
  },
  {
    icon: "⏱️",
    title: "Focus Timer",
    desc: "Pomodoro-powered study sessions to keep you in the zone.",
  },
  {
    icon: "🎵",
    title: "Study Music",
    desc: "Curated lo-fi & ambient playlists to boost your concentration.",
  },
];

const stats = [
  { value: "10K+", label: "Active Students" },
  { value: "50K+", label: "Tasks Completed" },
  { value: "99%", label: "Uptime" },
  { value: "4.9★", label: "User Rating" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[var(--c5)] text-white overflow-x-hidden">
      {/* ── Background blobs ── */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[var(--c3)]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-[var(--c4)]/25 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 h-[350px] w-[350px] rounded-full bg-[var(--c2)]/15 blur-[100px]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 md:px-16">
        <div className="flex items-center gap-2">
          <img src={logo} alt="STUZIC" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-white/20 px-5 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/10"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-gradient-to-r from-[var(--c3)] to-[var(--c4)] px-5 py-2 text-sm font-semibold shadow-lg transition hover:scale-105"
          >
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-16 pb-24 text-center md:pt-28 md:pb-32">
        {/* Animated ring behind logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 m-auto h-44 w-44 animate-[spin_20s_linear_infinite] rounded-full border-2 border-dashed border-[var(--c2)]/30 md:h-56 md:w-56" />
          <div className="absolute inset-0 m-auto h-56 w-56 animate-[spin_30s_linear_infinite_reverse] rounded-full border border-[var(--c3)]/20 md:h-72 md:w-72" />
          <img
            src={logo}
            alt="STUZIC"
            className="relative z-10 mx-auto h-36 w-auto drop-shadow-2xl md:h-48"
          />
        </div>

        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Your All-in-One{" "}
          <span className="bg-gradient-to-r from-[var(--c2)] via-[var(--c3)] to-[var(--c4)] bg-clip-text text-transparent">
            Student Companion
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-lg text-[var(--c1)] md:text-xl">
          Notes, tasks, focus timer &amp; study music — everything you need to
          ace your academics, beautifully organized in one place.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--c3)] to-[var(--c4)] px-8 py-3.5 text-base font-semibold shadow-xl transition hover:scale-105 hover:shadow-[var(--c3)]/30"
          >
            Get Started — It's Free
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="#features"
            className="rounded-2xl border border-white/20 px-8 py-3.5 text-base font-medium backdrop-blur transition hover:bg-white/10"
          >
            Explore Features
          </a>
        </div>

        {/* Floating emojis (decorative) */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <span className="absolute left-[10%] top-[20%] animate-bounce text-3xl opacity-60" style={{ animationDelay: "0s", animationDuration: "3s" }}>📚</span>
          <span className="absolute right-[12%] top-[18%] animate-bounce text-3xl opacity-60" style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}>🎧</span>
          <span className="absolute left-[18%] bottom-[15%] animate-bounce text-2xl opacity-60" style={{ animationDelay: "1s", animationDuration: "4s" }}>☕</span>
          <span className="absolute right-[15%] bottom-[20%] animate-bounce text-2xl opacity-60" style={{ animationDelay: "1.5s", animationDuration: "3.2s" }}>✨</span>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-xl md:grid-cols-4 md:gap-0 md:divide-x md:divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold md:text-4xl">{s.value}</span>
              <span className="text-sm text-[var(--c1)]">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-28 md:py-36">
        <div className="text-center">
          <span className="inline-block rounded-full bg-[var(--c3)]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--c2)]">
            Features
          </span>
          <h2 className="mt-4 text-3xl font-bold md:text-5xl">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-[var(--c2)] to-[var(--c3)] bg-clip-text text-transparent">
              Study Smarter
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--c1)]">
            Built by students, for students — STUZIC combines the tools you
            actually use into one distraction-free workspace.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur transition hover:border-[var(--c3)]/40 hover:bg-white/10 hover:shadow-xl hover:shadow-[var(--c3)]/5"
            >
              <span className="mb-4 inline-block text-4xl transition-transform group-hover:scale-110">
                {f.icon}
              </span>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--c1)]">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-28 md:pb-36">
        <div className="text-center">
          <span className="inline-block rounded-full bg-[var(--c4)]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--c2)]">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-bold md:text-5xl">
            Three Steps to{" "}
            <span className="bg-gradient-to-r from-[var(--c3)] to-[var(--c4)] bg-clip-text text-transparent">
              Better Grades
            </span>
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            { step: "01", title: "Sign Up", desc: "Create your free account in seconds — no credit card required." },
            { step: "02", title: "Organize", desc: "Add your courses, tasks, and notes. STUZIC keeps everything tidy." },
            { step: "03", title: "Focus & Achieve", desc: "Use the timer & music to study effectively and crush your goals." },
          ].map((item) => (
            <div key={item.step} className="relative rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--c3)] to-[var(--c4)] text-xl font-bold shadow-lg">
                {item.step}
              </span>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--c1)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28 md:pb-36">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--c3)] to-[var(--c4)] px-8 py-16 text-center shadow-2xl md:px-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          </div>
          <h2 className="relative text-3xl font-bold md:text-4xl">
            Ready to Level Up Your Studies?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/80">
            Join thousands of students who are already studying smarter with
            STUZIC. It's free, fast, and built for you.
          </p>
          <Link
            to="/register"
            className="relative mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 font-semibold text-[var(--c5)] shadow-lg transition hover:scale-105"
          >
            Create Your Free Account
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-[var(--c1)]">
        <div className="flex items-center justify-center gap-2">
          <img src={logo} alt="STUZIC" className="h-6 w-auto opacity-70" />
          <span>© {new Date().getFullYear()} STUZIC. Built for students, by students.</span>
        </div>
      </footer>
    </div>
  );
}