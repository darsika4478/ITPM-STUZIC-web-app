// sessionService.js – Firestore CRUD for music & study sessions
// Collection structure: sessions/{userId}/records/{docId}
//
// Each session document:
// {
//   userId:           string
//   mood:             string | number
//   trackId:          string (optional)
//   trackTitle:       string
//   artist:           string (optional)
//   genre:            string (optional)
//   activity:         string (optional)
//   energy:           number (optional, 1-5)
//   startTime:        Timestamp
//   endTime:          Timestamp | null
//   durationMinutes:  number | null
//   durationSeconds:  number | null
//   playlistLength:   number (optional, playlist duration in seconds)
//   trackPosition:    number (optional, playback position in seconds)
//   createdAt:        Timestamp
//   isActive:         boolean (currently playing)
// }

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";

const SESSIONS_COLLECTION = "sessions";

/**
 * Start a new session – creates a Firestore document for music playback
 * @param {string} userId – user ID
 * @param {string|number} mood – mood value
 * @param {object} track – track object with { id, title, artist, duration, genre, activity, energy }
 * @param {number} playlistLength – total playlist duration in seconds (optional)
 * @returns {string} docId of the created session
 */
export async function startSession(userId, mood, track, playlistLength = null) {
  try {
    const ref = collection(db, SESSIONS_COLLECTION);
    
    const sessionData = {
      userId,
      mood: typeof mood === 'number' ? mood : parseInt(mood) || 3,
      trackId: track?.id || null,
      trackTitle: track?.title || "Unknown Track",
      artist: track?.artist || null,
      genre: track?.genre || null,
      activity: track?.activity || null,
      energy: track?.energy || null,
      // Study session specific fields
      goal: track?.goal || null,
      subject: track?.subject || null,
      topic: track?.topic || null,
      sessionType: track?.sessionType || null,
      startTime: serverTimestamp(),
      endTime: null,
      durationMinutes: null,
      durationSeconds: null,
      playlistLength: playlistLength,
      trackPosition: 0,
      createdAt: serverTimestamp(),
      isActive: true,
    };
    
    const docRef = await addDoc(ref, sessionData);
    console.log(`[sessionService] Started session: ${docRef.id} for track: ${track?.title}`);
    return docRef.id;
  } catch (err) {
    console.error("[sessionService] startSession error:", err);
    return null;
  }
}

/**
 * End a session – updates the document with endTime and duration metrics
 * @param {string} docId – session document ID
 * @param {number} durationSeconds – playback duration in seconds
 * @param {number} trackPosition – final playback position in seconds (optional)
 */
export async function endSession(docId, durationSeconds, trackPosition = null) {
  try {
    const ref = doc(db, SESSIONS_COLLECTION, docId);
    
    const updateData = {
      endTime: serverTimestamp(),
      durationSeconds: durationSeconds,
      durationMinutes: Math.round(durationSeconds / 60),
      isActive: false,
    };
    
    if (trackPosition !== null) {
      updateData.trackPosition = trackPosition;
    }
    
    await updateDoc(ref, updateData);
    console.log(`[sessionService] Ended session: ${docId}`);
  } catch (err) {
    console.error("[sessionService] endSession error:", err);
  }
}

/**
 * Fetch all sessions for a user, sorted by newest first.
 * @returns {Array} array of session objects with id field
 */
export async function getSessions(userId) {
  try {
    const ref = collection(db, SESSIONS_COLLECTION);
    const q = query(
      ref,
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings for easy rendering
          startTime: data.startTime instanceof Timestamp
            ? data.startTime.toDate().toISOString()
            : data.startTime,
          endTime: data.endTime instanceof Timestamp
            ? data.endTime.toDate().toISOString()
            : data.endTime,
        };
      })
      .filter((s) => s.userId === userId);
  } catch (err) {
    console.error("[sessionService] getSessions error:", err);
    return [];
  }
}

/**
 * Update track playback position during playback
 * @param {string} docId – session document ID
 * @param {number} trackPosition – current playback position in seconds
 */
export async function updateTrackPosition(docId, trackPosition) {
  try {
    const ref = doc(db, SESSIONS_COLLECTION, docId);
    await updateDoc(ref, {
      trackPosition: trackPosition,
    });
  } catch (err) {
    console.error("[sessionService] updateTrackPosition error:", err);
  }
}

/**
 * Get session statistics by mood for a user
 * @param {string} userId – user ID
 * @returns {object} stats grouped by mood with counts and total duration
 */
export async function getSessionStatsByMood(userId) {
  try {
    const sessions = await getSessions(userId);
    const stats = {};
    
    sessions.forEach((session) => {
      const mood = session.mood || "unknown";
      if (!stats[mood]) {
        stats[mood] = {
          count: 0,
          totalSeconds: 0,
          totalMinutes: 0,
          tracks: [],
        };
      }
      
      stats[mood].count += 1;
      stats[mood].totalSeconds += session.durationSeconds || 0;
      stats[mood].totalMinutes = Math.round(stats[mood].totalSeconds / 60);
      
      if (session.trackTitle) {
        stats[mood].tracks.push(session.trackTitle);
      }
    });
    
    return stats;
  } catch (err) {
    console.error("[sessionService] getSessionStatsByMood error:", err);
    return {};
  }
}

/**
 * Get recently played tracks
 * @param {string} userId – user ID
 * @param {number} limit – max number of recent tracks to return
 * @returns {Array} array of recently played tracks
 */
export async function getRecentTracks(userId, limit = 10) {
  try {
    const sessions = await getSessions(userId);
    
    return sessions
      .filter((s) => s.trackId)
      .slice(0, limit)
      .map((s) => ({
        trackId: s.trackId,
        title: s.trackTitle,
        artist: s.artist,
        mood: s.mood,
        lastPlayed: s.createdAt,
        playCount: 1, // could be enhanced to track multiple plays
      }));
  } catch (err) {
    console.error("[sessionService] getRecentTracks error:", err);
    return [];
  }
}

/**
 * Get top genres by play count
 * @param {string} userId – user ID
 * @returns {object} genre stats
 */
export async function getTopGenres(userId) {
  try {
    const sessions = await getSessions(userId);
    const genreStats = {};
    
    sessions.forEach((session) => {
      const genre = session.genre || "Unknown";
      if (!genreStats[genre]) {
        genreStats[genre] = {
          count: 0,
          totalSeconds: 0,
        };
      }
      genreStats[genre].count += 1;
      genreStats[genre].totalSeconds += session.durationSeconds || 0;
    });
    
    return Object.entries(genreStats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .reduce((acc, [genre, stats]) => {
        acc[genre] = stats;
        return acc;
      }, {});
  } catch (err) {
    console.error("[sessionService] getTopGenres error:", err);
    return {};
  }
}

