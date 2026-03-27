import { auth } from "../../config/firebase";

export default function GreetingBanner({ tasks = [], todayMood = null, moodStreak = 0 }) {
  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening";
  const userName = auth.currentUser?.displayName?.split(" ")[0] || "Student";

  const overdue = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date(new Date().toDateString());
  }).length;
  const active = tasks.filter((t) => !t.completed).length;

  let subtitle;
  if (overdue > 0) {
    subtitle = `You have ${overdue} overdue task${overdue !== 1 ? "s" : ""} — let's sort them out.`;
  } else if (todayMood) {
    subtitle = `Feeling ${todayMood.emoji} today. Your vibe is set!`;
  } else if (moodStreak > 3) {
    subtitle = `You're on a ${moodStreak}-day mood streak 🔥`;
  } else {
    subtitle = `You have ${active} active task${active !== 1 ? "s" : ""}. Let's get to it.`;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">
        {greeting}, {userName} 👋
      </h1>
      <p className="mt-1 text-sm text-[var(--c1)]">{subtitle}</p>
    </div>
  );
}
