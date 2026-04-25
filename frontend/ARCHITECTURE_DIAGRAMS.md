## 🏗️ Architecture & Data Flow Diagrams

### 1. Component Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                     MusicPlayer                         │
│                    (Root Component)                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     MusicPanel                          │
│  (Manages: sessionActive, playedSongs, callbacks)       │
└──────────────┬──────────────┬──────────────┬────────────┘
               │              │              │
        ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
        │  Enhanced   │ │  Player   │ │  Session   │
        │   Now       │ │ Controls  │ │   Timer    │
        │  Playing    │ │           │ │            │
        │   Card      │ │           │ │            │
        └─────────────┘ └───────────┘ └─────┬──────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Songs Played   │
                                    │    Section      │
                                    └─────────────────┘
```

---

### 2. State Management Flow

```
┌─────────────────────────────────────────────────┐
│        MusicPanel Local State                   │
├─────────────────────────────────────────────────┤
│ • sessionActive: boolean                        │
│ • playedSongs: Array<Song>                      │
│                                                 │
│ Handlers:                                       │
│ • handleSessionStart()                          │
│ • handleSessionReset()                          │
│ • handleSongsPlayedUpdate(songs)                │
│ • handleSessionEnd(sessionData)                 │
└────────────────────────┬────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Enhanced   │  │   Session    │  │    Songs     │
│     Now      │  │    Timer     │  │   Played     │
│   Playing    │  │              │  │   Section    │
│     Card     │  │ (Local State)│  │              │
└──────────────┘  └──────────────┘  └──────────────┘
     Props:          Props + Callbacks:  Props:
   • isSessionActive  • onSessionStart  • playedSongs
   • track          • onSessionReset  • isSessionActive
   • mood           • onSongsPlayed
   • isPlaying      • onSessionEnd
```

---

### 3. Session Lifecycle

```
START
  │
  ├─ User clicks "Start Focus"
  │
  └─ SessionTimer.start() called
       │
       └─ isRunning = true
            │
            └─ useEffect triggered
                 │
                 └─ onSessionStart() callback fired
                      │
                      └─ MusicPanel.setSessionActive(true)
                           │
                           ├─ togglePlay() (auto-play music)
                           │
                           └─ EnhancedNowPlayingCard shows track
                                │
                                └─ Timer starts ticking
                                   Music plays
                                   Ready to track songs

SONG CHANGE (during session)
  │
  ├─ currentTrack changes (next/end/user click)
  │
  └─ SessionTimer useEffect triggered
       │
       └─ Check: lastTrackIndex !== currentTrack.id
            │
            ├─ YES: Add song to playedSongs
            │        │
            │        └─ Update timestamp
            │           │
            │           └─ onSongsPlayed(updatedSongs)
            │                │
            │                └─ MusicPanel updates state
            │                     │
            │                     └─ SongsPlayedSection re-renders
            │
            └─ NO: Skip (prevent duplicates)

RESET
  │
  ├─ User clicks "Reset"
  │
  └─ SessionTimer.reset() called
       │
       ├─ isRunning = false
       │
       ├─ onSessionReset() callback fired
       │
       └─ MusicPanel resets state
            │
            ├─ setSessionActive(false)
            │
            ├─ setPlayedSongs([])
            │
            └─ togglePlay() (stop music)
                 │
                 └─ UI returns to "Ready to Start"

END SESSION
  │
  ├─ User clicks "End Session"
  │
  └─ SessionTimer.handleEnd() called
       │
       ├─ Collect session data
       │  ├─ sessionStartTime
       │  ├─ elapsedFocusMinutes
       │  ├─ completedFocusCount
       │  └─ playedSongs ← Passed to parent
       │
       └─ onSessionEnd(sessionData) callback
            │
            └─ Can be saved to Firestore
                 │
                 └─ Analytics & History tracking
```

---

### 4. Song Tracking Algorithm

```
┌─ Session Active? ─┐
│                   │
├─ YES: Continue   │ ─ NO: Skip
│      │           │
│      └─ Song Changed?
│         │
│         ├─ Check: lastTrackIndex === currentTrack.id
│         │
│         ├─ NO (different song):
│         │  │
│         │  ├─ Create timestamp
│         │  ├─ Create song object
│         │  ├─ setPlayedSongs([...prev, newSong])
│         │  ├─ Update: lastTrackIndex = currentTrack.id
│         │  └─ Call: onSongsPlayed(updatedSongs)
│         │
│         └─ YES (same song):
│            └─ Skip (avoid duplicate entry)
│
└────────────────────────────────────────────────────┘
```

---

### 5. Data Structures

```
┌─────────────────────────────────────────────────┐
│          Song Object (playedSongs[])            │
├─────────────────────────────────────────────────┤
│ {                                               │
│   id: string,           // Unique ID            │
│   title: string,        // Track name           │
│   artist: string,       // Artist name          │
│   playedAt: string,     // "02:34:12 PM"        │
│   order: number         // 1, 2, 3, ...        │
│ }                                               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│     Session Data (onSessionEnd callback)        │
├─────────────────────────────────────────────────┤
│ {                                               │
│   sessionStartTime: ISO String,                 │
│   elapsedFocusMinutes: number,                  │
│   completedFocusCount: number,                  │
│   playedSongs: Song[]                           │
│ }                                               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│        Track Object (currentTrack)              │
├─────────────────────────────────────────────────┤
│ {                                               │
│   id: string,           // Unique ID            │
│   title: string,        // Track name           │
│   artist: string,       // Artist name          │
│   duration: number,     // Seconds              │
│   audioUrl: string,     // Link to audio file   │
│   mood?: string         // Mood category        │
│ }                                               │
└─────────────────────────────────────────────────┘
```

---

### 6. Callback Chain

```
User Action (Click/Change)
       │
       ▼
┌──────────────────────────┐
│   SessionTimer            │
│   (Detects change)        │
└──────────┬───────────────┘
           │
           ├─ onSessionStart()
           ├─ onSessionReset()
           ├─ onSongsPlayed()
           └─ onSessionEnd()
                   │
                   ▼
           ┌──────────────────────────┐
           │   MusicPanel Handler     │
           │   (Update state)         │
           └──────────┬───────────────┘
                      │
                      ├─ setSessionActive()
                      ├─ setPlayedSongs()
                      └─ handleSessionEnd()
                              │
                              ▼
                   ┌──────────────────────────┐
                   │   Child Components       │
                   │   (Re-render with new    │
                   │    state/props)          │
                   └──────────────────────────┘
```

---

### 7. UI State Transitions

```
                    ┌──────────────────┐
                    │  Initial State   │
                    │ sessionActive=F  │
                    │ playedSongs=[]   │
                    └────────┬─────────┘
                             │
                User clicks "Start Focus"
                             │
                             ▼
                    ┌──────────────────┐
                    │  Session Active  │
                    │ sessionActive=T  │
                    │ playedSongs=[]   │
                    │ Music playing    │
                    │ Timer ticking    │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
  Song Finishes or    User clicks "Reset"   User clicks "End"
  User clicks "Next"       │                     │
         │                 ▼                     │
         │         ┌──────────────────┐         │
         │         │  Reset State     │         │
         │         │ sessionActive=F  │         │
         │         │ playedSongs=[]   │         │
         │         │ Music stopped    │         │
         │         │ Timer reset      │         │
         │         └──────────────────┘         │
         │                 │                     │
         │                 └────────┬────────────┘
         │                          │
         │                Ready for new session
         │                          │
         └──────────────────────────┘
         │
         └──► Add song to playedSongs
              Timestamp recorded
              UI updates
              Loop continues...
```

---

### 8. Component Render Triggers

```
MusicPanel renders when:
├─ sessionActive changes
└─ playedSongs array changes

EnhancedNowPlayingCard re-renders when:
├─ track changes (from MusicPlayerContext)
├─ isPlaying changes
└─ isSessionActive changes

SongsPlayedSection re-renders when:
├─ playedSongs array changes
├─ isSessionActive changes
└─ (child components may memoize)

SessionTimer re-renders when:
├─ Time state changes (each second)
├─ isRunning changes
├─ phase changes (focus ↔ break)
└─ sessionStartTime changes
```

---

### 9. Animation Timeline

```
On Session Start:
│
├─ Music starts playing
│  │
│  └─ Waveform animation begins (500ms loop)
│     ├─ Bar 1: scale 0.5 → 1.0
│     ├─ Bar 2: scale 0.5 → 1.0 (offset 100ms)
│     ├─ Bar 3: scale 0.5 → 1.0 (offset 200ms)
│     ├─ Bar 4: scale 0.5 → 1.0 (offset 300ms)
│     └─ Bar 5: scale 0.5 → 1.0 (offset 400ms)
│
├─ Music note rotates
│  └─ 360° rotation over 8 seconds (loop)
│
├─ Glow ring pulses
│  └─ 2 second cycle
│     ├─ 0-1s: opacity 0.1 → 0.2
│     └─ 1-2s: opacity 0.2 → 0.1
│
└─ Timer displays pulse
   └─ 2 second cycle
      ├─ 0-1s: opacity 1.0 → 0.8
      └─ 1-2s: opacity 0.8 → 1.0

On Button Hover:
├─ Start button: scale 1.0 → 1.05 (300ms)
├─ Reset button: bg color transition (300ms)
└─ Song item: bg color → lavender (300ms)

On Button Click:
├─ Active state: scale 1.05 → 0.95 (immediate)
└─ Return: scale 0.95 → 1.0 (300ms)
```

---

### 10. Integration Points

```
MusicPanel (NEW STATE MANAGEMENT)
    │
    ├─ SessionTimer
    │  └─ Tracks timing + music playback
    │     └─ Fires: onSessionStart, onSessionReset, onSongsPlayed, onSessionEnd
    │
    ├─ useMusicPlayer Hook (from Context)
    │  ├─ currentTrack (displays in EnhancedNowPlayingCard)
    │  ├─ togglePlay (auto-play on session start)
    │  ├─ playNext (triggers song tracking)
    │  └─ isPlaying (shows waveform animation)
    │
    ├─ EnhancedNowPlayingCard (NEW)
    │  └─ Displays current track + animations
    │
    └─ SongsPlayedSection (NEW)
       └─ Displays playedSongs array
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Unidirectional data flow
- ✅ Easy to test and debug
- ✅ Scalable and maintainable
- ✅ No prop drilling
- ✅ Reusable components
