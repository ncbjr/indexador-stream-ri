"use client";

import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/react";
import { usePlayer } from "@/components/PlayerProvider";
import { AudioCard } from "@/components/AudioCard";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FavoritosPage() {
  const { playTrack } = usePlayer();
  const utils = trpc.useUtils();

  const { data: favoritos, isLoading, error } = trpc.favoritos.list.useQuery();

  const toggleMutation = trpc.favoritos.toggle.useMutation({
    onSuccess: () => {
      utils.favoritos.list.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-400 mb-2">
            Faça login para ver seus favoritos
          </h3>
          <p className="text-slate-500 mb-6">
            Você precisa estar logado para salvar e ver seus áudios favoritos.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Entrar na conta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
          <h1 className="text-3xl font-bold text-white">Favoritos</h1>
        </div>
        <p className="text-slate-400">
          {favoritos?.length || 0} áudios salvos
        </p>
      </motion.div>

      {/* Content */}
      {favoritos && favoritos.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          {favoritos.map((favorito, index) => (
            <motion.div
              key={favorito.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <AudioCard
                {...favorito.audio}
                dataEvento={favorito.audio.dataEvento}
                variant="list"
                isFavorited={true}
                onPlay={() =>
                  playTrack({
                    id: favorito.audio.id,
                    titulo: favorito.audio.titulo,
                    sourceUrl: favorito.audio.sourceUrl,
                    sourceType: favorito.audio.sourceType,
                    youtubeId: favorito.audio.youtubeId,
                    thumbnailUrl: favorito.audio.thumbnailUrl,
                    duracao: favorito.audio.duracao,
                    empresa: favorito.audio.empresa,
                  })
                }
                onFavorite={() =>
                  toggleMutation.mutate({ audioId: favorito.audio.id })
                }
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-400 mb-2">
            Nenhum favorito ainda
          </h3>
          <p className="text-slate-500 mb-6">
            Clique no coração nos cards de áudio para adicionar aos favoritos.
          </p>
          <Link
            href="/"
            className="text-emerald-400 hover:underline font-medium"
          >
            Explorar áudios
          </Link>
        </div>
      )}
    </div>
  );
}

