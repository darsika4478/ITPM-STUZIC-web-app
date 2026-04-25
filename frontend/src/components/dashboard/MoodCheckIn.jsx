import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import GlassCard from "./GlassCard";

const MOOD_CONFIG = [
  { value: 1, emoji: "😢", label: "Sad", bg: "#B6B4BB" },
  { value: 2, emoji: "😕", label: "Low", bg: "#8F8BB6" },
  { value: 3, emoji: "😐", label: "Neutral", bg: "#585296" },
  { value: 4, emoji: "🙂", label: "Good", bg: "#3C436B" },
  { value: 5, emoji: "😄", label: "Happy", bg: "#272D3E" },
];

const ACTIVITIES = ["studying", "workingout", "commuting", "relaxing"];
const GENRES = ["lofi", "classical", "jazz", "electronic", "ambient", "rock", "pop", "tamil", "indie"];
const FOCUS_TIMES = ["15min", "25min", "45min", "60min", "90min"];
const VOCAL_PREFERENCES = ["instrumental", "vocals", "mixed"];

export default function MoodCheckIn({ todayMood, onMoodLogged }) {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [energy, setEnergy] = useState(3);
  const [activity, setActivity] = useState("");
  const [genre, setGenre] = useState("");
  const [focusTime, setFocusTime] = useState("");
  const [vocals, setVocals] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleEmojiClick = (moodItem) => {
    setSelectedMood(moodItem);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!selectedMood || !activity) return;
    setSaving(true);
    try {
      const moodData = {
        userId: auth.currentUser.uid,
        mood: selectedMood.value,
        moodLabel: selectedMood.label,
        energy,
        activity,
        genre: genre || null,
        vocals: vocals || null,
        focusTime: focusTime || null,
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split("T")[0],
      };
      await addDoc(collection(db, "moods"), moodData);
      
      const moodLogged = {
        ...selectedMood,
        energy,
        activity,
        genre,
        vocals,
        focusTime,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      
      onMoodLogged?.(moodLogged);
      
      // Navigate to recommendations page
      navigate("/mood-recommendation", { 
        state: { mood: moodLogged }
      });
      
      setShowForm(false);
      setSelectedMood(null);
      setGenre("");
      setVocals("");
      setFocusTime("");
    } catch (err) {
      console.error("Failed to save mood:", err);
    } finally {
      setSaving(false);
    }
  };

  if (todayMood) {
    const config = MOOD_CONFIG.find((m) => m.value === todayMood.mood) || MOOD_CONFIG[2];
    return (
      <GlassCard className="relative">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--c2)]">
          Today's Mood
        </p>
        <div className="flex items-center gap-4">
          <span className="text-5xl" style={{ filter: `drop-shadow(0 0 16px ${config.bg})` }}>
            {config.emoji}
          </span>
          <div>
            <p className="text-lg font-bold text-white">{config.label}</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={`h-2 w-2 rounded-full ${i <= (todayMood.energy || 3) ? "bg-[var(--c3)]" : "bg-white/15"}`} />
              ))}
              <span className="ml-1 text-[10px] text-[var(--c1)]">energy</span>
            </div>
            <p className="mt-1 text-[10px] text-[var(--c1)]">Logged at {todayMood.time || "—"}</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--c2)]">
        How are you feeling right now?
      </p>
      <div className="flex justify-between gap-2">
        {MOOD_CONFIG.map((m) => (
          <button
            key={m.value}
            onClick={() => handleEmojiClick(m)}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all ${
              selectedMood?.value === m.value ? "scale-110 bg-white/10 shadow-lg" : "hover:scale-105 hover:bg-white/5"
            }`}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="text-[10px] text-[var(--c1)]">{m.label}</span>
          </button>
        ))}
      </div>
      {showForm && selectedMood && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4 max-h-96 overflow-y-auto">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--c1)]">Energy Level: {energy}</label>
            <input type="range" min="1" max="5" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full accent-[var(--c3)]" />
          </div>
          
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--c1)]">What are you doing? *</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITIES.map((a) => (
                <button key={a} onClick={() => setActivity(a)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${activity === a ? "bg-[var(--c3)] text-white shadow" : "bg-white/5 text-[var(--c1)] hover:bg-white/10"}`}>
                  {a === "workingout" ? "Working Out" : a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--c1)]">Preferred Genre</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button key={g} onClick={() => setGenre(g)} className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${genre === g ? "bg-[var(--c3)] text-white shadow" : "bg-white/5 text-[var(--c1)] hover:bg-white/10"}`}>
                  {g === "tamil" ? "🇮🇳 Tamil" : g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--c1)]">Vocal Preference</label>
            <div className="flex gap-2">
              {VOCAL_PREFERENCES.map((v) => (
                <button key={v} onClick={() => setVocals(v)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${vocals === v ? "bg-[var(--c3)] text-white shadow" : "bg-white/5 text-[var(--c1)] hover:bg-white/10"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--c1)]">Session Duration</label>
            <div className="flex gap-2">
              {FOCUS_TIMES.map((t) => (
                <button key={t} onClick={() => setFocusTime(t)} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${focusTime === t ? "bg-[var(--c3)] text-white shadow" : "bg-white/5 text-[var(--c1)] hover:bg-white/10"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={!activity || saving} className="w-full rounded-xl bg-gradient-to-r from-[var(--c3)] to-[var(--c2)] py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--c3)]/30 transition hover:shadow-xl disabled:opacity-40">
            {saving ? "Saving..." : "Get Music Recommendations"}
          </button>
        </div>
      )}
    </GlassCard>
  );
}
