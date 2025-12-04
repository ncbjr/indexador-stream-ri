"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc/react";
import { usePlayer } from "@/components/PlayerProvider";
import { AudioCard } from "@/components/AudioCard";
import {
  ListMusic,
  Plus,
  Trash2,
  MoreHorizontal,
  Play,
  Edit2,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function PlaylistsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const { playTrack } = usePlayer();
  const utils = trpc.useUtils();

  const { data: playlists, isLoading } = trpc.playlists.list.useQuery();
  const { data: playlistDetail } = trpc.playlists.getById.useQuery(
    { id: selectedPlaylist! },
    { enabled: !!selectedPlaylist }
  );

  const createMutation = trpc.playlists.create.useMutation({
    onSuccess: () => {
      utils.playlists.list.invalidate();
      setIsCreating(false);
      setNewPlaylistName("");
    },
  });

  const deleteMutation = trpc.playlists.delete.useMutation({
    onSuccess: () => {
      utils.playlists.list.invalidate();
      if (selectedPlaylist) setSelectedPlaylist(null);
    },
  });

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createMutation.mutate({ nome: newPlaylistName.trim() });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Minhas Playlists</h1>
          <p className="text-slate-400">
            Organize seus webcasts favoritos em playlists
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Playlist</span>
        </button>
      </motion.div>

      {/* Create playlist modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">
                Criar nova playlist
              </h2>
              <form onSubmit={handleCreatePlaylist}>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Nome da playlist"
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-4"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newPlaylistName.trim() || createMutation.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white py-2 rounded-lg transition-colors"
                  >
                    {createMutation.isPending ? "Criando..." : "Criar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex gap-8">
        {/* Playlists list */}
        <div className="w-80 flex-shrink-0">
          {playlists && playlists.length > 0 ? (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <motion.div
                  key={playlist.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedPlaylist(playlist.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-colors ${
                    selectedPlaylist === playlist.id
                      ? "bg-slate-800"
                      : "bg-slate-900/50 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnails grid */}
                    <div className="w-14 h-14 rounded-lg bg-slate-800 overflow-hidden grid grid-cols-2 gap-0.5">
                      {playlist.items.slice(0, 4).map((item, i) => (
                        <div
                          key={i}
                          className="bg-slate-700"
                          style={{
                            backgroundImage: item.audio.thumbnailUrl
                              ? `url(${item.audio.thumbnailUrl})`
                              : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {playlist.nome}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {playlist._count.items} áudios
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Excluir playlist?")) {
                          deleteMutation.mutate({ id: playlist.id });
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900/50 rounded-xl">
              <ListMusic className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                Nenhuma playlist
              </h3>
              <p className="text-sm text-slate-500">
                Crie sua primeira playlist para organizar seus webcasts.
              </p>
            </div>
          )}
        </div>

        {/* Playlist detail */}
        <div className="flex-1">
          {selectedPlaylist && playlistDetail ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {playlistDetail.nome}
              </h2>

              {playlistDetail.items.length > 0 ? (
                <div className="space-y-2">
                  {playlistDetail.items.map((item) => (
                    <AudioCard
                      key={item.id}
                      {...item.audio}
                      dataEvento={item.audio.dataEvento}
                      variant="list"
                      onPlay={() =>
                        playTrack({
                          id: item.audio.id,
                          titulo: item.audio.titulo,
                          sourceUrl: item.audio.sourceUrl,
                          sourceType: item.audio.sourceType,
                          youtubeId: item.audio.youtubeId,
                          thumbnailUrl: item.audio.thumbnailUrl,
                          duracao: item.audio.duracao,
                          empresa: item.audio.empresa,
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-900/50 rounded-xl">
                  <p className="text-slate-400">
                    Esta playlist está vazia. Adicione áudios usando o botão +
                    nos cards.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">
                Selecione uma playlist para ver os áudios
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

