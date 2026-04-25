// Comprehensive mood-based track database with multi-language support
// Including Tamil, English, and other tracks based on mood and activity

// ════════════════════════════════════════════════════════════════════
// MOOD-BASED PLAYLIST STRUCTURE
// Each mood has tracks categorized by activity, genre, and preference
// ════════════════════════════════════════════════════════════════════

export const MOOD_PLAYLISTS = {
  sad: {
    studying: [
      { id: "sad-study-1", title: "Melancholic Focus", artist: "LoFi Composer", mood: "sad", activity: "studying", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: "sad-study-2", title: "Raindrop Reflection", artist: "Ambient Works", mood: "sad", activity: "studying", genre: "ambient", vocals: "instrumental", duration: 480, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
      { id: "sad-study-3", title: "Kadhal Maraindhavai", artist: "Tamil Classics", mood: "sad", activity: "studying", genre: "tamil", vocals: "vocals", duration: 390, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
      { id: "sad-study-4", title: "Slow Classical Study", artist: "Piano Melodies", mood: "sad", activity: "studying", genre: "classical", vocals: "instrumental", duration: 450, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
      { id: "sad-study-5", title: "Nenjukku Needhi", artist: "Tamil Instruments", mood: "sad", activity: "studying", genre: "tamil", vocals: "instrumental", duration: 400, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    ],
    relaxing: [
      { id: "sad-relax-1", title: "Evening Melancholy", artist: "Soft Tones", mood: "sad", activity: "relaxing", genre: "ambient", vocals: "instrumental", duration: 480, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
      { id: "sad-relax-2", title: "Memories Fade Away", artist: "Indie Artists", mood: "sad", activity: "relaxing", genre: "indie", vocals: "vocals", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
      { id: "sad-relax-3", title: "Mayakkam Enna", artist: "Tamil Soul", mood: "sad", activity: "relaxing", genre: "tamil", vocals: "vocals", duration: 450, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
    ],
    commuting: [
      { id: "sad-commute-1", title: "Commute Comfort", artist: "LoFi Hip Hop", mood: "sad", activity: "commuting", genre: "lofi", vocals: "instrumental", duration: 400, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
      { id: "sad-commute-2", title: "Urban Reflections", artist: "Electro Ambient", mood: "sad", activity: "commuting", genre: "electronic", vocals: "instrumental", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
    ],
    workingout: [
      { id: "sad-workout-1", title: "Slow Burn Energy", artist: "Low BPM Beats", mood: "sad", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 360, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
      { id: "sad-workout-2", title: "Motivate Your Soul", artist: "Deep House", mood: "sad", activity: "workingout", genre: "rock", vocals: "vocals", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
    ]
  },

  low: {
    studying: [
      { id: "low-study-1", title: "Gentle Focus", artist: "Study Vibes", mood: "low", activity: "studying", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
      { id: "low-study-2", title: "Quiet Mind", artist: "Zen Sounds", mood: "low", activity: "studying", genre: "ambient", vocals: "instrumental", duration: 480, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" },
      { id: "low-study-3", title: "Idhazhin Neela Vannam", artist: "Tamil Instrumental", mood: "low", activity: "studying", genre: "tamil", vocals: "instrumental", duration: 400, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
    ],
    relaxing: [
      { id: "low-relax-1", title: "Peaceful Afternoon", artist: "Nature Sounds", mood: "low", activity: "relaxing", genre: "ambient", vocals: "instrumental", duration: 480, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" },
      { id: "low-relax-2", title: "Slow Jazz Evening", artist: "Jazz Café", mood: "low", activity: "relaxing", genre: "jazz", vocals: "instrumental", duration: 450, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    ],
    commuting: [
      { id: "low-commute-1", title: "Easy Commute", artist: "Chill Vibes", mood: "low", activity: "commuting", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    ],
    workingout: [
      { id: "low-workout-1", title: "Gentle Motion", artist: "Light Beats", mood: "low", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 360, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    ]
  },

  neutral: {
    studying: [
      { id: "neutral-study-1", title: "Deep Focus Flow", artist: "LoFi Study", mood: "neutral", activity: "studying", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
      { id: "neutral-study-2", title: "Caffeine & Code", artist: "Focus Engine", mood: "neutral", activity: "studying", genre: "electronic", vocals: "instrumental", duration: 450, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    ],
    relaxing: [
      { id: "neutral-relax-1", title: "Balanced Vibes", artist: "Mid Tempo", mood: "neutral", activity: "relaxing", genre: "lofi", vocals: "instrumental", duration: 450, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
    ],
    commuting: [
      { id: "neutral-commute-1", title: "Commute Mix", artist: "Daily Beats", mood: "neutral", activity: "commuting", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
    ],
    workingout: [
      { id: "neutral-workout-1", title: "Steady Beats", artist: "Rhythm Masters", mood: "neutral", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 380, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
    ]
  },

  good: {
    studying: [
      { id: "good-study-1", title: "Positive Focus", artist: "Uplifting Study", mood: "good", activity: "studying", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
    ],
    relaxing: [
      { id: "good-relax-1", title: "Sunny Afternoon", artist: "Nature Sounds", mood: "good", activity: "relaxing", genre: "ambient", vocals: "instrumental", duration: 480, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
    ],
    commuting: [
      { id: "good-commute-1", title: "Happy Commute", artist: "Feel Good Beats", mood: "good", activity: "commuting", genre: "pop", vocals: "vocals", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
    ],
    workingout: [
      { id: "good-workout-1", title: "Energize Your Day", artist: "Motivation Crew", mood: "good", activity: "workingout", genre: "rock", vocals: "vocals", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
    ]
  },

  happy: {
    studying: [
      { id: "happy-study-1", title: "Joyful Focus", artist: "Happy Study", mood: "happy", activity: "studying", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
    ],
    relaxing: [
      { id: "happy-relax-1", title: "Pure Joy", artist: "Feel Good", mood: "happy", activity: "relaxing", genre: "lofi", vocals: "instrumental", duration: 480, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" },
    ],
    commuting: [
      { id: "happy-commute-1", title: "Happiness Ride", artist: "Good Vibes Crew", mood: "happy", activity: "commuting", genre: "pop", vocals: "vocals", duration: 430, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
    ],
    workingout: [
      { id: "happy-workout-1", title: "Upbeat Energy", artist: "Bright Beats", mood: "happy", activity: "workingout", genre: "rock", vocals: "vocals", duration: 420, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    ]
  }
};

// ════════════════════════════════════════════════════════════════════
// LEGACY DATA FOR BACKWARD COMPATIBILITY
// ════════════════════════════════════════════════════════════════════

export const DUMMY_TRACKS = {
  sad: [
    { id: "s1", title: "Melancholy Echoes", artist: "LoFi Tears", mood: "sad", duration: 215, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "s2", title: "Raindrops", artist: "Soft Tones", mood: "sad", duration: 183, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "s3", title: "Fading Light", artist: "Ambient Works", mood: "sad", duration: 264, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  ],
  low: [
    { id: "l1", title: "Slow Morning", artist: "Chill Vibes", mood: "low", duration: 240, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    { id: "l2", title: "Quiet Thoughts", artist: "ZenSounds", mood: "low", duration: 210, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    { id: "l3", title: "Gray Skies", artist: "Study Beats", mood: "low", duration: 225, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  ],
  neutral: [
    { id: "n1", title: "Deep Focus Flow", artist: "LoFi Study", mood: "neutral", duration: 295, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
    { id: "n2", title: "Caffeine & Code", artist: "Focus Engine", mood: "neutral", duration: 312, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
    { id: "n3", title: "Steady Pace", artist: "Sigma Study", mood: "neutral", duration: 270, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
  ],
  good: [
    { id: "g1", title: "Sunny Afternoon", artist: "Nature Sounds", mood: "good", duration: 360, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
    { id: "g2", title: "Light Breeze", artist: "Calm Waves", mood: "good", duration: 320, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
  ],
  happy: [
    { id: "h1", title: "Upbeat Energy", artist: "Bright Beats", mood: "happy", duration: 248, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
    { id: "h2", title: "Joyful Ride", artist: "Pop Study", mood: "happy", duration: 233, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" },
    { id: "h3", title: "Golden Hour", artist: "Sunny Sounds", mood: "happy", duration: 290, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
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

// Helper: get recommendations based on mood and activity
export function getRecommendationsByMoodAndActivity(moodValue, activity) {
  const moodKeys = { 1: 'sad', 2: 'low', 3: 'neutral', 4: 'good', 5: 'happy' };
  const moodKey = moodKeys[moodValue] || 'neutral';
  const moodData = MOOD_PLAYLISTS[moodKey];
  
  if (!moodData || !moodData[activity]) {
    return [];
  }
  
  return moodData[activity];
}

// Helper: get recommendations based on mood, activity, and preferences
export function getFilteredRecommendations(moodValue, activity, preferences = {}) {
  let tracks = getRecommendationsByMoodAndActivity(moodValue, activity);
  
  if (preferences.genre) {
    tracks = tracks.filter(t => t.genre === preferences.genre.toLowerCase());
  }
  
  if (preferences.vocals) {
    tracks = tracks.filter(t => t.vocals === preferences.vocals.toLowerCase());
  }
  
  return tracks;
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
