// useMusicPlayerWithBackend.js – Custom hook for music player with Firebase backend integration
// Handles session tracking, playlist fetching, and audio management

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import * as musicService from '../firebase/musicService';
import * as sessionService from '../firebase/sessionService';
import { useMusicPlayer } from './useMusicPlayer';

/**
 * Custom hook combining music player context with backend session tracking
 * Automatically starts/ends sessions and tracks playtime
 */
export function useMusicPlayerWithBackend() {
  // Get auth and music player context
  const { user } = useAuth();
  const {
    currentTrack,
    isPlaying,
    mood,
    playlist,
  } = useMusicPlayer();

  // Session tracking
  const sessionIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioRefRef = useRef(null);
  
  const [sessionStats, setSessionStats] = useState({
    totalTime: 0,
    tracksPlayed: 0,
    currentPosition: 0,
  });
  
  const [error, setError] = useState(null);

  /**
   * Start a new session when playing begins
   */
  const startPlaybackSession = useCallback(async () => {
    if (!user || !currentTrack || sessionIdRef.current) {
      return; // Already tracking or missing data
    }

    try {
      const formattedTrack = musicService.formatTrackForPlayer(currentTrack);
      const docId = await sessionService.startSession(
        user.uid,
        mood,
        formattedTrack,
        musicService.calculatePlaylistDuration(playlist)
      );

      if (docId) {
        sessionIdRef.current = docId;
        startTimeRef.current = Date.now();
        setError(null);
        console.log('[useMusicPlayerWithBackend] Session started:', docId);
      }
    } catch (err) {
      console.error('[useMusicPlayerWithBackend] startPlaybackSession error:', err);
      setError(err.message);
    }
  }, [user, currentTrack, mood, playlist]);

  /**
   * End the current session
   */
  const endPlaybackSession = useCallback(async () => {
    if (!user || !sessionIdRef.current) {
      return;
    }

    try {
      const elapsedSeconds = startTimeRef.current
        ? Math.round((Date.now() - startTimeRef.current) / 1000)
        : 0;

      await sessionService.endSession(
        sessionIdRef.current,
        elapsedSeconds,
        sessionStats.currentPosition
      );

      console.log('[useMusicPlayerWithBackend] Session ended:', sessionIdRef.current);
      
      // Reset refs
      sessionIdRef.current = null;
      startTimeRef.current = null;
    } catch (err) {
      console.error('[useMusicPlayerWithBackend] endPlaybackSession error:', err);
      setError(err.message);
    }
  }, [user, sessionStats.currentPosition]);

  /**
   * Update track position during playback
   */
  const updatePlaybackPosition = useCallback(async (position) => {
    if (!sessionIdRef.current) return;

    try {
      await sessionService.updateTrackPosition(sessionIdRef.current, Math.round(position));
      setSessionStats((prev) => ({ ...prev, currentPosition: position }));
    } catch (err) {
      console.error('[useMusicPlayerWithBackend] updatePlaybackPosition error:', err);
    }
  }, []);

  /**
   * Handle play/pause state changes
   */
  useEffect(() => {
    if (isPlaying && currentTrack) {
      startPlaybackSession();
    } else if (!isPlaying && sessionIdRef.current) {
      endPlaybackSession();
    }
  }, [isPlaying, currentTrack, startPlaybackSession, endPlaybackSession]);

  /**
   * Load recent session statistics
   */
  const loadSessionStats = useCallback(async () => {
    if (!user) return;

    try {
      const sessions = await sessionService.getSessions(user.uid);
      if (sessions.length > 0) {
        const totalSeconds = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
        setSessionStats((prev) => ({
          ...prev,
          totalTime: Math.round(totalSeconds / 60), // in minutes
          tracksPlayed: sessions.length,
        }));
      }
    } catch (err) {
      console.error('[useMusicPlayerWithBackend] loadSessionStats error:', err);
      setError(err.message);
    }
  }, [user]);

  /**
   * Get mood-based stats
   */
  const getMoodStats = useCallback(async () => {
    if (!user) return null;

    try {
      return await sessionService.getSessionStatsByMood(user.uid);
    } catch (err) {
      console.error('[useMusicPlayerWithBackend] getMoodStats error:', err);
      setError(err.message);
      return null;
    }
  }, [user]);

  /**
   * Get recently played tracks
   */
  const getRecentTracks = useCallback(async (limit = 10) => {
    if (!user) return [];

    try {
      return await sessionService.getRecentTracks(user.uid, limit);
    } catch (err) {
      console.error('[useMusicPlayerWithBackend] getRecentTracks error:', err);
      setError(err.message);
      return [];
    }
  }, [user]);

  /**
   * Get top genres
   */
  const getTopGenres = useCallback(async () => {
    if (!user) return {};

    try {
      return await sessionService.getTopGenres(user.uid);
    } catch (err) {
      console.error('[useMusicPlayerWithBackend] getTopGenres error:', err);
      setError(err.message);
      return {};
    }
  }, [user]);

  // Load stats on mount
  useEffect(() => {
    loadSessionStats();
  }, [loadSessionStats]);

  return {
    // Session tracking
    isSessionActive: !!sessionIdRef.current,
    sessionId: sessionIdRef.current,
    
    // Stats
    stats: sessionStats,
    error,
    
    // Methods
    updatePlaybackPosition,
    loadSessionStats,
    getMoodStats,
    getRecentTracks,
    getTopGenres,
    endSession: endPlaybackSession,
  };
}

export default useMusicPlayerWithBackend;
