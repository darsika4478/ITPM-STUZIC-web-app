import { useState, useCallback } from "react";

/**
 * usePlayerState – manages music playback state
 * @param {Array} playlist - array of track objects from dummyTracks / Firestore
 */
export function usePlayerState(playlist = []) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isRepeat, setIsRepeat] = useState(false);

  const currentTrack = playlist[currentIndex] || null;

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const playNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (isRepeat) return prev;
      return prev < playlist.length - 1 ? prev + 1 : 0;
    });
    setIsPlaying(true);
  }, [playlist.length, isRepeat]);

  const playPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : playlist.length - 1));
    setIsPlaying(true);
  }, [playlist.length]);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => !prev);
  }, []);

  const selectTrack = useCallback((index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  return {
    currentTrack,
    currentIndex,
    isPlaying,
    volume,
    isRepeat,
    setVolume,
    togglePlay,
    playNext,
    playPrev,
    toggleRepeat,
    selectTrack,
  };
}
