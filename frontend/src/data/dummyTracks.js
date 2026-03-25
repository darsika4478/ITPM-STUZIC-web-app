// Dummy track data – replace with Firestore fetched data when ready
// Each track has: id, title, artist, mood, duration (seconds), audioUrl (empty = UI preview only)

export const DUMMY_TRACKS = {
  sad: [
    { id: "s1", title: "Melancholy Echoes", artist: "LoFi Tears", mood: "sad", duration: 215, audioUrl: "" },
    { id: "s2", title: "Raindrops", artist: "Soft Tones", mood: "sad", duration: 183, audioUrl: "" },
    { id: "s3", title: "Fading Light", artist: "Ambient Works", mood: "sad", duration: 264, audioUrl: "" },
  ],
  low: [
    { id: "l1", title: "Slow Morning", artist: "Chill Vibes", mood: "low", duration: 240, audioUrl: "" },
    { id: "l2", title: "Quiet Thoughts", artist: "ZenSounds", mood: "low", duration: 210, audioUrl: "" },
    { id: "l3", title: "Gray Skies", artist: "Study Beats", mood: "low", duration: 225, audioUrl: "" },
  ],
  neutral: [
    { id: "n1", title: "Deep Focus Flow", artist: "LoFi Study", mood: "neutral", duration: 295, audioUrl: "" },
    { id: "n2", title: "Caffeine & Code", artist: "Focus Engine", mood: "neutral", duration: 312, audioUrl: "" },
    { id: "n3", title: "Steady Pace", artist: "Sigma Study", mood: "neutral", duration: 270, audioUrl: "" },
  ],
  good: [
    { id: "g1", title: "Sunny Afternoon", artist: "Nature Sounds", mood: "good", duration: 360, audioUrl: "" },
    { id: "g2", title: "Light Breeze", artist: "Calm Waves", mood: "good", duration: 320, audioUrl: "" },
  ],
  happy: [
    { id: "h1", title: "Upbeat Energy", artist: "Bright Beats", mood: "happy", duration: 248, audioUrl: "" },
    { id: "h2", title: "Joyful Ride", artist: "Pop Study", mood: "happy", duration: 233, audioUrl: "" },
    { id: "h3", title: "Golden Hour", artist: "Sunny Sounds", mood: "happy", duration: 290, audioUrl: "" },
  ],
};

// Default playlist for unknown moods
export const DEFAULT_PLAYLIST = DUMMY_TRACKS.neutral;

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
