import { useState, useCallback, useEffect, useRef } from 'react';
import { getPlaylistByMood } from '../data/dummyTracks';
import { MusicPlayerContext } from './MusicPlayerContextSetup';
import * as musicService from '../firebase/musicService';
import * as sessionService from '../firebase/sessionService';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
  const [sessions, setSessions] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  
  // Study Session State (Globalized)
  const [studySessionActive, setStudySessionActive] = useState(false);
  const [studyTimeLeft, setStudyTimeLeft] = useState(30 * 60);
  const [studyDuration, setStudyDuration] = useState(30);
  const [studySessionId, setStudySessionId] = useState(null);
  const [studyConfig, setStudyConfig] = useState({
    sessionType: 'Deep Work',
    goal: '',
    subject: '',
    topic: '',
    focusLevel: 'Medium',
    breakReminder: true
  });
  const [studySongsPlayed, setStudySongsPlayed] = useState([]);
  const [showStudyEndedModal, setShowStudyEndedModal] = useState(false);

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

  // Fetch sessions from backend
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userSessions = await sessionService.getSessions(user.uid);
          setSessions(userSessions);
        } catch (err) {
          console.error('[MusicPlayerProvider] Failed to fetch sessions:', err);
        }
      } else {
        setSessions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Study Session Timer Effect (Global)
  useEffect(() => {
    let interval = null;
    if (studySessionActive && studyTimeLeft > 0) {
      interval = setInterval(() => {
        setStudyTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (studyTimeLeft === 0 && studySessionActive) {
      // End session logic
      setStudySessionActive(false);
      setShowStudyEndedModal(true);
      
      if (studySessionId) {
        const elapsedSeconds = sessionStartTime 
          ? Math.floor((new Date() - sessionStartTime) / 1000)
          : 0;
        sessionService.endSession(studySessionId, elapsedSeconds);
        setStudySessionId(null);
      }
    }
    return () => clearInterval(interval);
  }, [studySessionActive, studyTimeLeft, studySessionId, sessionStartTime]);

  // Track songs played during study session
  const currentTrack = playlist[currentIndex];
  useEffect(() => {
    if (studySessionActive && currentTrack && sessionStartTime) {
      const existingSong = studySongsPlayed.find(s => s.id === currentTrack.id);
      if (!existingSong) {
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - sessionStartTime) / 1000);
        setStudySongsPlayed(prev => [...prev, {
          id: currentTrack.id,
          title: currentTrack.title,
          artist: currentTrack.artist,
          startTime: elapsedSeconds,
          playedAt: currentTime.toLocaleTimeString()
        }]);
      }
    }
  }, [currentTrack, studySessionActive, sessionStartTime, studySongsPlayed]);

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

    // Global Study Session
    studySessionActive,
    setStudySessionActive,
    studyTimeLeft,
    setStudyTimeLeft,
    studyDuration,
    setStudyDuration,
    studyConfig,
    setStudyConfig,
    studySongsPlayed,
    setStudySongsPlayed,
    studySessionId,
    setStudySessionId,
    showStudyEndedModal,
    setShowStudyEndedModal
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
