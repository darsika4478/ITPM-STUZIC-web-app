import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, where, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import GreetingBanner from "../components/dashboard/GreetingBanner";
import MoodCheckIn from "../components/dashboard/MoodCheckIn";
import SoundtrackCard from "../components/dashboard/SoundtrackCard";
import TaskStream from "../components/dashboard/TaskStream";
import TodayLineup from "../components/dashboard/TodayLineup";
import QuickCapture from "../components/dashboard/QuickCapture";
import PulseStrip from "../components/dashboard/PulseStrip";
import StreakStats from "../components/dashboard/StreakStats";
import UpcomingSchedule from "../components/dashboard/UpcomingSchedule";

const MOOD_EMOJIS = {
  1: { emoji: '😢', label: 'Sad' },
  2: { emoji: '😕', label: 'Low' },
  3: { emoji: '😐', label: 'Neutral' },
  4: { emoji: '🙂', label: 'Good' },
  5: { emoji: '😄', label: 'Happy' },
};

export default function OverviewHome() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [moods, setMoods] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [sessionsStats, setSessionsStats] = useState({ count: 0, minutes: 0 });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingMoods, setLoadingMoods] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Announcements fetch
    const fetchAnnouncements = async () => {
      try {
        const q = query(
          collection(db, "announcements"),
          where("active", "==", true)
        );
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort by creation date descending
          docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          
          // Filter out expired announcements (older than 24 hours)
          const validAnnouncements = docs.filter(ann => {
            if (!ann.createdAt) return false;
            const isExpired = Date.now() - ann.createdAt.toMillis() > 24 * 60 * 60 * 1000;
            return !isExpired;
          });
          
          if (validAnnouncements.length > 0) {
            setAnnouncements(validAnnouncements);
          }
        }
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      }
    };
    fetchAnnouncements();

    // Study Sessions fetch (last 7 days)
    const fetchStudySessions = async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const q = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid)
        );
        // Getting all and filtering in memory to avoid missing indexes on createdAt
        const snap = await getDocs(q);
        let count = 0;
        let mins = 0;
        snap.docs.forEach(doc => {
          const data = doc.data();
          // handle createdAt Timestamp or date string
          let date;
          if (data.createdAt?.toDate) {
            date = data.createdAt.toDate();
          } else if (data.startTime?.toDate) {
            date = data.startTime.toDate();
          } else if (data.date) {
            date = new Date(data.date);
          } else if (data.createdAt) {
             date = new Date(data.createdAt);
          }
          if (date && date >= sevenDaysAgo) {
            count++;
            if (typeof data.durationMinutes === 'number') {
               mins += data.durationMinutes;
            } else if (data.startTime && data.endTime) {
               const start = data.startTime.toDate ? data.startTime.toDate() : new Date(data.startTime);
               const end = data.endTime.toDate ? data.endTime.toDate() : new Date(data.endTime);
               mins += Math.max(0, Math.round((end - start) / 60000));
            }
          }
        });
        setSessionsStats({ count, minutes: mins });
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    };
    fetchStudySessions();

    // Tasks listener
    const q1 = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub1 = onSnapshot(q1, (snap) => {
      const activeTasks = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => !t.isDeleted);
      setTasks(activeTasks);
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
      } else {
        setTodayMood(null);
      }
      setLoadingMoods(false);
    }, () => setLoadingMoods(false));

    return () => { unsub1(); unsub2(); };
  }, []);

  const handleMoodLogged = (moodData) => {
    setTodayMood(moodData);
  };

  // Task stats
  const taskStats = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const perc = Math.round((completed / total) * 100);
    return { total, completed, perc };
  }, [tasks]);

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

      {/* 1. Announcement Banners */}
      {announcements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {announcements
            .filter(ann => !dismissedIds.includes(ann.id))
            .map(ann => {
              const bgOpacity = '0.2';
              const borderOpacity = '0.4';
              const priorityColor = ann.priority === 'urgent' ? '239, 68, 68' : ann.priority === 'warning' ? '245, 158, 11' : '99, 102, 241';
              
              return (
                <div key={ann.id} style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: `rgba(${priorityColor}, ${bgOpacity})`,
                  border: `1px solid rgba(${priorityColor}, ${borderOpacity})`,
                  borderLeft: `4px solid rgb(${priorityColor})`
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <p style={{ color: '#f0ecff', margin: 0, fontWeight: 500, fontSize: '0.95rem' }}>
                      {ann.message || ann.text || "New announcement active."}
                    </p>
                    {ann.createdAt && (
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                        {(() => {
                          const now = new Date();
                          const date = ann.createdAt.toMillis ? new Date(ann.createdAt.toMillis()) : new Date(ann.createdAt);
                          const diffInSeconds = Math.floor((now - date) / 1000);
                          if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
                          const diffInMinutes = Math.floor(diffInSeconds / 60);
                          if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
                          const diffInHours = Math.floor(diffInMinutes / 60);
                          if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
                          const diffInDays = Math.floor(diffInHours / 24);
                          return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
                        })()}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setDismissedIds(prev => [...prev, ann.id])}
                    title="Dismiss"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#f0ecff',
                      cursor: 'pointer',
                      opacity: 0.7,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      lineHeight: 1,
                      marginLeft: '1rem'
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* 3-Column Grid for Mood Summary, Task Progress, Session Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        
        {/* 2. Today's Mood Summary */}
        <div style={{
          background: 'rgba(20,14,50,0.6)',
          borderRadius: '18px',
          border: '1px solid rgba(109,95,231,0.15)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h3 style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem 0' }}>Today's Mood</h3>
          {todayMood && todayMood.mood ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{MOOD_EMOJIS[todayMood.mood]?.emoji || '🎭'}</span>
                <div>
                   <p style={{ margin: 0, color: '#f0ecff', fontSize: '1.2rem', fontWeight: 700 }}>{MOOD_EMOJIS[todayMood.mood]?.label || 'Logged'}</p>
                   <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{todayMood.time || 'Logged today'}</p>
                </div>
             </div>
          ) : (
             <div>
                <p style={{ color: '#f0ecff', margin: '0 0 1rem 0', fontSize: '0.95rem' }}>You haven't logged your mood today.</p>
                <button 
                  onClick={() => navigate('/dashboard/mood')}
                  style={{
                    background: 'rgba(109,95,231,0.2)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(109,95,231,0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    width: '100%'
                  }}
                >
                  Log Mood Now
                </button>
             </div>
          )}
        </div>

        {/* 3. Task Completion Progress Bar */}
        <div style={{
          background: 'rgba(20,14,50,0.6)',
          borderRadius: '18px',
          border: '1px solid rgba(109,95,231,0.15)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h3 style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem 0' }}>Task Progress</h3>
          {taskStats ? (
             <div>
                <p style={{ color: '#f0ecff', margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 500 }}>
                  {taskStats.completed} of {taskStats.total} tasks completed ({taskStats.perc}%)
                </p>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${taskStats.perc}%`, height: '100%', background: '#22c55e', borderRadius: '4px' }} />
                </div>
             </div>
          ) : (
             <div>
                <p style={{ color: '#f0ecff', margin: '0 0 1rem 0', fontSize: '0.95rem' }}>No tasks yet.</p>
                <button 
                  onClick={() => navigate('/dashboard/tasks')}
                  style={{
                    background: 'rgba(109,95,231,0.2)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(109,95,231,0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    width: '100%'
                  }}
                >
                  Add a Task
                </button>
             </div>
          )}
        </div>

        {/* 4. Study Session Stats (This Week) */}
        <div style={{
          background: 'rgba(20,14,50,0.6)',
          borderRadius: '18px',
          border: '1px solid rgba(109,95,231,0.15)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h3 style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem 0' }}>This Week's Focus</h3>
          {sessionsStats.count > 0 ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                   <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Sessions</p>
                   <p style={{ margin: 0, color: '#f0ecff', fontSize: '1.5rem', fontWeight: 700 }}>{sessionsStats.count}</p>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ flex: 1 }}>
                   <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Time</p>
                   <p style={{ margin: 0, color: '#f0ecff', fontSize: '1.5rem', fontWeight: 700 }}>
                     {sessionsStats.minutes >= 60 
                       ? `${(sessionsStats.minutes / 60).toFixed(1)}h` 
                       : `${sessionsStats.minutes}m`}
                   </p>
                </div>
             </div>
          ) : (
             <div>
                <p style={{ color: '#f0ecff', margin: '0 0 1rem 0', fontSize: '0.95rem' }}>No study sessions this week.</p>
                <button 
                  onClick={() => navigate('/dashboard/study-session')}
                  style={{
                    background: 'rgba(109,95,231,0.2)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(109,95,231,0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    width: '100%'
                  }}
                >
                  Start a Session
                </button>
             </div>
          )}
        </div>

      </div>

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
