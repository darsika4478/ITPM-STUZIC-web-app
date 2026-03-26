import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import GreetingBanner from "../components/dashboard/GreetingBanner";
import MoodCheckIn from "../components/dashboard/MoodCheckIn";
import SoundtrackCard from "../components/dashboard/SoundtrackCard";
import TaskStream from "../components/dashboard/TaskStream";
import TodayLineup from "../components/dashboard/TodayLineup";
import QuickCapture from "../components/dashboard/QuickCapture";
import PulseStrip from "../components/dashboard/PulseStrip";
import StreakStats from "../components/dashboard/StreakStats";
import UpcomingSchedule from "../components/dashboard/UpcomingSchedule";

export default function DashboardHome() {
  const [tasks, setTasks] = useState([]);
  const [moods, setMoods] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingMoods, setLoadingMoods] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Tasks listener
    const q1 = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub1 = onSnapshot(q1, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingTasks(false);
    }, () => setLoadingTasks(false));

    // Moods listener — last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];

    const q2 = query(
      collection(db, "moods"),
      where("userId", "==", user.uid),
      where("date", ">=", dateStr),
      orderBy("date", "desc")
    );
    const unsub2 = onSnapshot(q2, (snap) => {
      const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMoods(entries);

      const todayStr = new Date().toISOString().split("T")[0];
      const todayEntry = entries.find((m) => m.date === todayStr);
      if (todayEntry) {
        const ts = todayEntry.createdAt?.toDate?.();
        setTodayMood({
          ...todayEntry,
          time: ts ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
        });
      }
      setLoadingMoods(false);
    }, () => setLoadingMoods(false));

    return () => { unsub1(); unsub2(); };
  }, []);

  const handleMoodLogged = (moodData) => {
    setTodayMood(moodData);
  };

  // Mood streak
  let moodStreak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    if (moods.some((m) => m.date === ds)) moodStreak++;
    else break;
  }

  const Skeleton = ({ className = "" }) => (
    <div className={`animate-pulse rounded-2xl border border-white/10 bg-white/5 ${className}`} />
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">

      {/* ── ZONE 1: RIGHT NOW ── */}
      <GreetingBanner tasks={tasks} todayMood={todayMood} moodStreak={moodStreak} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {loadingMoods ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        ) : (
          <>
            <MoodCheckIn todayMood={todayMood} onMoodLogged={handleMoodLogged} />
            <SoundtrackCard todayMood={todayMood} />
          </>
        )}
      </div>

      {/* ── ZONE 2: GET IT DONE ── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--c2)]">
          📋 Task Stream
        </p>
        {loadingTasks ? (
          <Skeleton className="h-32" />
        ) : (
          <TaskStream tasks={tasks} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {loadingTasks ? (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </>
        ) : (
          <>
            <TodayLineup tasks={tasks} />
            <QuickCapture />
          </>
        )}
      </div>

      {/* ── ZONE 3: YOUR RHYTHM ── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--c2)]">
          📊 7-Day Pulse
        </p>
        {loadingMoods ? (
          <Skeleton className="h-28" />
        ) : (
          <PulseStrip moods={moods} tasks={tasks} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StreakStats moods={moods} tasks={tasks} />
        <UpcomingSchedule />
      </div>
    </div>
  );
}
