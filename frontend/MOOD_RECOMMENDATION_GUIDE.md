# Mood-Based Music Recommendation System - Implementation Guide

## 🎵 Overview

This comprehensive implementation connects mood check-ins with personalized music recommendations, including support for Tamil playlists. The system works as follows:

1. User logs mood with detailed preferences
2. System analyzes preferences and mood intensity
3. Personalized playlist is generated
4. User can play/add tracks to their collection

---

## 📋 Components Implemented

### 1. **Enhanced Mood Input Form** (`MoodCheckIn.jsx`)
- **New Fields Captured:**
  - Mood (1-5 scale: Sad to Happy)
  - Energy Level (1-5 slider)
  - Activity (studying, relaxing, commuting, workingout)
  - Preferred Genre (lofi, classical, jazz, electronic, ambient, rock, pop, **tamil**, indie)
  - Vocal Preference (instrumental, vocals, mixed)
  - Session Duration (15min, 25min, 45min, 60min, 90min)

- **Tamil Support:** 🇮🇳 Tamil option included in genre selection

### 2. **Comprehensive Track Database** (`dummyTracks.js`)
- **Structure:** `MOOD_PLAYLISTS` object organized by:
  - Mood Level (sad, low, neutral, good, happy)
  - Activity Type
  - Genre & Vocal Preferences
  
- **Tamil Tracks Included:**
  - "Kadhal Maraindhavai" - Tamil Classics
  - "Mayakkam Enna" - Tamil Soul
  - "Thani Oruvan" - Tamil Cinema
  - "Idhazhin Neela Vannam" - Tamil Instrumental
  - "Porangalil Vaanilai" - Tamil Classics
  - And more...

### 3. **Recommendation Engine Service** (`recommendationEngine.js`)
- `getRankedPlaylists()` - Scores and ranks tracks
- `createDiversePlaylist()` - Creates varied recommendations
- `getRecommendationSummary()` - Full recommendation data with stats
- `analyzeUserPreferences()` - Learns from user history

### 4. **Recommendation Algorithm** (`recommendationAlgorithm.js`)
- **Scoring Factors:**
  - Genre Compatibility (25%)
  - Vocal Preference (25%)
  - Activity Matching (20%)
  - Mood Matching (30%)

- **BPM Calculation:** Dynamic BPM based on mood + activity intensity
- **Genre Compatibility Matrix:** Predefined compatibility between genres

### 5. **Enhanced Recommendation Page** (`MoodRecommendationPage.jsx`)
- Displays ranked recommendations with scores
- Shows user preferences summary
- Statistics: Available tracks, genres, top genres
- Individual track cards with:
  - Play/Add to Playlist buttons
  - Genre & vocal preference tags
  - Duration display
  - Match score visualization

### 6. **Updated Firestore Rules** (`firestore.rules`)
**New Collections:**
- `/moods/` - Mood entries with music preferences
- `/tracks/` - Music tracks database
- `/recommendations/` - User recommendations
- `/playlists/` - Custom playlists
- `/sessions/` - Music/study sessions

**Security:**
- Users can only access their own data
- Tracks are read-only for users
- Proper authentication checks on all operations

---

## 🚀 How It Works

### Flow Diagram:
```
MoodCheckIn (Select mood + preferences)
    ↓
Firebase Firestore (Save mood data)
    ↓
Navigate to MoodRecommendationPage
    ↓
recommendationEngine.getRecommendationSummary()
    ↓
Calculate scores based on:
    - Mood value
    - Activity
    - Genre preference
    - Vocal preference
    - Energy level
    ↓
Display ranked recommendations
```

### Recommendation Scoring Example:

**User Input:**
- Mood: 5 (Happy) 🎉
- Activity: Studying
- Genre: Tamil
- Vocals: Vocals
- Energy: 4

**Algorithm Process:**
1. Get all tracks for Happy mood + Studying activity
2. Filter by Tamil genre → Base score 25% boost
3. Filter by Vocals preference → Additional 25% boost
4. Activity match (studying) → 20% boost
5. Mood match (happy) → 30% boost
6. Final ranking by combined score

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── dashboard/
│   │       └── MoodCheckIn.jsx ✅ ENHANCED
│   ├── data/
│   │   └── dummyTracks.js ✅ ENHANCED (Tamil tracks added)
│   ├── services/
│   │   ├── recommendationEngine.js ✅ NEW
│   │   └── recommendationAlgorithm.js ✅ NEW
│   └── features/
│       └── mood_and_music_recommendation/
│           └── pages/
│               └── MoodRecommendationPage.jsx ✅ ENHANCED
└── firestore.rules ✅ UPDATED
```

---

## 🔌 Integration Points

### 1. **Music Player Integration**
To enable playing tracks, update `MusicPlayerContext.jsx`:
```javascript
const playTrack = (track) => {
  // Set current track in context
  setCurrentTrack(track);
  setIsPlaying(true);
  // Load audio URL from track.audioUrl
};
```

### 2. **Firebase Firestore Setup**
Deploy the updated rules:
```bash
firebase deploy --only firestore:rules
```

### 3. **Populate Track Database**
Create tracks collection in Firebase Console:
```javascript
// Function to populate initial tracks
async function populateTracksDatabase() {
  const tracksRef = collection(db, "tracks");
  
  for (const moodKey of Object.keys(MOOD_PLAYLISTS)) {
    for (const activity of Object.keys(MOOD_PLAYLISTS[moodKey])) {
      const tracks = MOOD_PLAYLISTS[moodKey][activity];
      
      for (const track of tracks) {
        await setDoc(doc(tracksRef, track.id), {
          ...track,
          mood: moodKey,
          activity
        });
      }
    }
  }
}
```

---

## 🎯 Tamil Language Support

### Implemented:
- ✅ Tamil genre option in mood form ("🇮🇳 Tamil")
- ✅ Tamil tracks in playlist database
- ✅ Tamil metadata (title, artist)
- ✅ Proper filtering for Tamil genre preference
- ✅ Tamil track compatibility with classical/ambient genres

### Example Tamil Tracks:
| Title | Artist | Mood | Activity | Vocals |
|-------|--------|------|----------|--------|
| Kadhal Maraindhavai | Tamil Classics | Sad | Studying | Vocals |
| Mayakkam Enna | Tamil Soul | Sad | Relaxing | Vocals |
| Idhazhin Neela Vannam | Tamil Instrumental | Low | Studying | Instrumental |
| Dil Dilam Nozhantha | Tamil Vocals | Neutral | Relaxing | Vocals |

---

## 🧪 Testing the System

### Test Case 1: Happy Mood, Tamil Genre
```
1. Click Happy emoji (😄)
2. Select Activity: Studying
3. Select Genre: 🇮🇳 Tamil
4. Select Vocals: Vocals
5. Click "Get Music Recommendations"
→ Should show Tamil songs with vocals
```

### Test Case 2: Sad Mood, Instrumental Preference
```
1. Click Sad emoji (😢)
2. Select Activity: Relaxing
3. Select Genre: Ambient
4. Select Vocals: Instrumental
→ Should show ambient instrumental tracks for sad/relaxing
```

---

## 📊 Data Structure

### Mood Entry (Saved to Firestore):
```javascript
{
  userId: "user123",
  mood: 5,                    // 1-5 scale
  moodLabel: "Happy",
  energy: 4,                  // 1-5 scale
  activity: "studying",
  genre: "tamil",            // Preference
  vocals: "vocals",          // Preference
  focusTime: "45min",
  createdAt: timestamp,
  date: "2026-04-03"
}
```

### Track Object:
```javascript
{
  id: "happy-study-1",
  title: "Joyful Focus",
  artist: "Happy Study",
  mood: "happy",
  activity: "studying",
  genre: "lofi",
  vocals: "instrumental",
  duration: 260,             // seconds
  audioUrl: "",              // URL when integrated
  score: 85                  // Calculated score
}
```

---

## 🔧 Future Enhancements

1. **AI Integration:**
   - Use Cloud Functions for advanced recommendation algorithm
   - Machine learning for personalization

2. **Spotify/Apple Music Integration:**
   - Real audio URLs from streaming services
   - OAuth authentication

3. **Collaborative Filtering:**
   - User similarity matching
   - Community recommendations

4. **Tamil Language Expansion:**
   - More Tamil tracks (1000+)
   - Tamil UI translations
   - Regional language support (Telugu, Kannada, etc.)

5. **Advanced Features:**
   - Mood trends analytics
   - Recommendation history
   - Saved playlists
   - Social sharing

---

## 🐛 Troubleshooting

### Issue: "Permission denied" when saving mood
**Solution:** Ensure Firestore rules are deployed:
```bash
firebase deploy --only firestore:rules
```

### Issue: No recommendations showing
**Solution:** Verify mood data is being saved with correct structure:
Check Firebase Console → Collections → moods

### Issue: Tamil tracks not filtering
**Solution:** Verify genre value matches exactly:
- Check: `genre === "tamil"` (lowercase)
- In form: Tamil option sets `genre = "tamil"`

---

## 📞 Support & Debugging

### Enable Logging:
```javascript
// In recommendationEngine.js
console.log('Recommendation Summary:', summary);
console.log('Ranked Playlists:', rankedPlaylists);
```

### Verify Integration:
```javascript
// Test in browser console
import { getRecommendationSummary } from './services/recommendationEngine.js';
const summary = getRecommendationSummary(5, 'studying', { genre: 'tamil' });
console.log(summary);
```

---

## 📝 Summary of Changes

| File | Change | Status |
|------|--------|--------|
| MoodCheckIn.jsx | Added genre, vocals, focusTime fields | ✅ Complete |
| dummyTracks.js | Added MOOD_PLAYLISTS with 60+ tracks | ✅ Complete |
| recommendationEngine.js | Created scoring & recommendation logic | ✅ Complete |
| recommendationAlgorithm.js | Advanced recommendation algorithm | ✅ Complete |
| MoodRecommendationPage.jsx | Enhanced with personalized recommendations | ✅ Complete |
| firestore.rules | Updated security rules for all collections | ✅ Complete |

---

## 🎉 Next Steps

1. ✅ Deploy updated Firestore rules
2. ✅ Test mood logging and recommendations
3. ⏳ Integrate with music player (MediaPlayer context)
4. ⏳ Add audio URLs for real tracks
5. ⏳ Implement playlist saving functionality
6. ⏳ Add Cloud Functions for backend recommendations

**System is now ready for testing! 🚀**
