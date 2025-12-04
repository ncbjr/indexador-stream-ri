declare module "react-youtube" {
  import { Component } from "react";

  export interface YouTubeProps {
    videoId: string;
    id?: string;
    className?: string;
    containerClassName?: string;
    opts?: {
      height?: string;
      width?: string;
      playerVars?: {
        autoplay?: 0 | 1;
        cc_lang_pref?: string;
        cc_load_policy?: 0 | 1;
        color?: "red" | "white";
        controls?: 0 | 1 | 2;
        disablekb?: 0 | 1;
        enablejsapi?: 0 | 1;
        end?: number;
        fs?: 0 | 1;
        hl?: string;
        iv_load_policy?: 1 | 3;
        list?: string;
        listType?: "playlist" | "search" | "user_uploads";
        loop?: 0 | 1;
        modestbranding?: 0 | 1;
        origin?: string;
        playlist?: string;
        playsinline?: 0 | 1;
        rel?: 0 | 1;
        showinfo?: 0 | 1;
        start?: number;
        mute?: 0 | 1;
      };
    };
    onReady?: (event: YouTubeEvent) => void;
    onPlay?: (event: YouTubeEvent) => void;
    onPause?: (event: YouTubeEvent) => void;
    onEnd?: (event: YouTubeEvent) => void;
    onError?: (event: YouTubeEvent) => void;
    onStateChange?: (event: YouTubeEvent) => void;
    onPlaybackRateChange?: (event: YouTubeEvent) => void;
    onPlaybackQualityChange?: (event: YouTubeEvent) => void;
  }

  export interface YouTubePlayer {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    getVideoLoadedFraction(): number;
    getCurrentTime(): number;
    getDuration(): number;
    getVideoUrl(): string;
    getVideoEmbedCode(): string;
    getPlaybackRate(): number;
    setPlaybackRate(suggestedRate: number): void;
    getAvailablePlaybackRates(): number[];
    setVolume(volume: number): void;
    getVolume(): number;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    getPlayerState(): number;
  }

  export interface YouTubeEvent {
    target: YouTubePlayer;
    data: number;
  }

  export default class YouTube extends Component<YouTubeProps> {}
}

