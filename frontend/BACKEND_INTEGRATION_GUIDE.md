# Music Player Backend Integration Guide

## 📋 Overview
Complete backend integration for the music player with Firebase Firestore, session tracking, and mood-based music recommendations.

---

## 🏗️ Architecture

```
Frontend Music Player
    ↓
MusicPlayerContext (manages UI state)
    ↓
musicService (handles backend communication)
    ↓
sessionService (tracks sessions)
    ↓
Firebase Firestore (persistent storage)
```

---

## 📦 Key Services

### 1. **musicService.js** - Core Backend Integration
Located: `frontend/src/firebase/musicService.js`

**Functions:**
- `getRecommendedPlaylist(moodData)` - Fetch playlist based on mood
- `formatTrackForPlayer(track)` - Prepare track for playback
- `calculatePlaylistDuration(playlist)` - Get total duration
- `formatDuration(seconds)` - Format MM:SS
- `formatDurationLong(seconds)` - Format human-readable (1h 30m)
- `getMoodMetadata(mood)` - Get mood color/emoji/label
- `prepareTrackForSession(track, mood)` - Session-ready data

**Usage:**
```javascript
// In your music player component
import * as musicService from '../firebase/musicService';

// Get playlist for a mood
const loadPlaylist = async (moodValue) => {
  const playlist = await musicService.getRecommendedPlaylist({
    mood: moodValue,
    activity: 'studying',
    genre: 'lofi',
  });
  setTracks(playlist);
};

// Format track info
const trackInfo = musicService.formatTrackForPlayer(currentTrack);

// Calculate playlist duration
const totalSeconds = musicService.calculatePlaylistDuration(playlist);
const formatted = musicService.formatDurationLong(totalSeconds);
```

---

### 2. **sessionService.js** - Session Tracking
Located: `frontend/src/firebase/sessionService.js`

**Functions:**
- `startSession(userId, mood, track, playlistLength)` - Begin session
- `endSession(docId, durationSeconds, trackPosition)` - End session
- `updateTrackPosition(docId, trackPosition)` - Update playback position
- `getSessions(userId)` - Get all user sessions
- `getSessionStatsByMood(userId)` - Stats grouped by mood
- `getRecentTracks(userId, limit)` - Recently played tracks
- `getTopGenres(userId)` - Most played genres

**Session Document Structure:**
```javascript
{
  userId: "auth_uid",
  mood: 5,  // 1-5
  trackId: "track_id",
  trackTitle: "Song Name",
  artist: "Artist Name",
  genre: "tamil",
  activity: "studying",
  energy: 4,
  startTime: Timestamp,
  endTime: Timestamp,
  durationSeconds: 1800,  // 30 minutes
  durationMinutes: 30,
  playlistLength: 3600,   // Full playlist duration
  trackPosition: 900,     // Where playback stopped
  createdAt: Timestamp,
  isActive: false,
}
```

**Usage:**
```javascript
import * as sessionService from '../firebase/sessionService';

// Start a session when play button clicked
const sessionId = await sessionService.startSession(
  userId,
  5,  // mood
  {
    id: 'track_1',
    title: 'Song Name',
    artist: 'Artist',
    duration: 240,
    genre: 'tamil',
  },
  3600  // 1 hour playlist
);

// Update during playback
await sessionService.updateTrackPosition(sessionId, currentTime);

// End when done
await sessionService.endSession(sessionId, totalPlayedSeconds, finalPosition);

// Get analytics
const statsByMood = await sessionService.getSessionStatsByMood(userId);
// Returns:
// {
//   "5": { count: 10, totalSeconds: 18000, tracks: [...] },
//   "3": { count: 5, totalSeconds: 9000, tracks: [...] }
// }

const recentTracks = await sessionService.getRecentTracks(userId, 10);
const topGenres = await sessionService.getTopGenres(userId);
```

---

### 3. **trackService.js** - Track Management
Located: `frontend/src/firebase/trackService.js`

**Functions:**
- `initializeTracks()` - Populate Firestore with dummy data
- `getTracksByMood(mood, filters)` - Fetch tracks with filters
- `getAllPlaylists()` - Get all available playlists
- `saveRecommendation(userId, moodData, playlist)` - Save recommendation
- `getRecommendation(userId, recommendationId)` - Get saved recommendation
- `getUserRecommendations(userId)` - All user recommendations
- `incrementPlayCount(userId, recommendationId)` - Track usage

**Usage:**
```javascript
import * as trackService from '../firebase/trackService';

// Get playlist tracks
const tracks = await trackService.getTracksByMood(5, {
  activity: 'studying',
  genre: 'tamil',
});

// Save recommendation for later
const docId = await trackService.saveRecommendation(
  userId,
  { mood: 5, activity: 'studying', ... },
  playlistTracks
);

// Load saved recommendation
const saved = await trackService.getRecommendation(userId, docId);
```

---

## 🎵 Music Player Integration

### Using Backend in PlayerPage Component

```javascript
// frontend/src/pages/PlayerPage.jsx
import { useMusicPlayer } from '../context/useMusicPlayer';
import * as sessionService from '../firebase/sessionService';
import * as musicService from '../firebase/musicService';
import { useAuth } from '../hooks/useAuth';

const PlayerPage = () => {
  const { user } = useAuth();
  const { currentTrack, isPlaying, playlist } = useMusicPlayer();
  const sessionIdRef = useRef(null);

  // Start session when playing
  useEffect(() => {
    if (isPlaying && currentTrack && user) {
      const startPlayback = async () => {
        const docId = await sessionService.startSession(
          user.uid,
          moodValue,
          musicService.formatTrackForPlayer(currentTrack),
          musicService.calculatePlaylistDuration(playlist)
        );
        sessionIdRef.current = docId;
      };
      startPlayback();
    }
  }, [isPlaying, currentTrack, user]);

  // Update position every second
  useEffect(() => {
    let interval;
    if (isPlaying && sessionIdRef.current) {
      interval = setInterval(() => {
        const currentTime = audioElement.currentTime;
        sessionService.updateTrackPosition(sessionIdRef.current, currentTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // End session on unmount or stop
  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        const elapsed = audioElement.currentTime;
        sessionService.endSession(sessionIdRef.current, elapsed);
      }
    };
  }, []);

  return (
    // Your player UI
  );
};
```

---

### Using Custom Hook: useMusicPlayerWithBackend

Located: `frontend/src/hooks/useMusicPlayerWithBackend.js`

```javascript
import useMusicPlayerWithBackend from '../hooks/useMusicPlayerWithBackend';

function MusicPlayer() {
  const {
    isSessionActive,
    stats,
    error,
    updatePlaybackPosition,
    getMoodStats,
    getRecentTracks,
    getTopGenres,
  } = useMusicPlayerWithBackend();

  // Auto-tracks sessions, position updates, etc.
  
  // Get stats on demand
  const handleShowStats = async () => {
    const moodStats = await getMoodStats();
    console.log('Stats by mood:', moodStats);
    
    const recent = await getRecentTracks(10);
    console.log('Recently played:', recent);
    
    const genres = await getTopGenres();
    console.log('Top genres:', genres);
  };

  return (
    <div>
      <p>Session active: {isSessionActive ? 'Yes' : 'No'}</p>
      <p>Total playtime: {stats.totalTime} minutes</p>
      <p>Tracks played: {stats.tracksPlayed}</p>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

---

## 🔐 Firestore Security Rules

All rules automatically configured in `frontend/firestore.rules`:

```firestore
// Sessions: Users can CRUD their own sessions only
match /sessions/{sessionId} {
  allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
}

// Recommendations: User-specific nested collection
match /recommendations/{userId}/playlists/{playlistId} {
  allow read: if isAuthenticated() && userId == request.auth.uid;
  allow create: if isAuthenticated() && userId == request.auth.uid;
  allow update, delete: if isAuthenticated() && userId == request.auth.uid;
}

// Tracks: Read-only for all authenticated users
match /tracks/{trackId} {
  allow read: if isAuthenticated();
  allow write: if false;  // Admin only
}
```

---

## 📊 Data Flow Example

### Scenario: User plays Tamil music for studying

```
1. User selects mood in MoodCheckIn
   → Navigates to MusicRecommendationPage with moodData

2. MusicRecommendationPage displays recommendations
   → Passes playlist and track data via state

3. User clicks "Play"
   → Navigates to /dashboard/music with playlist data

4. MusicPlayerFullScreen loads
   → MusicPlayerContext receives playlistData
   → Initializes with 20+ tracks (60+ minutes)

5. User clicks Play button
   → sessionService.startSession() creates Firestore document
   → Session tracking begins

6. During playback
   → updateTrackPosition() updates every 1-2 seconds
   → sessionService records playing position

7. User stops/pauses
   → sessionService.endSession() finalizes session
   → Stores: duration, final position, timestamp

8. Analytics available
   → sessionService.getSessionStatsByMood() shows mood history
   → sessionService.getTopGenres() shows favorite genres
   → sessionService.getRecentTracks() shows recently played
```

---

## 🚀 Implementation Checklist

- [x] Music service created with backend integration
- [x] Session service enhanced with comprehensive tracking
- [x] Track service supports mood-based filtering
- [x] MusicPlayerContext updated with backend support
- [x] Custom hook `useMusicPlayerWithBackend` implemented
- [x] Firestore rules updated for all collections
- [x] Session documents include full track metadata
- [x] Analytics functions available
- [x] Error handling with local fallbacks

---

## 💡 Testing Backend Integration

### 1. Start a Music Session
```javascript
const userId = "user123";
const track = {
  id: "track_001",
  title: "Kadhal Maraindhavai",
  artist: "Artist Name",
  duration: 240,
  genre: "tamil",
  activity: "studying",
  energy: 4,
};

const sessionId = await sessionService.startSession(userId, 5, track, 3600);
console.log('Session started:', sessionId);
```

### 2. Update Playback Position
```javascript
// Every 1-2 seconds during playback
await sessionService.updateTrackPosition(sessionId, 45); // at 45 seconds
```

### 3. End Session
```javascript
await sessionService.endSession(sessionId, 180, 180); // 3 mins played
```

### 4. View Analytics
```javascript
const stats = await sessionService.getSessionStatsByMood("user123");
console.log('Mood stats:', stats);

const genres = await sessionService.getTopGenres("user123");
console.log('Top genres:', genres);
```

---

## 📱 Integration Points

| Component | Integration | Status |
|-----------|-----------|--------|
| MoodCheckIn | Pass mood data → Recommendation | ✅ |
| MoodRecommendationPage | Load & display playlists | ✅ |
| MusicPlayerFullScreen | Receive playlist data | ✅ |
| PlayerPage | Start/end sessions | ✅ |
| PlaylistPage | Show recent tracks | ✅ |
| HistoryPage | Display session analytics | ✅ |

---

## 🔗 File References

- Backend Services:
  - [`frontend/src/firebase/musicService.js`](../src/firebase/musicService.js)
  - [`frontend/src/firebase/sessionService.js`](../src/firebase/sessionService.js)
  - [`frontend/src/firebase/trackService.js`](../src/firebase/trackService.js)

- Hooks:
  - [`frontend/src/hooks/useMusicPlayerWithBackend.js`](../src/hooks/useMusicPlayerWithBackend.js)
  - [`frontend/src/hooks/useMusicPlayer.js`](../src/hooks/useMusicPlayer.js)

- Context:
  - [`frontend/src/context/MusicPlayerContext.jsx`](../src/context/MusicPlayerContext.jsx)

- Components:
  - [`frontend/src/pages/MusicPlayerFullScreen.jsx`](../src/pages/MusicPlayerFullScreen.jsx)
  - [`frontend/src/pages/PlayerPage.jsx`](../src/pages/PlayerPage.jsx)

- Configuration:
  - [`frontend/firestore.rules`](../firestore.rules)

---

## 🎯 Next Steps

1. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Initialize Tracks (if needed):**
   ```javascript
   import * as trackService from './firebase/trackService';
   trackService.initializeTracks();
   ```

3. **Test Full Flow:**
   - Select mood → Get recommendations → Click Play
   - Check Firestore for session document
   - Verify position updates and final duration

4. **View Analytics Dashboard:**
   - Create HistoryPage showing stats by mood
   - Display top genres, recent tracks, total playtime

---

## 📞 Support & Troubleshooting

### Session not created
- Check user authentication: `user.uid` must exist
- Verify Firestore rules deployed
- Check browser console for errors

### Position updates not saving
- Ensure `sessionIdRef` is properly maintained
- Check network in DevTools
- Verify session document exists in Firestore

### Playlist not loading
- Check fallback to local data working
- Verify TrackService fallback: `getPlaylistByMood()`
- Check console for API errors

### Recommendations not personalized
- Verify `moodData` passed from MoodCheckIn
- Check filters applied in `getRecommendedPlaylist()`
- Ensure mood value is integer 1-5

---

**Last Updated:** April 2026
**Version:** 1.0.0 Backend Integration Complete ✅
