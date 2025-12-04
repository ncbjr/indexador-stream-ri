"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AudioPlayer, type AudioTrack } from "./AudioPlayer";

interface PlayerContextType {
  currentTrack: AudioTrack | null;
  queue: AudioTrack[];
  playTrack: (track: AudioTrack) => void;
  addToQueue: (track: AudioTrack) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [historyStack, setHistoryStack] = useState<AudioTrack[]>([]);

  const playTrack = useCallback((track: AudioTrack) => {
    if (currentTrack) {
      setHistoryStack((prev) => [currentTrack, ...prev.slice(0, 49)]);
    }
    setCurrentTrack(track);
  }, [currentTrack]);

  const addToQueue = useCallback((track: AudioTrack) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const [nextTrack, ...rest] = queue;
      if (currentTrack) {
        setHistoryStack((prev) => [currentTrack, ...prev.slice(0, 49)]);
      }
      setCurrentTrack(nextTrack);
      setQueue(rest);
    }
  }, [queue, currentTrack]);

  const playPrevious = useCallback(() => {
    if (historyStack.length > 0) {
      const [previousTrack, ...rest] = historyStack;
      if (currentTrack) {
        setQueue((prev) => [currentTrack, ...prev]);
      }
      setCurrentTrack(previousTrack);
      setHistoryStack(rest);
    }
  }, [historyStack, currentTrack]);

  const close = useCallback(() => {
    setCurrentTrack(null);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        playTrack,
        addToQueue,
        clearQueue,
        playNext,
        playPrevious,
        close,
      }}
    >
      {children}
      <AudioPlayer
        track={currentTrack}
        onClose={close}
        onNext={queue.length > 0 ? playNext : undefined}
        onPrevious={historyStack.length > 0 ? playPrevious : undefined}
      />
    </PlayerContext.Provider>
  );
}

