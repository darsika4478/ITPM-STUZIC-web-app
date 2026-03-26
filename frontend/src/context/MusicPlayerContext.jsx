import { useState, useCallback } from 'react';
import { getPlaylistByMood, DUMMY_SESSIONS } from '../data/dummyTracks';
import { MusicPlayerContext } from './MusicPlayerContextSetup';

export const MusicPlayerProvider = ({ children, initialMood = 'focus' }) => {
  const [mood, setMood] = useState(initialMood);
  const [playlist, setPlaylist] = useState(getPlaylistByMood(initialMood));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isRepeat, setIsRepeat] = useState(false);
  
  // Session tracking
  const [sessions, setSessions] = useState(DUMMY_SESSIONS);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Change mood and update playlist
  const changeMood = useCallback((newMood) => {
    setMood(newMood);
    setPlaylist(getPlaylistByMood(newMood));
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  // Player controls
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const playNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % playlist.length);
  }, [playlist.length]);

  const playPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  const selectTrack = useCallback((index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat(prev => !prev);
  }, []);

  // Session management
  const addSession = useCallback((sessionData) => {
    const newSession = {
      id: Date.now(),
      mood: sessionData.mood,
      trackTitle: sessionData.trackTitle,
      duration: sessionData.duration,
      timestamp: new Date().toLocaleString(),
      date: new Date().toISOString().split('T')[0],
    };
    setSessions(prev => [newSession, ...prev]);
    return newSession;
  }, []);

  const value = {
    // Mood & Playlist
    mood,
    changeMood,
    playlist,
    currentTrack: playlist[currentIndex],
    
    // Player state
    currentIndex,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    selectTrack,
    volume,
    setVolume,
    isRepeat,
    toggleRepeat,
    
    // Sessions
    sessions,
    addSession,
    sessionStartTime,
    setSessionStartTime,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
