"use client";

import { motion } from "framer-motion";
import { Play, Heart, Plus, Clock } from "lucide-react";
import { cn, formatDuration, formatDate } from "@/lib/utils";

interface AudioCardProps {
  id: string;
  titulo: string;
  descricao?: string | null;
  thumbnailUrl?: string | null;
  duracao?: number | null;
  dataEvento: Date;
  trimestre: string;
  tipo: string;
  empresa: {
    ticker: string;
    nome: string;
    logoUrl?: string | null;
  };
  isFavorited?: boolean;
  onPlay?: () => void;
  onFavorite?: () => void;
  onAddToPlaylist?: () => void;
  variant?: "default" | "compact" | "list";
}

export function AudioCard({
  titulo,
  descricao,
  thumbnailUrl,
  duracao,
  dataEvento,
  trimestre,
  tipo,
  empresa,
  isFavorited,
  onPlay,
  onFavorite,
  onAddToPlaylist,
  variant = "default",
}: AudioCardProps) {
  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="group relative bg-slate-900/50 rounded-lg p-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={onPlay}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded overflow-hidden bg-slate-800 flex-shrink-0">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                {empresa.ticker}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Play className="w-5 h-5 text-white" fill="white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-white truncate">{titulo}</h4>
            <p className="text-xs text-slate-400">{empresa.nome}</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {trimestre}
          </span>
        </div>
      </motion.div>
    );
  }

  if (variant === "list") {
    return (
      <motion.div
        whileHover={{ backgroundColor: "rgba(51, 65, 85, 0.3)" }}
        className="group flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors"
        onClick={onPlay}
      >
        <div className="relative w-14 h-14 rounded overflow-hidden bg-slate-800 flex-shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
              {empresa.ticker}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play className="w-6 h-6 text-white" fill="white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{titulo}</h4>
          <p className="text-xs text-slate-400 truncate">
            {empresa.nome} • {trimestre}
          </p>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.();
            }}
            className={cn(
              "p-2 rounded-full hover:bg-slate-700 transition-colors",
              isFavorited ? "text-red-500" : "text-slate-400"
            )}
          >
            <Heart className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist?.();
            }}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-xs">{formatDate(new Date(dataEvento))}</span>
          {duracao && (
            <>
              <span>•</span>
              <span className="text-xs font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(duracao)}
              </span>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // Default card variant
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative bg-slate-900/50 rounded-xl overflow-hidden cursor-pointer"
      onClick={onPlay}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-800">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <span className="text-4xl font-bold text-slate-700 font-mono">
              {empresa.ticker}
            </span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-6 h-6 text-slate-900 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        {duracao && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-mono px-2 py-0.5 rounded">
            {formatDuration(duracao)}
          </span>
        )}

        {/* Type badge */}
        <span
          className={cn(
            "absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded",
            tipo === "resultado" && "bg-emerald-500/80 text-white",
            tipo === "guidance" && "bg-amber-500/80 text-white",
            tipo === "investor_day" && "bg-purple-500/80 text-white",
            tipo === "evento" && "bg-slate-500/80 text-white"
          )}
        >
          {tipo === "resultado" && "Resultado"}
          {tipo === "guidance" && "Guidance"}
          {tipo === "investor_day" && "Investor Day"}
          {tipo === "evento" && "Evento"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-white text-sm line-clamp-2 mb-1">
              {titulo}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-emerald-400">{empresa.ticker}</span>
              <span>•</span>
              <span>{trimestre}</span>
              <span>•</span>
              <span>{formatDate(new Date(dataEvento))}</span>
            </div>
          </div>
        </div>

        {descricao && (
          <p className="mt-2 text-xs text-slate-500 line-clamp-2">{descricao}</p>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.();
            }}
            className={cn(
              "p-2 rounded-full hover:bg-slate-700 transition-colors",
              isFavorited ? "text-red-500" : "text-slate-400"
            )}
          >
            <Heart className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist?.();
            }}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

