/**
 * JioSaavan Audio Player Component
 * Handles playing tracks from JioSaavan with error handling and fallbacks
 */

import React, { useState, useRef, useEffect } from 'react';

const JioSaavanAudioPlayer = ({ track, onPlayNext, onPlayPrev, autoPlay = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Track details
  const title = track?.title || 'Unknown Track';
  const artist = track?.artist || 'Unknown Artist';
  const audioUrl = track?.audioUrl || '';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setLoading(true);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleError = (e) => {
      console.error('[JioSaavanAudioPlayer] Audio error:', e);
      setError('Failed to load audio. URL may be expired or blocked.');
      setLoading(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (onPlayNext) onPlayNext();
    };
    const handleCanPlay = () => {
      setLoading(false);
      setError(null);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [onPlayNext]);

  // Auto play on track change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (autoPlay && isPlaying) {
      audio.play().catch(err => {
        console.error('[JioSaavanAudioPlayer] Play failed:', err);
        setError('Failed to play audio');
      });
    }
  }, [audioUrl, autoPlay]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => {
        console.error('[JioSaavanAudioPlayer] Play failed:', err);
        setError('Failed to play audio');
      });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
    }
  };

  const handleProgressChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!audioUrl) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
        ⚠️ No audio URL provided
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 rounded-xl border border-purple-400/20 bg-purple-950/30">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Track Info */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-white truncate">{title}</h3>
        <p className="text-sm text-gray-400">{artist}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-8">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="flex-1 h-2 bg-purple-900 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
              duration ? (currentTime / duration) * 100 : 0
            }%, #4c1d95 ${duration ? (currentTime / duration) * 100 : 0}%, #4c1d95 100%)`
          }}
        />
        <span className="text-xs text-gray-400 w-8 text-right">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Previous Button */}
        <button
          onClick={onPlayPrev}
          disabled={!onPlayPrev}
          className="p-2 rounded-full hover:bg-purple-600/30 disabled:opacity-50 text-purple-200"
          title="Previous"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5a1 1 0 011.707-.707l4.586 4.586a1 1 0 010 1.414l-4.586 4.586A1 1 0 018 13V5z" />
            <path d="M3 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" />
          </svg>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={!audioUrl || loading}
          className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {loading ? (
            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 1a.5.5 0 00-.5.5v17a.5.5 0 001 0V1.5a.5.5 0 00-.5-.5zm9 0a.5.5 0 00-.5.5v17a.5.5 0 001 0V1.5a.5.5 0 00-.5-.5z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>

        {/* Next Button */}
        <button
          onClick={onPlayNext}
          disabled={!onPlayNext}
          className="p-2 rounded-full hover:bg-purple-600/30 disabled:opacity-50 text-purple-200"
          title="Next"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12 15a1 1 0 01-1.707.707l-4.586-4.586a1 1 0 010-1.414l4.586-4.586A1 1 0 0112 7v8z" />
            <path d="M17 15a1 1 0 01-2 0V7a1 1 0 112 0v8z" />
          </svg>
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.172a1 1 0 011.414 0A6.972 6.972 0 0118 10a6.972 6.972 0 01-1.929 4.828 1 1 0 01-1.414-1.414A4.972 4.972 0 0016 10c0-1.713-.672-3.262-1.757-4.243a1 1 0 010-1.414zm2.828 2.828a1 1 0 011.415 0A9.969 9.969 0 0120 10a9.969 9.969 0 01-1.414 5.157 1 1 0 01-1.414-1.414A7.971 7.971 0 0018 10c0-2.169-.855-4.132-2.243-5.586a1 1 0 010-1.414z" />
        </svg>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-purple-900 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume}%, #4c1d95 ${volume}%, #4c1d95 100%)`
          }}
        />
        <span className="text-xs text-gray-400 w-8">{Math.round(volume)}%</span>
      </div>

      {/* Status */}
      <p className="text-xs text-gray-500 text-center">
        {loading && '⏳ Loading...'}
        {isPlaying && !loading && '▶️ Playing'}
        {!isPlaying && !loading && audioUrl && '⏸️ Paused'}
      </p>
    </div>
  );
};

export default JioSaavanAudioPlayer;
