# JioSaavan Music Integration Guide

## Overview
Complete integration of JioSaavan API with your mood-based music recommendation system. Users can now enjoy real Tamil music tracks directly from JioSaavan without manual URL management.

---

## 🎵 What's New

### 1. **JioSaavan Service** (`src/services/jioSaavanService.js`)

#### Available Functions:

- **`searchTracks(query, limit)`** - Search for songs by name, artist, or keyword
- **`getMoodPlaylist(mood, limit)`** - Get mood-specific playlists (sad, low, neutral, good, happy)
- **`searchTamilSongs(filters)`** - Search Tamil music with genre, mood, and activity filters
- **`getArtistTracks(artistName, limit)`** - Get all tracks by a specific artist
- **`getPlaylistForMood(moodData)`** - Complete recommendation engine (used by recommendation page)
- **`getPopularTamilSongs(limit)`** - Get trending Tamil music
- **`getTamilClassicalSongs(limit)`** - Get Carnatic classical music

#### Example Usage:

```javascript
import { getPlaylistForMood } from '../services/jioSaavanService';

// Get a playlist based on mood
const moodData = {
  mood: 'happy',
  activity: 'studying',
  genre: 'tamil',
  vocals: 'vocals',
  focusTime: '60min'
};

const tracks = await getPlaylistForMood(moodData);
// Returns array of track objects with:
// - id, title, artist, album
// - duration, audioUrl, imageUrl
// - mood, activity, genre, vocals
```

---

### 2. **Enhanced Recommendation Engine** (`src/services/recommendationEngine.js`)

#### New Functions:

- **`getRecommendationsFromJioSaavan(moodValue, activity, preferences)`**
  - Async function that fetches from JioSaavan API
  - Returns scored and ranked tracks
  
- **`getRecommendationSummaryWithJioSaavan(moodValue, activity, preferences)`**
  - Async wrapper providing full recommendations with stats
  - Auto-falls back to local data if API fails
  - Returns: `{ mood, activity, preferences, playlist, stats }`

#### Stats Provided:
- Total tracks available
- Total duration in minutes (with 60+ min guarantee)
- Genre breakdown
- Source indicator (JioSaavan vs Local)

```javascript
import { getRecommendationSummaryWithJioSaavan } from '../services/recommendationEngine';

const summary = await getRecommendationSummaryWithJioSaavan(
  5,                          // mood value (1-5)
  'studying',                 // activity
  {
    genre: 'tamil',
    vocals: 'vocals',
    energy: 4
  }
);

// Returns:
// {
//   mood: { value: 5, label: "Happy", emoji: "😄" },
//   activity: "studying",
//   playlist: [ ...20 tracks, 60+ min total ],
//   stats: {
//     totalTracksAvailable: 47,
//     totalDurationMinutes: 68,
//     topGenres: [ ... ],
//     source: "JioSaavan"
//   }
// }
```

---

### 3. **Custom Hooks** (`src/hooks/useJioSaavan.js`)

#### `useJioSaavanPlaylist()`

```javascript
const { playlist, loading, error, fetchPlaylist } = useJioSaavanPlaylist();

// Fetch playlist
await fetchPlaylist({
  mood: 'sad',
  activity: 'relaxing',
  genre: 'tamil'
});
```

Returns: `{ playlist, loading, error, fetchPlaylist, clearPlaylist, clearError }`

#### `usePlaylistDuration(playlist)`

```javascript
const { totalDuration, durationFormatted, isOver60Minutes } = usePlaylistDuration(playlist);

// Returns:
// - totalDuration: seconds (e.g., 3600)
// - durationFormatted: "1h 5m"
// - isOver60Minutes: boolean
```

#### `useMoodBasedTracks()`

```javascript
const { tracks, loading, fetchTracks } = useMoodBasedTracks();

// Auto-caches results
const tracks = await fetchTracks(moodData);
```

---

### 4. **JioSaavan Audio Player** (`src/components/musicPlayer/JioSaavanAudioPlayer.jsx`)

Professional audio player component with:
- Play/Pause controls
- Next/Previous navigation
- Progress bar with seek
- Volume control
- Duration display
- Error handling with fallbacks
- Loading state

#### Usage:

```javascript
import JioSaavanAudioPlayer from './JioSaavanAudioPlayer';

<JioSaavanAudioPlayer
  track={selectedTrack}
  onPlayNext={handleNext}
  onPlayPrev={handlePrev}
  autoPlay={true}
/>
```

---

### 5. **Updated Recommendation Page** 

The MoodRecommendationPage now:
- ✅ Fetches from JioSaavan first
- ✅ Falls back to local data if API fails
- ✅ Shows loading state during fetch
- ✅ Displays playlist duration
- ✅ Guarantees 60+ minutes per playlist
- ✅ Only shows "Play" button (no "Add")

---

## 🚀 How to Use

### User Flow:

1. **Select Mood Input**
   - Choose mood emoji (Sad → Happy)
   - Set energy level, activity, genre (including Tamil!), vocal preference
   - Set duration

2. **View Recommendations**
   - App fetches from JioSaavan API
   - Shows complete playlist with 60+ minutes
   - Displays playlist statistics

3. **Play Music**
   - Click "Play" button
   - Navigate to music player page
   - Use JioSaavanAudioPlayer to listen

---

## 📊 Audio Quality

- **Format**: MP3 (typically 128 kbps - 320 kbps)
- **Duration**: Guaranteed 60+ minutes per mood playlist
- **Source**: JioSaavan Free API (no premium required)
- **Language**: Tamil, Hindi, English, and more

---

## ⚙️ Configuration

### No Configuration Needed!
The JioSaavan API requires **no authentication**. Simply use the functions directly.

### Environment Variables (Optional)
If you want to add custom settings, update `.env`:

```env
VITE_JIOSAAVAN_API_LIMIT=20          # Default tracks per search
VITE_JIOSAAVAN_TIMEOUT=5000          # API timeout in ms
VITE_JIOSAAVAN_FALLBACK_LOCAL=true   # Use local data on failure
```

---

## 🔧 Error Handling

The system handles errors gracefully:

### API Failures
- If JioSaavan API is down → Falls back to local dummy tracks
- If search returns no results → Uses generic mood playlist
- If audio URL is expired → Shows error message in player

### CORS Issues
- JioSaavan servers support cross-origin requests
- Audio playback uses HTML5 Audio API (supported by all browsers)
- If blocked, browser console will show specific error

### Logging
All operations log to console with `[serviceName]` prefix:
```
[MoodRecommendationPage] Recommendations loaded: {...}
[JioSaavanAudioPlayer] Audio error: {...}
[useJioSaavan] Fetching playlist: {...}
```

---

## 📈 Performance Tips

1. **Cache Playlists** - Use `useMoodBasedTracks()` hook for automatic caching
2. **Preload on Mood Selection** - Start fetching while user is viewing recommendations
3. **Optimize Search Terms** - More specific queries return better results
   - ❌ Bad: "music"
   - ✅ Good: "tamil sad study focus"
   - ✅ Better: "melancholic tamil instrumental songs studying"

---

## 🎯 Tamil Music Coverage

Your system now includes extensive Tamil content:

| Category | Examples |
|----------|----------|
| Classical | Carnatic, Veena, Mridangam |
| Cinema | Movie songs, BGM, Scores |
| Folk | Traditional, Devotional |
| Modern | Pop, Electronic, Indie |
| Different Moods | Sad, Happy, Energetic, Calm |
| Different Activities | Studying, Relaxing, Working Out, Commuting |

---

## 🧪 Testing

### Manual Test Flow:

1. Start the app: `npm run dev`
2. Navigate to dashboard
3. Click mood emoji (😄 Happy)
4. Set genre to `🇮🇳 Tamil`
5. Click "Get Music Recommendations"
6. Wait for JioSaavan to load 20+ tracks
7. Verify:
   - ✅ Tracks appear with artist names
   - ✅ Duration shown as "60m+" or "1h 5m"
   - ✅ Only "Play" button visible
   - ✅ Clicking Play navigates to music player
8. In music player:
   - ✅ Audio player shows track info
   - ✅ Play/Pause works
   - ✅ Next/Previous navigate through playlist
   - ✅ Duration and progress bar display correctly

### API Response Format:

```javascript
{
  id: "jiosaavan-song-id",
  title: "Kadhal Maraindhavai",
  artist: "Tamil Singer Name",
  album: "Album Name",
  duration: 270,  // in seconds
  audioUrl: "https://jiosaavan.url/stream/...",
  imageUrl: "https://jiosaavan.url/image/...",
  year: 2024,
  language: "tamil",
  score: 95  // recommendation score
}
```

---

## 🐛 Troubleshooting

### Issue: "No audio URL provided"
- **Cause**: JioSaavan API returned tracks without audio URLs
- **Solution**: Try a different search term or mood
- **Fallback**: Local dummy tracks will be used

### Issue: Audio plays but no sound
- **Cause**: Browser volume muted or audio level at 0
- **Solution**: Check player volume slider, check browser audio settings

### Issue: "Failed to load audio"
- **Cause**: Audio URL expired (JioSaavan URLs expire after some time)
- **Solution**: Refresh page and get new recommendations

### Issue: CORS error in console
- **Cause**: Browser blocking cross-origin request
- **Solution**: This is normal for JioSaavan; app should still work
- **If blocked**: Backend proxy may be needed

---

## 🚀 Future Enhancements

1. **User Playlists** - Save favorite mood-based playlists
2. **History Tracking** - Track what music users listen to per mood
3. **Machine Learning** - Improve recommendations based on listening history
4. **Song Lyrics** - Fetch and display Tamil lyrics
5. **Favorites** - Mark favorite tracks
6. **Sharing** - Share playlists with friends
7. **Offline Mode** - Download tracks for offline listening
8. **Backend Sync** - Store recommendations in Firestore

---

## 📝 Files Modified/Created

### New Files:
- ✅ `src/services/jioSaavanService.js` - JioSaavan API wrapper
- ✅ `src/hooks/useJioSaavan.js` - Custom React hooks
- ✅ `src/components/musicPlayer/JioSaavanAudioPlayer.jsx` - Audio player component

### Modified Files:
- ✅ `src/services/recommendationEngine.js` - Added JioSaavan integration
- ✅ `src/features/mood_and_music_recommendation/pages/MoodRecommendationPage.jsx` - Uses new async API
- ✅ `firestore.rules` - Added `/tracks/` and `/recommendations/` rules

---

## 📚 API Documentation

### JioSaavan API Endpoints Used:

1. **Search**
   ```
   GET ?__call=webapi.search&query={query}&type=songs
   ```

2. **Artist Search**
   ```
   GET ?__call=webapi.search&query={artist}&type=artists
   ```

3. **Artist Tracks**
   ```
   GET ?__call=artist.getArtists&artist_id={id}
   ```

**Note**: This is a community-maintained reverse-engineered API. For production use with guaranteed uptime, consider Spotify API or similar.

---

## 💡 Pro Tips

1. **Smart Search Queries**
   - Use mood keywords: "sad", "happy", "energetic", "calm"
   - Use activity keywords: "study", "focus", "relax", "workout"
   - Use language: "tamil", "hindi", "english"
   - Combine: "tamil sad study songs" → Best results!

2. **Optimal Playlist Length**
   - Studying: 60-90 minutes (keeps focus, minimal distractions)
   - Relaxing: 45-120 minutes (flexible duration)
   - Commuting: 30-60 minutes (varies with commute)
   - Working out: 45-75 minutes (moderate-high BPM)

3. **Genre Selection**
   - Tamil: Best for Indian diaspora
   - LoFi: Best for studying (low distraction)
   - Classical: Best for concentration
   - Electronic: Best for energy/workout
   - Ambient: Best for relaxation

---

## Support & Issues

If you encounter issues:
1. Check browser console for errors
2. Check terminal for backend logs
3. Try refreshing the page
4. Clear browser cache
5. Open an issue in the repo with:
   - Exact error message
   - Browser version
   - Mood/genre selected
   - Network tab screenshot

---

**Happy Listening! 🎵**
