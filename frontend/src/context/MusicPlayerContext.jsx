import { useState, useCallback, useEffect, useRef } from 'react';
import { getPlaylistByMood, DUMMY_SESSIONS } from '../data/dummyTracks';
import { MusicPlayerContext } from './MusicPlayerContextSetup';
import * as musicService from '../firebase/musicService';

export const MusicPlayerProvider = ({ children, initialMood = 'focus', playlistData = null }) => {
  const [mood, setMood] = useState(initialMood);
  const [playlist, setPlaylist] = useState(playlistData?.playlist || getPlaylistByMood(initialMood));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isPlayerActive, setIsPlayerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // High-level Audio Ref
  const audioRef = useRef(new Audio());
  
  // Backend-provided data
  const [moodData, setMoodData] = useState(playlistData?.moodData || null);
  
  // Session tracking
  const [sessions, setSessions] = useState(DUMMY_SESSIONS);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Player controls - Moved up to avoid ReferenceErrors
  const togglePlay = useCallback(() => {
    if (!audioRef.current.src && playlist[currentIndex]?.audioUrl) {
       audioRef.current.src = playlist[currentIndex].audioUrl;
    }
    setIsPlaying(prev => !prev);
    setIsPlayerActive(true);
  }, [currentIndex, playlist]);

  const playNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % playlist.length);
    setIsPlaying(true);
    setIsPlayerActive(true);
  }, [playlist.length]);

  const playPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
    setIsPlayerActive(true);
  }, [playlist.length]);

  const selectTrack = useCallback((index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
    setIsPlayerActive(true);
  }, []);

  const seekTo = useCallback((time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Synchronize Audio source with currentIndex
  useEffect(() => {
    const track = playlist[currentIndex];
    if (track && track.audioUrl) {
      const wasPlaying = isPlaying;
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(err => console.error("[Audio] Play failed:", err));
      }
    } else {
      audioRef.current.src = "";
    }
  }, [currentIndex, playlist]);

  // Synchronize Play/Pause
  useEffect(() => {
    if (isPlaying) {
      const src = audioRef.current.src;
      // Defensive check: only play if src exists and is not just the current page URL
      if (src && src.startsWith('http') && !src.includes(window.location.pathname)) {
        audioRef.current.play().catch(err => {
          console.error("[Audio] Play failed on state update:", err);
          setIsPlaying(false);
        });
      } else {
        console.warn("[Audio] Cannot play: invalid or empty source", src);
        setIsPlaying(false);
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Synchronize Volume
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    const handleError = (e) => console.error("[Audio] Error:", e);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isRepeat, playNext]); // playNext is wrapped in useCallback below

  // Initialize playlist with mood data if provided
  useEffect(() => {
    if (playlistData?.playlist && playlistData?.playlist.length > 0) {
      setPlaylist(playlistData.playlist);
      setMoodData(playlistData.moodData);
      setCurrentIndex(0);
    }
  }, [playlistData]);

  // Change mood and update playlist
  const changeMood = useCallback((newMood) => {
    setMood(newMood);
    setPlaylist(getPlaylistByMood(newMood));
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  // Load playlist from backend with filters
  const loadPlaylist = useCallback(async (moodValue, filters = {}) => {
    setIsLoading(true);
    try {
      const recommendedPlaylist = await musicService.getRecommendedPlaylist({
        mood: moodValue,
        ...filters,
      });
      
      if (recommendedPlaylist && recommendedPlaylist.length > 0) {
        setPlaylist(recommendedPlaylist);
        setMood(moodValue);
        setCurrentIndex(0);
      } else {
        // Fallback to local data
        setPlaylist(getPlaylistByMood(moodValue));
        setMood(moodValue);
      }
    } catch (err) {
      console.error('[MusicPlayerProvider] loadPlaylist error:', err);
      // Fallback
      setPlaylist(getPlaylistByMood(moodValue));
      setMood(moodValue);
    } finally {
      setIsLoading(false);
    }
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

  const setCustomPlaylist = useCallback((newPlaylist, startAt = 0) => {
    setPlaylist(newPlaylist);
    setCurrentIndex(startAt);
    setIsPlaying(true);
    setIsPlayerActive(true);
  }, []);

  const updateMoodData = useCallback((data) => {
    setMoodData(data);
  }, []);

  const value = {
    // Mood & Playlist
    mood,
    changeMood,
    loadPlaylist,
    setCustomPlaylist,
    playlist,
    currentTrack: playlist[currentIndex],
    playlistDuration: musicService.calculatePlaylistDuration(playlist),
    moodData,
    updateMoodData,
    
    // Player state
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    seekTo,
    togglePlay,
    playNext,
    playPrev,
    selectTrack,
    volume,
    setVolume,
    isRepeat,
    toggleRepeat,
    isPlayerActive,
    isLoading,
    
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
