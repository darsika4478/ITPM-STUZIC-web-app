/**
 * Custom Hook: useJioSaavanPlaylist
 * Fetches playlist data from JioSaavan API based on mood and preferences
 */

import { useState, useCallback, useEffect } from 'react';
import { getPlaylistForMood } from '../services/jioSaavanService';

export const useJioSaavanPlaylist = () => {
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch playlist based on mood data
   * @param {Object} moodData - Mood input data
   */
  const fetchPlaylist = useCallback(async (moodData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[useJioSaavanPlaylist] Fetching playlist:', moodData);
      const tracks = await getPlaylistForMood(moodData);
      
      if (tracks && tracks.length > 0) {
        setPlaylist(tracks);
        console.log('[useJioSaavanPlaylist] Playlist loaded:', tracks.length, 'tracks');
      } else {
        setError('No tracks found for the selected mood');
        setPlaylist([]);
      }
    } catch (err) {
      console.error('[useJioSaavanPlaylist] Error:', err);
      setError(err.message || 'Failed to fetch playlist');
      setPlaylist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    playlist,
    loading,
    error,
    fetchPlaylist,
    clearPlaylist: () => setPlaylist([]),
    clearError: () => setError(null)
  };
};

/**
 * Custom Hook: usePlaylistDuration
 * Calculates total duration of a playlist
 */
export const usePlaylistDuration = (playlist) => {
  const [totalDuration, setTotalDuration] = useState(0);
  const [durationFormatted, setDurationFormatted] = useState('0m');

  useEffect(() => {
    if (!playlist || playlist.length === 0) {
      setTotalDuration(0);
      setDurationFormatted('0m');
      return;
    }

    const total = playlist.reduce((sum, track) => sum + (track.duration || 0), 0);
    setTotalDuration(total);

    // Format to human readable
    const minutes = Math.round(total / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      setDurationFormatted(`${hours}h ${mins}m`);
    } else {
      setDurationFormatted(`${minutes}m`);
    }
  }, [playlist]);

  return {
    totalDuration,
    durationFormatted,
    isOver60Minutes: totalDuration >= 3600
  };
};

/**
 * Custom Hook: useMoodBasedTracks
 * Fetches and caches tracks based on mood preferences
 */
export const useMoodBasedTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({});

  const fetchTracks = useCallback(async (moodData) => {
    // Check cache first
    const cacheKey = JSON.stringify(moodData);
    if (cache[cacheKey]) {
      console.log('[useMoodBasedTracks] Using cached data');
      setTracks(cache[cacheKey]);
      return cache[cacheKey];
    }

    setLoading(true);
    try {
      const playlist = await getPlaylistForMood(moodData);
      setTracks(playlist);
      
      // Update cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: playlist
      }));
      
      return playlist;
    } catch (error) {
      console.error('[useMoodBasedTracks] Error:', error);
      setTracks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [cache]);

  return {
    tracks,
    loading,
    fetchTracks,
    clearCache: () => setCache({})
  };
};

export default {
  useJioSaavanPlaylist,
  usePlaylistDuration,
  useMoodBasedTracks
};
