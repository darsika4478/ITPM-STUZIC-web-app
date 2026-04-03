// Recommendation Engine Service
// Generates music recommendations based on mood, activity, and user preferences
// Uses local playlist data filtered by user preferences

import { MOOD_PLAYLISTS, getFilteredRecommendations } from "../data/dummyTracks";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import jioSaavanService from "./jioSaavanService";

/**
 * Calculates recommendation score for a track based on preferences
 * @param {Object} track - Track object
 * @param {Object} preferences - User preferences { genre, vocals, focusTime, energy }
 * @returns {number} Score from 0-100
 */
function calculateTrackScore(track, preferences) {
  let score = 50; // Base score

  // Genre matching
  if (preferences.genre && track.genre === preferences.genre.toLowerCase()) {
    score += 30;
  } else if (preferences.genre) {
    score -= 10;
  }

  // Vocals preference matching
  if (preferences.vocals && track.vocals === preferences.vocals.toLowerCase()) {
    score += 20;
  } else if (preferences.vocals && track.vocals !== preferences.vocals.toLowerCase()) {
    score -= 5;
  }

  // Energy level matching (0-5 scale)
  if (preferences.energy && track.energy) {
    const energyDiff = Math.abs(preferences.energy - track.energy);
    score += Math.max(0, 15 - energyDiff * 3);
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Ranks playlists based on user mood, activity, and preferences
 * @param {number} moodValue - Mood value (1-5)
 * @param {string} activity - Activity (studying, relaxing, commuting, workingout)
 * @param {Object} preferences - User preferences { genre, vocals, focusTime, energy }
 * @returns {Array} Sorted playlists with scores
 */
export function getRankedPlaylists(moodValue, activity, preferences = {}) {
  const tracks = getFilteredRecommendations(moodValue, activity, preferences);
  
  // Score and sort tracks
  const scoredTracks = tracks.map(track => ({
    ...track,
    score: calculateTrackScore(track, { ...preferences, energy: preferences.energy || (moodValue > 3 ? 4 : 2) })
  }));

  return scoredTracks.sort((a, b) => b.score - a.score);
}

/**
 * Groups recommended tracks by genre
 * @param {Array} tracks - Array of track objects
 * @returns {Object} Tracks grouped by genre
 */
export function groupTracksByGenre(tracks) {
  return tracks.reduce((grouped, track) => {
    const genre = track.genre || "other";
    if (!grouped[genre]) {
      grouped[genre] = [];
    }
    grouped[genre].push(track);
    return grouped;
  }, {});
}

/**
 * Creates a recommendation playlist with diversity
 * @param {number} moodValue - Mood value (1-5)
 * @param {string} activity - Activity
 * @param {Object} preferences - User preferences
 * @param {number} limit - Maximum number of tracks
 * @returns {Array} Diverse recommendation playlist
 */
export function createDiversePlaylist(moodValue, activity, preferences = {}, limit = 8) {
  const tracks = getRankedPlaylists(moodValue, activity, preferences);
  const playlist = [];
  const usedGenres = new Set();

  // First pass: pick one from each genre
  for (const track of tracks) {
    if (playlist.length >= limit) break;
    const genre = track.genre;
    
    if (!usedGenres.has(genre)) {
      playlist.push(track);
      usedGenres.add(genre);
    }
  }

  // Second pass: fill remaining with highest scoring tracks
  for (const track of tracks) {
    if (playlist.length >= limit) break;
    if (!playlist.find(p => p.id === track.id)) {
      playlist.push(track);
    }
  }

  return playlist.slice(0, limit);
}

/**
 * Get recommendation summary with statistics
 * @param {number} moodValue - Mood value (1-5)
 * @param {string} activity - Activity
 * @param {Object} preferences - User preferences
 * @returns {Object} Recommendation data with playlists and stats
 */
export function getRecommendationSummary(moodValue, activity, preferences = {}) {
  const allTracks = getFilteredRecommendations(moodValue, activity, preferences);
  const diversePlaylist = createDiversePlaylist(moodValue, activity, preferences);
  const genreGroups = groupTracksByGenre(allTracks);

  const moodLabels = {
    1: "Sad",
    2: "Low",
    3: "Neutral",
    4: "Good",
    5: "Happy"
  };

  return {
    mood: {
      value: moodValue,
      label: moodLabels[moodValue] || "Unknown",
      emoji: ["😢", "😕", "😐", "🙂", "😄"][moodValue - 1]
    },
    activity,
    preferences,
    playlist: diversePlaylist,
    stats: {
      totalTracksAvailable: allTracks.length,
      genresAvailable: Object.keys(genreGroups).length,
      topGenres: Object.entries(genreGroups)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3)
        .map(([genre, tracks]) => ({
          genre,
          count: tracks.length
        }))
    }
  };
}

/**
 * Fetch recommendations from Firestore (for future integration)
 * @param {string} userId - User ID
 * @param {number} moodValue - Mood value
 * @param {string} activity - Activity
 * @returns {Promise<Array>} Recommended tracks from Firestore
 */
export async function getRecommendationsFromFirestore(userId, moodValue, activity) {
  try {
    const moodKeys = { 1: 'sad', 2: 'low', 3: 'neutral', 4: 'good', 5: 'happy' };
    const moodKey = moodKeys[moodValue] || 'neutral';
    
    const tracksRef = collection(db, "tracks");
    const q = query(
      tracksRef,
      where("mood", "==", moodKey),
      where("activity", "==", activity)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.warn("[recommendationEngine] Firestore fetch failed, using local data", err);
    return getFilteredRecommendations(moodValue, activity);
  }
}

/**
 * Get recommendation summary - returns local playlist based on mood inputs
 * Recommendations are filtered by user's selected mood, activity, genre, and vocals
 * @param {number} moodValue - Mood value (1-5)
 * @param {string} activity - Activity
 * @param {Object} preferences - User preferences { genre, vocals, focusTime, energy }
 * @returns {Object} Recommendation data with playlists and stats
 */
export function getRecommendationSummaryFiltered(moodValue, activity, preferences = {}) {
  const allTracks = getFilteredRecommendations(moodValue, activity, preferences);
  
  // Apply additional filtering based on user preferences
  let filteredTracks = allTracks;

  // Filter by genre if specified
  if (preferences.genre) {
    filteredTracks = filteredTracks.filter(
      t => t.genre && t.genre.toLowerCase() === preferences.genre.toLowerCase()
    );
  }

  // Filter by vocals preference if specified
  if (preferences.vocals) {
    filteredTracks = filteredTracks.filter(
      t => t.vocals && t.vocals.toLowerCase() === preferences.vocals.toLowerCase()
    );
  }

  // If filtering results in too few tracks, fall back to all tracks for mood/activity
  if (filteredTracks.length < 5) {
    filteredTracks = allTracks;
  }

  // Score and rank
  const scoredTracks = filteredTracks.map(track => ({
    ...track,
    score: calculateTrackScore(track, { 
      ...preferences, 
      energy: preferences.energy || (moodValue > 3 ? 4 : 2) 
    })
  })).sort((a, b) => b.score - a.score);

  // Create diverse playlist (one per genre)
  const playlist = createDiversePlaylist(moodValue, activity, preferences, 12);
  const genreGroups = groupTracksByGenre(scoredTracks);

  const moodLabels = {
    1: "Sad",
    2: "Low",
    3: "Neutral",
    4: "Good",
    5: "Happy"
  };

  // Calculate total duration
  const totalDuration = playlist.reduce((sum, track) => sum + (track.duration || 240), 0);

  return {
    mood: {
      value: moodValue,
      label: moodLabels[moodValue] || "Unknown",
      emoji: ["😢", "😕", "😐", "🙂", "😄"][moodValue - 1]
    },
    activity,
    preferences,
    playlist: playlist,
    stats: {
      totalTracksAvailable: scoredTracks.length,
      genresAvailable: Object.keys(genreGroups).length,
      totalDurationMinutes: Math.round(totalDuration / 60),
      topGenres: Object.entries(genreGroups)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3)
        .map(([genre, tracks]) => ({
          genre,
          count: tracks.length
        }))
    }
  };
}

/**
 * Suggestion: Store user mood history to improve recommendations
 * @param {Array} moodHistory - Array of past mood entries
 * @returns {Object} Preferred genres and vocal styles
 */
export function analyzeUserPreferences(moodHistory) {
  if (!moodHistory || moodHistory.length === 0) {
    return { preferredGenres: [], preferredVocals: [] };
  }

  const genreCount = {};
  const vocalCount = {};

  moodHistory.forEach(entry => {
    if (entry.genre) {
      genreCount[entry.genre] = (genreCount[entry.genre] || 0) + 1;
    }
    if (entry.vocals) {
      vocalCount[entry.vocals] = (vocalCount[entry.vocals] || 0) + 1;
    }
  });

  const preferredGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);

  const preferredVocals = Object.entries(vocalCount)
    .sort((a, b) => b[1] - a[1])
    .map(([vocal]) => vocal);

  return { preferredGenres, preferredVocals };
}


/**
 * Fetch recommendations from JioSaavan API
 * @param {number} moodValue - Mood value (1-5)
 * @param {string} activity - Activity
 * @param {Object} preferences - User preferences
 * @returns {Promise<Array>} Scored and ranked tracks from JioSaavan
 */
export async function getRecommendationsFromJioSaavan(moodValue, activity, preferences = {}) {
  try {
    const moodKeys = { 1: 'sad', 2: 'low', 3: 'neutral', 4: 'good', 5: 'happy' };
    const moodKey = moodKeys[moodValue] || 'neutral';
    
    const moodData = {
      mood: moodKey,
      activity: activity,
      genre: preferences.genre || "tamil",
      vocals: preferences.vocals || "mixed"
    };

    const tracks = await jioSaavanService.getPlaylistForMood(moodData);
    
    // Score and rank JioSaavan tracks
    const scoredTracks = tracks.map(track => ({
      ...track,
      score: calculateTrackScore(track, { 
        ...preferences, 
        energy: preferences.energy || (moodValue > 3 ? 4 : 2) 
      })
    }));

    return scoredTracks.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.error("[recommendationEngine] JioSaavan fetch failed:", err);
    return [];
  }
}

/**
 * Get recommendation summary with JioSaavan integration and local fallback
 * @param {number} moodValue - Mood value (1-5)
 * @param {string} activity - Activity
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} Recommendation summary
 */
export async function getRecommendationSummaryWithJioSaavan(moodValue, activity, preferences = {}) {
  // Try JioSaavan first
  let playlist = await getRecommendationsFromJioSaavan(moodValue, activity, preferences);
  let source = "JioSaavan";

  // Fallback to local if JioSaavan returns nothing
  if (!playlist || playlist.length === 0) {
    console.info("[recommendationEngine] Falling back to local data");
    const summary = getRecommendationSummaryFiltered(moodValue, activity, preferences);
    playlist = summary.playlist;
    source = "Local";
  }

  const moodLabels = {
    1: "Sad", 2: "Low", 3: "Neutral", 4: "Good", 5: "Happy"
  };

  const totalDuration = playlist.reduce((sum, track) => sum + (track.duration || 240), 0);
  const genreGroups = groupTracksByGenre(playlist);

  return {
    mood: {
      value: moodValue,
      label: moodLabels[moodValue] || "Unknown",
      emoji: ["😢", "😕", "😐", "🙂", "😄"][moodValue - 1]
    },
    activity,
    preferences,
    playlist: playlist.slice(0, 15),
    stats: {
      totalTracksAvailable: playlist.length,
      genresAvailable: Object.keys(genreGroups).length,
      totalDurationMinutes: Math.round(totalDuration / 60),
      source: source,
      topGenres: Object.entries(genreGroups)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3)
        .map(([genre, tracks]) => ({
          genre,
          count: tracks.length
        }))
    }
  };
}

export default {
  getRankedPlaylists,
  groupTracksByGenre,
  createDiversePlaylist,
  getRecommendationSummary,
  getRecommendationSummaryFiltered,
  getRecommendationsFromFirestore,
  analyzeUserPreferences,
  calculateTrackScore,
  getRecommendationsFromJioSaavan,
  getRecommendationSummaryWithJioSaavan
};
