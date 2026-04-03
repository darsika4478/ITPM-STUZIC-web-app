// Comprehensive mood-based track database with multi-language support
// Including Tamil, English, and other tracks based on mood and activity

// ════════════════════════════════════════════════════════════════════
// MOOD-BASED PLAYLIST STRUCTURE
// Each mood has tracks categorized by activity, genre, and preference
// ════════════════════════════════════════════════════════════════════

export const MOOD_PLAYLISTS = {
  sad: {
    studying: [
      { id: "sad-study-1", title: "Melancholic Focus", artist: "LoFi Composer", mood: "sad", activity: "studying", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "" },
      { id: "sad-study-2", title: "Raindrop Reflection", artist: "Ambient Works", mood: "sad", activity: "studying", genre: "ambient", vocals: "instrumental", duration: 480, audioUrl: "" },
      { id: "sad-study-3", title: "Kadhal Maraindhavai", artist: "Tamil Classics", mood: "sad", activity: "studying", genre: "tamil", vocals: "vocals", duration: 390, audioUrl: "" },
      { id: "sad-study-4", title: "Slow Classical Study", artist: "Piano Melodies", mood: "sad", activity: "studying", genre: "classical", vocals: "instrumental", duration: 450, audioUrl: "" },
      { id: "sad-study-5", title: "Nenjukku Needhi", artist: "Tamil Instruments", mood: "sad", activity: "studying", genre: "tamil", vocals: "instrumental", duration: 400, audioUrl: "" },
      { id: "sad-study-6", title: "Deep Sorrow", artist: "Piano Works", mood: "sad", activity: "studying", genre: "classical", vocals: "instrumental", duration: 440, audioUrl: "" },
      { id: "sad-study-7", title: "Melancholy Street", artist: "Jazz Quartet", mood: "sad", activity: "studying", genre: "jazz", vocals: "instrumental", duration: 360, audioUrl: "" },
      { id: "sad-study-8", title: "Vaalkai Anaivarum", artist: "Tamil Folk", mood: "sad", activity: "studying", genre: "tamil", vocals: "vocals", duration: 420, audioUrl: "" },
    ],
    relaxing: [
      { id: "sad-relax-1", title: "Evening Melancholy", artist: "Soft Tones", mood: "sad", activity: "relaxing", genre: "ambient", vocals: "instrumental", duration: 480, audioUrl: "" },
      { id: "sad-relax-2", title: "Memories Fade Away", artist: "Indie Artists", mood: "sad", activity: "relaxing", genre: "indie", vocals: "vocals", duration: 420, audioUrl: "" },
      { id: "sad-relax-3", title: "Mayakkam Enna", artist: "Tamil Soul", mood: "sad", activity: "relaxing", genre: "tamil", vocals: "vocals", duration: 450, audioUrl: "" },
      { id: "sad-relax-4", title: "Gentle Jazz Nights", artist: "Jazz Lounge", mood: "sad", activity: "relaxing", genre: "jazz", vocals: "instrumental", duration: 400, audioUrl: "" },
      { id: "sad-relax-5", title: "Kaatru Vanam", artist: "Tamil Ambience", mood: "sad", activity: "relaxing", genre: "tamil", vocals: "instrumental", duration: 390, audioUrl: "" },
      { id: "sad-relax-6", title: "Lonely Strings", artist: "Cello Dreams", mood: "sad", activity: "relaxing", genre: "classical", vocals: "instrumental", duration: 440, audioUrl: "" },
    ],
    commuting: [
      { id: "sad-commute-1", title: "Commute Comfort", artist: "LoFi Hip Hop", mood: "sad", activity: "commuting", genre: "lofi", vocals: "instrumental", duration: 400, audioUrl: "" },
      { id: "sad-commute-2", title: "Urban Reflections", artist: "Electro Ambient", mood: "sad", activity: "commuting", genre: "electronic", vocals: "instrumental", duration: 420, audioUrl: "" },
      { id: "sad-commute-3", title: "Thani Oruvan", artist: "Tamil Cinema", mood: "sad", activity: "commuting", genre: "tamil", vocals: "vocals", duration: 430, audioUrl: "" },
      { id: "sad-commute-4", title: "City Blues", artist: "Urban Beats", mood: "sad", activity: "commuting", genre: "indie", vocals: "vocals", duration: 380, audioUrl: "" },
      { id: "sad-commute-5", title: "Mannin Sagaram", artist: "Tamil Journey", mood: "sad", activity: "commuting", genre: "tamil", vocals: "instrumental", duration: 410, audioUrl: "" },
    ],
    workingout: [
      { id: "sad-workout-1", title: "Slow Burn Energy", artist: "Low BPM Beats", mood: "sad", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 360, audioUrl: "" },
      { id: "sad-workout-2", title: "Motivate Your Soul", artist: "Deep House", mood: "sad", activity: "workingout", genre: "rock", vocals: "vocals", duration: 420, audioUrl: "" },
      { id: "sad-workout-3", title: "Kathai Thiraippu", artist: "Tamil Rhythm", mood: "sad", activity: "workingout", genre: "tamil", vocals: "vocals", duration: 400, audioUrl: "" },
      { id: "sad-workout-4", title: "Strength Within", artist: "Electronic Beats", mood: "sad", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 380, audioUrl: "" },
    ]
  },

  low: {
    studying: [
      { id: "low-study-1", title: "Gentle Focus", artist: "Study Vibes", mood: "low", activity: "studying", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "" },
      { id: "low-study-2", title: "Quiet Mind", artist: "Zen Sounds", mood: "low", activity: "studying", genre: "ambient", vocals: "instrumental", duration: 480, audioUrl: "" },
      { id: "low-study-3", title: "Idhazhin Neela Vannam", artist: "Tamil Instrumental", mood: "low", activity: "studying", genre: "tamil", vocals: "instrumental", duration: 400, audioUrl: "" },
      { id: "low-study-4", title: "Soft Piano Study", artist: "Classical Waves", mood: "low", activity: "studying", genre: "classical", vocals: "instrumental", duration: 450, audioUrl: "" },
      { id: "low-study-5", title: "Naalai Naalaiyum", artist: "Tamil Classical", mood: "low", activity: "studying", genre: "tamil", vocals: "vocals", duration: 390, audioUrl: "" },
      { id: "low-study-6", title: "Quiet Waters", artist: "Piano Meditations", mood: "low", activity: "studying", genre: "classical", vocals: "instrumental", duration: 440, audioUrl: "" },
      { id: "low-study-7", title: "Gentle Electronic", artist: "Soft Synths", mood: "low", activity: "studying", genre: "electronic", vocals: "instrumental", duration: 410, audioUrl: "" },
    ],
    relaxing: [
      { id: "low-relax-1", title: "Peaceful Afternoon", artist: "Nature Sounds", mood: "low", activity: "relaxing", genre: "ambient", vocals: "instrumental", duration: 480, audioUrl: "" },
      { id: "low-relax-2", title: "Slow Jazz Evening", artist: "Jazz Café", mood: "low", activity: "relaxing", genre: "jazz", vocals: "instrumental", duration: 450, audioUrl: "" },
      { id: "low-relax-3", title: "Porangalil Vaanilai", artist: "Tamil Classics", mood: "low", activity: "relaxing", genre: "tamil", vocals: "vocals", duration: 420, audioUrl: "" },
      { id: "low-relax-4", title: "Kunindha Naalai", artist: "Tamil Soul", mood: "low", activity: "relaxing", genre: "tamil", vocals: "vocals", duration: 400, audioUrl: "" },
      { id: "low-relax-5", title: "Mellow Vibes", artist: "Lounge Jazz", mood: "low", activity: "relaxing", genre: "jazz", vocals: "instrumental", duration: 440, audioUrl: "" },
    ],
    commuting: [
      { id: "low-commute-1", title: "Easy Commute", artist: "Chill Vibes", mood: "low", activity: "commuting", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "" },
      { id: "low-commute-2", title: "Soft Electronic", artist: "Synth Wave", mood: "low", activity: "commuting", genre: "electronic", vocals: "instrumental", duration: 400, audioUrl: "" },
      { id: "low-commute-3", title: "Agaramukkam", artist: "Tamil Ambient", mood: "low", activity: "commuting", genre: "tamil", vocals: "instrumental", duration: 390, audioUrl: "" },
      { id: "low-commute-4", title: "Slowpoke Journey", artist: "Indie Beats", mood: "low", activity: "commuting", genre: "indie", vocals: "vocals", duration: 430, audioUrl: "" },
    ],
    workingout: [
      { id: "low-workout-1", title: "Gentle Motion", artist: "Light Beats", mood: "low", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 360, audioUrl: "" },
      { id: "low-workout-2", title: "Momentum", artist: "Light Rhythms", mood: "low", activity: "workingout", genre: "lofi", vocals: "instrumental", duration: 390, audioUrl: "" },
      { id: "low-workout-3", title: "Kanavey Nilam", artist: "Tamil Motion", mood: "low", activity: "workingout", genre: "tamil", vocals: "vocals", duration: 420, audioUrl: "" },
      { id: "low-workout-4", title: "Steady Pace", artist: "Electronic Motion", mood: "low", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 400, audioUrl: "" },
    ]
  },

  neutral: {
    studying: [
      { id: "neutral-study-1", title: "Deep Focus Flow", artist: "LoFi Study", mood: "neutral", activity: "studying", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "" },
      { id: "neutral-study-2", title: "Caffeine & Code", artist: "Focus Engine", mood: "neutral", activity: "studying", genre: "electronic", vocals: "instrumental", duration: 450, audioUrl: "" },
      { id: "neutral-study-3", title: "Nithya Parayana", artist: "Tamil Study Mix", mood: "neutral", activity: "studying", genre: "tamil", vocals: "instrumental", duration: 400, audioUrl: "" },
      { id: "neutral-study-4", title: "Steady Pace", artist: "Sigma Study", mood: "neutral", activity: "studying", genre: "classical", vocals: "instrumental", duration: 430, audioUrl: "" },
      { id: "neutral-study-5", title: "Manasukku Maanusam", artist: "Tamil Focus", mood: "neutral", activity: "studying", genre: "tamil", vocals: "vocals", duration: 390, audioUrl: "" },
      { id: "neutral-study-6", title: "Concentration", artist: "Study Masters", mood: "neutral", activity: "studying", genre: "ambient", vocals: "instrumental", duration: 440, audioUrl: "" },
    ],
    relaxing: [
      { id: "neutral-relax-1", title: "Balanced Vibes", artist: "Mid Tempo", mood: "neutral", activity: "relaxing", genre: "lofi", vocals: "instrumental", duration: 450, audioUrl: "" },
      { id: "neutral-relax-2", title: "Neutral Zone Jazz", artist: "Jazz Trio", mood: "neutral", activity: "relaxing", genre: "jazz", vocals: "instrumental", duration: 480, audioUrl: "" },
      { id: "neutral-relax-3", title: "Dil Dilam Nozhantha", artist: "Tamil Vocals", mood: "neutral", activity: "relaxing", genre: "tamil", vocals: "vocals", duration: 420, audioUrl: "" },
      { id: "neutral-relax-4", title: "Inbam Mayakkam", artist: "Tamil Relaxation", mood: "neutral", activity: "relaxing", genre: "tamil", vocals: "vocals", duration: 400, audioUrl: "" },
      { id: "neutral-relax-5", title: "Ambient Dreams", artist: "Zen Masters", mood: "neutral", activity: "relaxing", genre: "ambient", vocals: "instrumental", duration: 460, audioUrl: "" },
    ],
    commuting: [
      { id: "neutral-commute-1", title: "Commute Mix", artist: "Daily Beats", mood: "neutral", activity: "commuting", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "" },
      { id: "neutral-commute-2", title: "Urban Journey", artist: "Electronic Routes", mood: "neutral", activity: "commuting", genre: "electronic", vocals: "instrumental", duration: 430, audioUrl: "" },
      { id: "neutral-commute-3", title: "Ponnukaran Kadan", artist: "Tamil Commute", mood: "neutral", activity: "commuting", genre: "tamil", vocals: "vocals", duration: 400, audioUrl: "" },
      { id: "neutral-commute-4", title: "Narai Yaarum", artist: "Tamil Journey", mood: "neutral", activity: "commuting", genre: "tamil", vocals: "instrumental", duration: 410, audioUrl: "" },
    ],
    workingout: [
      { id: "neutral-workout-1", title: "Steady Beats", artist: "Rhythm Masters", mood: "neutral", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 380, audioUrl: "" },
      { id: "neutral-workout-2", title: "Moderate Energy", artist: "Fit Vibes", mood: "neutral", activity: "workingout", genre: "rock", vocals: "vocals", duration: 410, audioUrl: "" },
      { id: "neutral-workout-3", title: "Katrum Kaalam", artist: "Tamil Beats", mood: "neutral", activity: "workingout", genre: "tamil", vocals: "vocals", duration: 420, audioUrl: "" },
      { id: "neutral-workout-4", title: "Balanced Energy", artist: "Electronic Motion", mood: "neutral", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 400, audioUrl: "" },
    ]
  },

  good: {
    studying: [
      { id: "good-study-1", title: "Positive Focus", artist: "Uplifting Study", mood: "good", activity: "studying", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "" },
      { id: "good-study-2", title: "Good Vibes Only", artist: "Positive Energy", mood: "good", activity: "studying", genre: "electronic", vocals: "instrumental", duration: 450, audioUrl: "" },
      { id: "good-study-3", title: "Thamarai Noorangal", artist: "Tamil Positivity", mood: "good", activity: "studying", genre: "tamil", vocals: "vocals", duration: 430, audioUrl: "" },
      { id: "good-study-4", title: "Uplifting Classical", artist: "Bright Melodies", mood: "good", activity: "studying", genre: "classical", vocals: "instrumental", duration: 440, audioUrl: "" },
      { id: "good-study-5", title: "Kangal Irundha", artist: "Tamil Brightness", mood: "good", activity: "studying", genre: "tamil", vocals: "vocals", duration: 400, audioUrl: "" },
    ],
    relaxing: [
      { id: "good-relax-1", title: "Sunny Afternoon", artist: "Nature Sounds", mood: "good", activity: "relaxing", genre: "ambient", vocals: "instrumental", duration: 480, audioUrl: "" },
      { id: "good-relax-2", title: "Light Breeze", artist: "Calm Waves", mood: "good", activity: "relaxing", genre: "jazz", vocals: "instrumental", duration: 450, audioUrl: "" },
      { id: "good-relax-3", title: "Uyire Uyire", artist: "Tamil Romance", mood: "good", activity: "relaxing", genre: "tamil", vocals: "vocals", duration: 440, audioUrl: "" },
      { id: "good-relax-4", title: "Azhagana Malai", artist: "Tamil Beauty", mood: "good", activity: "relaxing", genre: "tamil", vocals: "vocals", duration: 420, audioUrl: "" },
      { id: "good-relax-5", title: "Golden Sunset", artist: "Ambient Bliss", mood: "good", activity: "relaxing", genre: "ambient", vocals: "instrumental", duration: 460, audioUrl: "" },
    ],
    commuting: [
      { id: "good-commute-1", title: "Happy Commute", artist: "Feel Good Beats", mood: "good", activity: "commuting", genre: "pop", vocals: "vocals", duration: 420, audioUrl: "" },
      { id: "good-commute-2", title: "Positive Journey", artist: "Upbeat Mix", mood: "good", activity: "commuting", genre: "electronic", vocals: "instrumental", duration: 410, audioUrl: "" },
      { id: "good-commute-3", title: "Nandri Kannae", artist: "Tamil Joy", mood: "good", activity: "commuting", genre: "tamil", vocals: "vocals", duration: 430, audioUrl: "" },
    ],
    workingout: [
      { id: "good-workout-1", title: "Energize Your Day", artist: "Motivation Crew", mood: "good", activity: "workingout", genre: "rock", vocals: "vocals", duration: 420, audioUrl: "" },
      { id: "good-workout-2", title: "Feel the Power", artist: "Workout Beats", mood: "good", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 410, audioUrl: "" },
      { id: "good-workout-3", title: "Masilamani Poo", artist: "Tamil Energy", mood: "good", activity: "workingout", genre: "tamil", vocals: "vocals", duration: 400, audioUrl: "" },
      { id: "good-workout-4", title: "Power Surge", artist: "Electronic Thrust", mood: "good", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 390, audioUrl: "" },
    ]
  },

  happy: {
    studying: [
      { id: "happy-study-1", title: "Joyful Focus", artist: "Happy Study", mood: "happy", activity: "studying", genre: "lofi", vocals: "instrumental", duration: 420, audioUrl: "" },
      { id: "happy-study-2", title: "Golden Productivity", artist: "Sunshine Beats", mood: "happy", activity: "studying", genre: "pop", vocals: "vocals", duration: 440, audioUrl: "" },
      { id: "happy-study-3", title: "Naan Ava Kooda Varai", artist: "Tamil Happy", mood: "happy", activity: "studying", genre: "tamil", vocals: "vocals", duration: 430, audioUrl: "" },
      { id: "happy-study-4", title: "Cheerful Learning", artist: "Happy Vibes", mood: "happy", activity: "studying", genre: "electronic", vocals: "instrumental", duration: 400, audioUrl: "" },
      { id: "happy-study-5", title: "Kuliruin Malai", artist: "Tamil Celebration", mood: "happy", activity: "studying", genre: "tamil", vocals: "vocals", duration: 450, audioUrl: "" },
    ],
    relaxing: [
      { id: "happy-relax-1", title: "Pure Joy", artist: "Feel Good", mood: "happy", activity: "relaxing", genre: "lofi", vocals: "instrumental", duration: 480, audioUrl: "" },
      { id: "happy-relax-2", title: "Celebrate Life", artist: "Uplifting Sounds", mood: "happy", activity: "relaxing", genre: "jazz", vocals: "vocals", duration: 470, audioUrl: "" },
      { id: "happy-relax-3", title: "Kaavalan Kaavali", artist: "Tamil Joy", mood: "happy", activity: "relaxing", genre: "tamil", vocals: "vocals", duration: 450, audioUrl: "" },
      { id: "happy-relax-4", title: "Mazhai Mazhai", artist: "Tamil Bliss", mood: "happy", activity: "relaxing", genre: "tamil", vocals: "vocals", duration: 460, audioUrl: "" },
      { id: "happy-relax-5", title: "Supreme Tranquility", artist: "Ambient Joy", mood: "happy", activity: "relaxing", genre: "ambient", vocals: "instrumental", duration: 440, audioUrl: "" },
    ],
    commuting: [
      { id: "happy-commute-1", title: "Happiness Ride", artist: "Good Vibes Crew", mood: "happy", activity: "commuting", genre: "pop", vocals: "vocals", duration: 430, audioUrl: "" },
      { id: "happy-commute-2", title: "Smile Playlist", artist: "Cheerful Beats", mood: "happy", activity: "commuting", genre: "electronic", vocals: "instrumental", duration: 420, audioUrl: "" },
      { id: "happy-commute-3", title: "Idhayam Onnum", artist: "Tamil Happiness", mood: "happy", activity: "commuting", genre: "tamil", vocals: "vocals", duration: 440, audioUrl: "" },
      { id: "happy-commute-4", title: "Joyride Express", artist: "Pop Beats", mood: "happy", activity: "commuting", genre: "pop", vocals: "vocals", duration: 410, audioUrl: "" },
    ],
    workingout: [
      { id: "happy-workout-1", title: "Upbeat Energy", artist: "Bright Beats", mood: "happy", activity: "workingout", genre: "rock", vocals: "vocals", duration: 420, audioUrl: "" },
      { id: "happy-workout-2", title: "Joyful Ride", artist: "Pop Study", mood: "happy", activity: "workingout", genre: "pop", vocals: "vocals", duration: 430, audioUrl: "" },
      { id: "happy-workout-3", title: "Golden Hour", artist: "Sunny Sounds", mood: "happy", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 400, audioUrl: "" },
      { id: "happy-workout-4", title: "Thozhi Thozhi", artist: "Tamil Enthusiasm", mood: "happy", activity: "workingout", genre: "tamil", vocals: "vocals", duration: 440, audioUrl: "" },
      { id: "happy-workout-5", title: "Peak Performance", artist: "Energy Boost", mood: "happy", activity: "workingout", genre: "electronic", vocals: "instrumental", duration: 410, audioUrl: "" },
    ]
  }
};

// ════════════════════════════════════════════════════════════════════
// LEGACY DATA FOR BACKWARD COMPATIBILITY
// ════════════════════════════════════════════════════════════════════

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
