"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  ChevronUp,
  Maximize2,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";

interface AudioTrack {
  id: string;
  titulo: string;
  sourceUrl: string;
  sourceType: string;
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  duracao?: number | null;
  empresa: {
    ticker: string;
    nome: string;
    logoUrl?: string | null;
  };
}

interface AudioPlayerProps {
  track: AudioTrack | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function AudioPlayer({
  track,
  onClose,
  onNext,
  onPrevious,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubeRef = useRef<YouTubePlayer | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const isYouTube = track?.sourceType === "youtube";

  // Reset quando trocar de track
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (track?.duracao) {
      setDuration(track.duracao);
    }
  }, [track?.id, track?.duracao]);

  // Update time for HTML5 audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isYouTube) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [isYouTube]);

  // YouTube player handlers
  const onYouTubeReady = useCallback((event: YouTubeEvent) => {
    youtubeRef.current = event.target;
    setDuration(event.target.getDuration());
  }, []);

  const onYouTubeStateChange = useCallback((event: YouTubeEvent) => {
    // 1 = playing, 2 = paused
    setIsPlaying(event.data === 1);
  }, []);

  // Update YouTube time
  useEffect(() => {
    if (!isYouTube || !youtubeRef.current) return;

    const interval = setInterval(() => {
      if (youtubeRef.current && isPlaying) {
        setCurrentTime(youtubeRef.current.getCurrentTime());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isYouTube, isPlaying]);

  const togglePlay = () => {
    if (isYouTube && youtubeRef.current) {
      if (isPlaying) {
        youtubeRef.current.pauseVideo();
      } else {
        youtubeRef.current.playVideo();
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    if (isYouTube && youtubeRef.current) {
      youtubeRef.current.seekTo(newTime, true);
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (isYouTube && youtubeRef.current) {
      youtubeRef.current.setVolume(newVolume * 100);
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(volume || 1);
    } else {
      if (isYouTube && youtubeRef.current) {
        youtubeRef.current.setVolume(0);
      } else if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);

    if (isYouTube && youtubeRef.current) {
      youtubeRef.current.setPlaybackRate(nextRate);
    } else if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  if (!track) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-950 to-slate-900 border-t border-slate-800",
          isExpanded ? "h-screen" : "h-24"
        )}
      >
        {/* YouTube Player (hidden) */}
        {isYouTube && track.youtubeId && (
          <div className="absolute opacity-0 pointer-events-none">
            <YouTube
              videoId={track.youtubeId}
              opts={{
                height: "1",
                width: "1",
                playerVars: {
                  autoplay: 0,
                  controls: 0,
                },
              }}
              onReady={onYouTubeReady}
              onStateChange={onYouTubeStateChange}
            />
          </div>
        )}

        {/* HTML5 Audio */}
        {!isYouTube && (
          <audio ref={audioRef} src={track.sourceUrl} preload="metadata" />
        )}

        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={seek}
          className="absolute top-0 left-0 right-0 h-1 bg-slate-800 cursor-pointer group"
        >
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
              {track.thumbnailUrl ? (
                <img
                  src={track.thumbnailUrl}
                  alt={track.titulo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                  {track.empresa.ticker}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-white truncate">
                {track.titulo}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {track.empresa.nome}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={onPrevious}
              className="p-2 text-slate-400 hover:text-white transition-colors hidden md:block"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-slate-900" />
              ) : (
                <Play className="w-5 h-5 text-slate-900 ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 text-slate-400 hover:text-white transition-colors hidden md:block"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Time and volume */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <span className="text-xs text-slate-400 font-mono hidden md:block">
              {formatDuration(Math.floor(currentTime))} /{" "}
              {formatDuration(Math.floor(duration))}
            </span>

            <button
              onClick={changePlaybackRate}
              className="text-xs text-slate-400 hover:text-white font-mono px-2 py-1 rounded bg-slate-800 hidden md:block"
            >
              {playbackRate}x
            </button>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-emerald-500"
              />
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white transition-colors hidden md:block"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export type { AudioTrack };

