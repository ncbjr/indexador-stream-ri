"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/react";
import { usePlayer } from "@/components/PlayerProvider";
import { AudioCard } from "@/components/AudioCard";
import { SearchBar } from "@/components/SearchBar";
import { TrendingUp, Clock, Filter, BarChart3, Calendar, Mic, Radio, Play, ListPlus, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

// Tipos de conteúdo disponíveis
const TIPOS_CONFIG = [
  { id: "resultado", label: "Resultados", icon: BarChart3, color: "emerald" },
  { id: "investor_day", label: "Investor Day", icon: Calendar, color: "purple" },
  { id: "guidance", label: "Guidance", icon: TrendingUp, color: "amber" },
  { id: "evento", label: "Eventos", icon: Mic, color: "blue" },
  { id: "podcast", label: "Podcasts", icon: Radio, color: "pink" },
];

export default function HomePage() {
  const [tipoFiltro, setTipoFiltro] = useState<string | undefined>("resultado");
  const [showSavePlaylistModal, setShowSavePlaylistModal] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const { playTrack, setQueue } = usePlayer();

  const { data: recentAudios, isLoading: loadingAudios } =
    trpc.audios.listRecent.useQuery({ 
      limit: 50, // Buscar mais para reproduzir em sequência
      tipo: tipoFiltro,
    });

  // Buscar tipos disponíveis
  const { data: tiposDisponiveis } = trpc.audios.listTipos.useQuery();

  // Função para reproduzir seleção (todos os áudios do filtro atual)
  const handlePlaySelection = () => {
    if (!recentAudios?.items || recentAudios.items.length === 0) {
      toast.warning("Nenhum áudio para reproduzir");
      return;
    }

    const tracks = recentAudios.items.map((audio) => ({
      id: audio.id,
      titulo: audio.titulo,
      sourceUrl: audio.sourceUrl,
      sourceType: audio.sourceType,
      youtubeId: audio.youtubeId,
      thumbnailUrl: audio.thumbnailUrl,
      duracao: audio.duracao,
      empresa: audio.empresa,
    }));

    // Tocar o primeiro e adicionar o resto na fila
    playTrack(tracks[0]);
    if (tracks.length > 1) {
      setQueue(tracks.slice(1));
    }
    
    const tipoLabel = tipoFiltro 
      ? TIPOS_CONFIG.find(t => t.id === tipoFiltro)?.label || tipoFiltro
      : "Todos";
    toast.success(`Reproduzindo ${tracks.length} áudios - ${tipoLabel}`);
  };

  // Função para embaralhar e reproduzir
  const handleShufflePlay = () => {
    if (!recentAudios?.items || recentAudios.items.length === 0) {
      toast.warning("Nenhum áudio para reproduzir");
      return;
    }

    const tracks = recentAudios.items.map((audio) => ({
      id: audio.id,
      titulo: audio.titulo,
      sourceUrl: audio.sourceUrl,
      sourceType: audio.sourceType,
      youtubeId: audio.youtubeId,
      thumbnailUrl: audio.thumbnailUrl,
      duracao: audio.duracao,
      empresa: audio.empresa,
    }));

    // Embaralhar array
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);

    playTrack(shuffled[0]);
    if (shuffled.length > 1) {
      setQueue(shuffled.slice(1));
    }
    
    toast.success(`Reproduzindo aleatório - ${tracks.length} áudios`);
  };

  // Função para salvar playlist no localStorage
  const handleSavePlaylist = () => {
    if (!playlistName.trim()) {
      toast.error("Digite um nome para a playlist");
      return;
    }

    if (!recentAudios?.items || recentAudios.items.length === 0) {
      toast.error("Nenhum áudio para salvar");
      return;
    }

    const playlistData = {
      id: `playlist-${Date.now()}`,
      nome: playlistName,
      descricao: `Filtro: ${tipoFiltro || "Todos"} - Criada em ${new Date().toLocaleDateString("pt-BR")}`,
      audios: recentAudios.items.map((a) => a.id),
      createdAt: new Date().toISOString(),
    };

    // Salvar no localStorage
    const existingPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
    existingPlaylists.push(playlistData);
    localStorage.setItem("playlists", JSON.stringify(existingPlaylists));

    toast.success(`Playlist "${playlistName}" criada com ${recentAudios.items.length} áudios!`);
    setPlaylistName("");
    setShowSavePlaylistModal(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Filtrar tipos que existem no banco
  const tiposAtivos = TIPOS_CONFIG.filter(
    (t) => tiposDisponiveis?.some((td) => td.tipo === t.id)
  );

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Descubra os{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Áudios de RI
          </span>
        </h1>
        <p className="text-slate-400 text-lg">
          Webcasts de resultados trimestrais das principais empresas da B3
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 max-w-2xl"
      >
        <SearchBar />
      </motion.div>

      {/* Webcasts Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Webcasts</h2>
          </div>

          {/* Filtro de Tipos */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            
            {/* Botão "Todos" */}
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

            {/* Botões de tipo */}
            {tiposAtivos.map((tipo) => {
              const Icon = tipo.icon;
              const isActive = tipoFiltro === tipo.id;
              const count = tiposDisponiveis?.find((t) => t.tipo === tipo.id)?.count || 0;
              
              return (
                <button
                  key={tipo.id}
                  onClick={() => setTipoFiltro(tipo.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                    isActive
                      ? tipo.color === "emerald" ? "bg-emerald-600/80 text-white" :
                        tipo.color === "purple" ? "bg-purple-600/80 text-white" :
                        tipo.color === "amber" ? "bg-amber-600/80 text-white" :
                        tipo.color === "blue" ? "bg-blue-600/80 text-white" :
                        tipo.color === "pink" ? "bg-pink-600/80 text-white" :
                        "bg-slate-700 text-white"
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tipo.label}</span>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/20" : "bg-slate-700"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Separador */}
            <div className="w-px h-6 bg-slate-700 mx-1" />

            {/* Botões de ação */}
            <button
              onClick={handlePlaySelection}
              disabled={!recentAudios?.items?.length}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reproduzir Seleção"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reproduzir</span>
            </button>

            <button
              onClick={handleShufflePlay}
              disabled={!recentAudios?.items?.length}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Aleatório"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Aleatório</span>
            </button>

            <button
              onClick={() => setShowSavePlaylistModal(true)}
              disabled={!recentAudios?.items?.length}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Salvar Playlist"
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salvar</span>
            </button>
          </div>
        </div>

        {/* Modal de Salvar Playlist */}
        {showSavePlaylistModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSavePlaylistModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-emerald-400" />
                Salvar Playlist
              </h3>
              
              <p className="text-slate-400 text-sm mb-4">
                {recentAudios?.items?.length || 0} áudios serão adicionados à playlist
                {tipoFiltro && (
                  <span className="text-emerald-400"> (Filtro: {TIPOS_CONFIG.find(t => t.id === tipoFiltro)?.label})</span>
                )}
              </p>

              <input
                type="text"
                placeholder="Nome da playlist..."
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSavePlaylist();
                }}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSavePlaylistModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePlaylist}
                  disabled={!playlistName.trim()}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Playlist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {loadingAudios ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-slate-900/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : recentAudios?.items && recentAudios.items.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            key={tipoFiltro} // Re-animar quando mudar filtro
          >
            {recentAudios.items.map((audio) => (
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
              {tipoFiltro 
                ? `Nenhum ${TIPOS_CONFIG.find(t => t.id === tipoFiltro)?.label.toLowerCase() || 'áudio'} encontrado`
                : "Nenhum áudio indexado ainda"
              }
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {tipoFiltro 
                ? "Tente outro filtro ou clique em 'Todos' para ver todos os áudios."
                : "Configure a YOUTUBE_API_KEY no arquivo .env e clique no botão abaixo."
              }
            </p>
            {!tipoFiltro && (
              <button
                onClick={async () => {
                  const btn = document.getElementById('indexar-btn') as HTMLButtonElement;
                  btn.disabled = true;
                  btn.textContent = 'Indexando...';
                  try {
                    const res = await fetch('/api/indexar');
                    const data = await res.json();
                    if (data.success) {
                      alert(`Indexação concluída! ${data.totalNovosAudios || 0} novos áudios.`);
                      window.location.reload();
                    } else {
                      alert('Erro: ' + (data.error || 'Erro desconhecido'));
                    }
                  } catch (e) {
                    alert('Erro ao indexar: ' + e);
                  }
                  btn.disabled = false;
                  btn.textContent = 'Indexar Áudios';
                }}
                id="indexar-btn"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              >
                Indexar Áudios
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
