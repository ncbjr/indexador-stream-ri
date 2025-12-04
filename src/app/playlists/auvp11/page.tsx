"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/react";
import { usePlayer } from "@/components/PlayerProvider";
import { AudioCard } from "@/components/AudioCard";
import { toast } from "react-toastify";
import {
  TrendingUp,
  Play,
  Shuffle,
  ArrowLeft,
  ListMusic,
  Building2,
  Filter,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Configuração dos tipos de filtro
const TIPOS_CONFIG = [
  { id: "resultado", label: "Resultados", color: "emerald" },
  { id: "investor_day", label: "Investor Day", color: "purple" },
  { id: "evento", label: "Eventos", color: "amber" },
  { id: "podcast", label: "Podcasts", color: "pink" },
];

export default function AUVP11PlaylistPage() {
  const [tipoFiltro, setTipoFiltro] = useState<string | undefined>("resultado");
  const { playTrack, setQueue } = usePlayer();

  const { data: audios, isLoading } = trpc.audios.listAUVP11.useQuery({
    limit: 100,
    tipo: tipoFiltro,
  });

  const handlePlayAll = () => {
    if (!audios || audios.length === 0) {
      toast.warning("Nenhum áudio disponível");
      return;
    }

    const tracks = audios.map((audio) => ({
      id: audio.id,
      titulo: audio.titulo,
      sourceUrl: audio.sourceUrl,
      sourceType: audio.sourceType,
      youtubeId: audio.youtubeId,
      thumbnailUrl: audio.thumbnailUrl,
      duracao: audio.duracao,
      empresa: audio.empresa,
    }));

    playTrack(tracks[0]);
    if (tracks.length > 1) {
      setQueue(tracks.slice(1));
    }

    toast.success(`Reproduzindo ${tracks.length} áudios AUVP11`);
  };

  const handleShufflePlay = () => {
    if (!audios || audios.length === 0) {
      toast.warning("Nenhum áudio disponível");
      return;
    }

    const tracks = audios.map((audio) => ({
      id: audio.id,
      titulo: audio.titulo,
      sourceUrl: audio.sourceUrl,
      sourceType: audio.sourceType,
      youtubeId: audio.youtubeId,
      thumbnailUrl: audio.thumbnailUrl,
      duracao: audio.duracao,
      empresa: audio.empresa,
    }));

    const shuffled = [...tracks].sort(() => Math.random() - 0.5);

    playTrack(shuffled[0]);
    if (shuffled.length > 1) {
      setQueue(shuffled.slice(1));
    }

    toast.success(`Reproduzindo aleatório - ${tracks.length} áudios`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Índice AUVP11</h1>
                <p className="text-slate-400">
                  31 empresas • Áudios de resultados trimestrais
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              disabled={!audios?.length}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-medium transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5" fill="white" />
              Reproduzir Tudo
            </button>
            <button
              onClick={handleShufflePlay}
              disabled={!audios?.length}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-medium transition-all flex items-center gap-2"
            >
              <Shuffle className="w-5 h-5" />
              Aleatório
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <ListMusic className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-white">{audios?.length || 0}</p>
              <p className="text-sm text-slate-400">Áudios disponíveis</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-2xl font-bold text-white">31</p>
              <p className="text-sm text-slate-400">Empresas no índice</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">ETF AUVP11</p>
              <p className="text-sm text-slate-400">ETF de Valor da B3</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 flex-wrap mb-6"
      >
        <Filter className="w-4 h-4 text-slate-400" />
        
        <button
          onClick={() => setTipoFiltro(undefined)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            !tipoFiltro
              ? "bg-slate-700 text-white"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
        >
          Todos
        </button>

        {TIPOS_CONFIG.map((tipo) => (
          <button
            key={tipo.id}
            onClick={() => setTipoFiltro(tipo.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              tipoFiltro === tipo.id
                ? tipo.color === "emerald" ? "bg-emerald-600/80 text-white" :
                  tipo.color === "purple" ? "bg-purple-600/80 text-white" :
                  tipo.color === "amber" ? "bg-amber-600/80 text-white" :
                  tipo.color === "pink" ? "bg-pink-600/80 text-white" :
                  "bg-slate-700 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            {tipo.label}
          </button>
        ))}
      </motion.div>

      {/* Grid de Áudios */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : audios && audios.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          key={tipoFiltro}
        >
          {audios.map((audio) => (
            <motion.div key={audio.id} variants={itemVariants}>
              <AudioCard
                {...audio}
                dataEvento={audio.dataEvento}
                onPlay={() =>
                  playTrack({
                    id: audio.id,
                    titulo: audio.titulo,
                    sourceUrl: audio.sourceUrl,
                    sourceType: audio.sourceType,
                    youtubeId: audio.youtubeId,
                    thumbnailUrl: audio.thumbnailUrl,
                    duracao: audio.duracao,
                    empresa: audio.empresa,
                  })
                }
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">
            Nenhum áudio encontrado
          </h3>
          <p className="text-sm text-slate-500">
            {tipoFiltro 
              ? "Tente outro filtro ou clique em 'Todos' para ver todos os áudios."
              : "Execute a indexação para buscar áudios das empresas."}
          </p>
        </div>
      )}
    </div>
  );
}


