import { useContext } from 'react';
import { MusicPlayerContext } from './MusicPlayerContextSetup';

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
}
