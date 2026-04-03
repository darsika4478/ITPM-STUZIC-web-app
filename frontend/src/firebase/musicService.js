// musicService.js – Backend integration for music player
// Handles playlist fetching, track recommendations, and session tracking

import { getPlaylistByMood } from "../data/dummyTracks";
import { getPlaylistByMoodFromDB } from "./trackService";

/**
 * Fetch recommended playlist based on mood data
 * Uses local data by default, integrates with backend when available
 * @param {object} moodData – { mood, activity, genre, vocalPreference, focusTime, energy }
 * @returns {Array} playlist tracks
 */
export async function getRecommendedPlaylist(moodData) {
  try {
    const { mood } = moodData;
    
    // Try fetching from Firebase first
    const firebasePlaylist = await getPlaylistByMoodFromDB(mood);
    
    if (firebasePlaylist && firebasePlaylist.length > 0) {
      console.log("[musicService] Fetched playlist from Firebase");
      return firebasePlaylist;
    }
    
    // Fallback to local dummy data
    return getPlaylistByMood(mood);
  } catch (err) {
    console.error("[musicService] getRecommendedPlaylist error:", err);
    return getPlaylistByMood(moodData.mood);
  }
}

/**
 * Get current track info with all metadata
 * @param {object} track – track object
 * @returns {object} enriched track info
 */
export function formatTrackForPlayer(track) {
  if (!track) return null;
  
  return {
    id: track.id,
    title: track.title || "Unknown Title",
    artist: track.artist || "Unknown Artist",
    duration: track.duration || 0,
    audioUrl: track.audioUrl || null,
    mood: track.mood || "neutral",
    activity: track.activity || "general",
    genre: track.genre || "general",
    energy: track.energy || 3,
    vocalPreference: track.vocalPreference || "mixed",
    imageUrl: track.imageUrl || null,
  };
}

/**
 * Calculate playlist total duration
 * @param {Array} playlist – array of tracks
 * @returns {number} total duration in seconds
 */
export function calculatePlaylistDuration(playlist) {
  if (!Array.isArray(playlist)) return 0;
  return playlist.reduce((sum, track) => sum + (track.duration || 0), 0);
}

/**
 * Format duration in MM:SS format
 * @param {number} seconds – duration in seconds
 * @returns {string} formatted duration
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format duration in human-readable format
 * @param {number} seconds – duration in seconds
 * @returns {string} formatted duration (e.g., "1h 30m")
 */
export function formatDurationLong(seconds) {
  if (!seconds || seconds < 0) return "0 min";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Create audio element for playback
 * @param {string} audioUrl – URL to audio file
 * @returns {HTMLAudioElement} audio element instance
 */
export function createAudioElement(audioUrl) {
  try {
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    return audio;
  } catch (err) {
    console.error("[musicService] Failed to create audio element:", err);
    return null;
  }
}

/**
 * Validate audio URL accessibility
 * @param {string} audioUrl – URL to test
 * @returns {Promise<boolean>} whether URL is accessible
 */
export async function isAudioUrlAccessible(audioUrl) {
  if (!audioUrl) return false;
  
  try {
    const response = await fetch(audioUrl, {
      method: "HEAD",
      mode: "no-cors",
    });
    return response.ok || response.type === "opaque";
  } catch (err) {
    console.warn("[musicService] Audio URL not accessible:", audioUrl, err);
    return false;
  }
}

/**
 * Get mood metadata for UI display
 * @param {number|string} mood – mood value (1-5) or name
 * @returns {object} mood metadata with color and label
 */
export function getMoodMetadata(mood) {
  const moodMap = {
    1: { label: "Sad", color: "#585296", emoji: "😢" },
    2: { label: "Low", color: "#7B7BA8", emoji: "😕" },
    3: { label: "Neutral", color: "#8F8BB6", emoji: "😐" },
    4: { label: "Good", color: "#A89FCC", emoji: "🙂" },
    5: { label: "Happy", color: "#C4BAE8", emoji: "😊" },
  };
  
  const key = parseInt(mood) || mood;
  return moodMap[key] || moodMap[3];
}

/**
 * Prepare track data for session logging
 * @param {object} track – track object
 * @param {object} mood – mood metadata
 * @returns {object} session-ready track info
 */
export function prepareTrackForSession(track, mood) {
  return {
    trackId: track.id,
    title: track.title,
    artist: track.artist,
    mood: mood,
    genre: track.genre,
    activity: track.activity,
    duration: track.duration,
    timestamp: new Date().toISOString(),
  };
}

export default {
  getRecommendedPlaylist,
  formatTrackForPlayer,
  calculatePlaylistDuration,
  formatDuration,
  formatDurationLong,
  createAudioElement,
  isAudioUrlAccessible,
  getMoodMetadata,
  prepareTrackForSession,
};
