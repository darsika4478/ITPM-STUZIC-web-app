// Dummy track data – replace with Firestore fetched data when ready
// Each track has: id, title, artist, mood, duration (seconds), audioUrl (empty = UI preview only)

export const DUMMY_TRACKS = {
  focus: [
    { id: "f1", title: "Deep Focus Flow", artist: "LoFi Study", mood: "focus", duration: 215, audioUrl: "" },
    { id: "f2", title: "Caffeine & Code", artist: "Study Beats", mood: "focus", duration: 183, audioUrl: "" },
    { id: "f3", title: "Brain Activator", artist: "Ambient Works", mood: "focus", duration: 264, audioUrl: "" },
    { id: "f4", title: "Clarity Waves", artist: "ZenSounds", mood: "focus", duration: 197, audioUrl: "" },
  ],
  chill: [
    { id: "c1", title: "Midnight Chill", artist: "LoFi Chill", mood: "chill", duration: 240, audioUrl: "" },
    { id: "c2", title: "Sunday Afternoon", artist: "Soft Tones", mood: "chill", duration: 210, audioUrl: "" },
    { id: "c3", title: "Rainy Day Study", artist: "Chill Vibes", mood: "chill", duration: 225, audioUrl: "" },
  ],
  deepwork: [
    { id: "d1", title: "Dark Hours", artist: "Deep Study", mood: "deepwork", duration: 295, audioUrl: "" },
    { id: "d2", title: "Iron Concentration", artist: "Focus Engine", mood: "deepwork", duration: 312, audioUrl: "" },
    { id: "d3", title: "Locked In", artist: "Sigma Study", mood: "deepwork", duration: 270, audioUrl: "" },
  ],
  relax: [
    { id: "r1", title: "Forest Morning", artist: "Nature Sounds", mood: "relax", duration: 360, audioUrl: "" },
    { id: "r2", title: "Ocean Drift", artist: "Calm Waves", mood: "relax", duration: 320, audioUrl: "" },
  ],
  night: [
    { id: "n1", title: "Night Owl Sessions", artist: "Late Study", mood: "night", duration: 248, audioUrl: "" },
    { id: "n2", title: "3AM Library", artist: "Nocturnal Beats", mood: "night", duration: 233, audioUrl: "" },
    { id: "n3", title: "Stars & Notes", artist: "Lunar Sounds", mood: "night", duration: 290, audioUrl: "" },
  ],
};

// Default playlist for unknown moods
export const DEFAULT_PLAYLIST = DUMMY_TRACKS.focus;

// Helper: get playlist by mood key (case-insensitive)
export function getPlaylistByMood(mood) {
  if (!mood) return DEFAULT_PLAYLIST;
  const key = mood.toLowerCase();
  return DUMMY_TRACKS[key] || DEFAULT_PLAYLIST;
}

// Dummy past sessions for SessionHistory (replace with Firestore data)
export const DUMMY_SESSIONS = [
  {
    id: "s1",
    mood: "focus",
    trackTitle: "Deep Focus Flow",
    startTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    durationMinutes: 25,
  },
  {
    id: "s2",
    mood: "chill",
    trackTitle: "Midnight Chill",
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 30,
  },
  {
    id: "s3",
    mood: "deepwork",
    trackTitle: "Iron Concentration",
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 23.2 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 48,
  },
];
