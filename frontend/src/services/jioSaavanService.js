/**
 * JioSaavan Music API Service
 * Fetches real Tamil and Indian music tracks
 * Free API - No authentication required
 */

const JIOSAAVAN_API = "/api/jiosaavan";

/**
 * Search for tracks by query
 * @param {string} query - Search query (song name, artist, etc.)
 * @param {number} limit - Number of results (default 10)
 * @returns {Promise<Array>} Array of track objects
 */
export const searchTracks = async (query, limit = 10) => {
  try {
    const params = new URLSearchParams({
      __call: "webapi.search",
      query: query,
      type: "songs",
      p: 1,
      n: limit,
    });

    const response = await fetch(`${JIOSAAVAN_API}?${params}`);
    const data = await response.json();

    if (data.results && Array.isArray(data.results)) {
      return data.results.map((track) => formatTrackResponse(track));
    }
    return [];
  } catch (error) {
    console.error("JioSaavan search error:", error);
    return [];
  }
};

/**
 * Get mood-based playlists from JioSaavan
 * @param {string} mood - Mood name (sad, calm, energetic, etc.)
 * @param {number} limit - Number of tracks (default 15)
 * @returns {Promise<Array>} Array of tracks for the mood
 */
export const getMoodPlaylist = async (mood, limit = 15) => {
  const moodQueries = {
    sad: "sad songs tamil",
    low: "melancholic songs tamil",
    neutral: "chill songs tamil",
    good: "feel good songs tamil",
    happy: "happy songs tamil",
  };

  const query = moodQueries[mood] || "tamil songs";
  return searchTracks(query, limit);
};

/**
 * Search for Tamil songs by genre and mood
 * @param {object} filters - Filter object
 * @param {string} filters.genre - Genre type
 * @param {string} filters.mood - Mood type
 * @param {string} filters.activity - Activity type
 * @param {number} filters.limit - Max results
 * @returns {Promise<Array>} Filtered tracks
 */
export const searchTamilSongs = async (filters = {}) => {
  const { genre = "tamil", mood = "neutral", activity = "studying", limit = 15 } = filters;

  const activityQueries = {
    studying: "study focus",
    relaxing: "relax chill",
    commuting: "travel journey",
    workingout: "energy workout",
  };

  const query = `${genre} ${mood} ${activityQueries[activity] || ""}`.trim();
  return searchTracks(query, limit);
};

/**
 * Get artist tracks
 * @param {string} artistName - Artist name
 * @param {number} limit - Number of tracks
 * @returns {Promise<Array>} Artist's tracks
 */
export const getArtistTracks = async (artistName, limit = 10) => {
  try {
    const params = new URLSearchParams({
      __call: "webapi.search",
      query: artistName,
      type: "artists",
      p: 1,
      n: 1,
    });

    const response = await fetch(`${JIOSAAVAN_API}?${params}`);
    const data = await response.json();

    if (data.results && data.results[0]) {
      const artistId = data.results[0].id;
      return getArtistTracksById(artistId, limit);
    }
    return [];
  } catch (error) {
    console.error("JioSaavan artist search error:", error);
    return [];
  }
};

/**
 * Get tracks by artist ID
 * @param {string} artistId - JioSaavan artist ID
 * @param {number} limit - Number of tracks
 * @returns {Promise<Array>} Artist's tracks
 */
export const getArtistTracksById = async (artistId, limit = 10) => {
  try {
    const params = new URLSearchParams({
      __call: "artist.getArtists",
      artist_id: artistId,
      p: 1,
      n: limit,
    });

    const response = await fetch(`${JIOSAAVAN_API}?${params}`);
    const data = await response.json();

    if (data.songs && Array.isArray(data.songs)) {
      return data.songs.map((track) => formatTrackResponse(track));
    }
    return [];
  } catch (error) {
    console.error("JioSaavan artist tracks error:", error);
    return [];
  }
};

/**
 * Format JioSaavan API response to standard track object
 * @param {object} track - Raw JioSaavan track object
 * @returns {object} Formatted track object
 */
export const formatTrackResponse = (track) => {
  return {
    id: track.id || `jiosaavan-${Date.now()}`,
    title: track.song || track.title || "Unknown Track",
    artist: track.artist_name || track.primary_artists || "Unknown Artist",
    album: track.album || "Unknown Album",
    duration: parseInt(track.duration) || 240,
    audioUrl: track.media_url || track.url || "",
    imageUrl: track.image || "",
    year: track.year || new Date().getFullYear(),
    language: track.language || "tamil",
    mood: "neutral",
    activity: "listening",
    genre: "tamil",
    vocals: "vocals",
  };
};

/**
 * Get popular Tamil songs
 * @param {number} limit - Number of tracks
 * @returns {Promise<Array>} Popular Tamil tracks
 */
export const getPopularTamilSongs = async (limit = 20) => {
  return searchTracks("popular tamil songs", limit);
};

/**
 * Get Tamil classical music
 * @param {number} limit - Number of tracks
 * @returns {Promise<Array>} Tamil classical tracks
 */
export const getTamilClassicalSongs = async (limit = 15) => {
  return searchTracks("carnatic classical tamil", limit);
};

/**
 * Get Tamil cinema songs
 * @param {number} limit - Number of tracks
 * @returns {Promise<Array>} Tamil cinema movie songs
 */
export const getTamilCinemaSongs = async (limit = 15) => {
  return searchTracks("tamil movie songs cinema", limit);
};

/**
 * Search and fetch a complete playlist for mood + activity
 * @param {object} moodData - Mood input data
 * @returns {Promise<Array>} Complete playlist tracks
 */
export const getPlaylistForMood = async (moodData) => {
  const { mood = "neutral", activity = "studying", genre = "tamil", vocals = "vocals" } = moodData;

  let query = `${genre} ${mood}`;

  if (activity === "studying") {
    query += " focus study";
  } else if (activity === "relaxing") {
    query += " chill relaxing";
  } else if (activity === "commuting") {
    query += " travel journey";
  } else if (activity === "workingout") {
    query += " energy workout motivation";
  }

  if (vocals === "instrumental") {
    query += " instrumental";
  }

  // Fetch 20+ tracks to ensure 1+ hour of music
  const tracks = await searchTracks(query, 20);

  // Filter by duration to get close to 1 hour total
  let totalDuration = 0;
  const filteredTracks = [];

  for (const track of tracks) {
    if (totalDuration >= 3600) break; // 3600 seconds = 1 hour
    filteredTracks.push(track);
    totalDuration += track.duration;
  }

  return filteredTracks.length > 0 ? filteredTracks : tracks.slice(0, 15);
};

export default {
  searchTracks,
  getMoodPlaylist,
  searchTamilSongs,
  getArtistTracks,
  getArtistTracksById,
  formatTrackResponse,
  getPopularTamilSongs,
  getTamilClassicalSongs,
  getTamilCinemaSongs,
  getPlaylistForMood,
};
