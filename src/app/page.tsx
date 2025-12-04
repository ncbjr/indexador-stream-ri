"use client";

import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/react";
import { usePlayer } from "@/components/PlayerProvider";
import { AudioCard } from "@/components/AudioCard";
import { EmpresaCard } from "@/components/EmpresaCard";
import { SearchBar } from "@/components/SearchBar";
import { TrendingUp, Clock, Building2 } from "lucide-react";

export default function HomePage() {
  const { playTrack } = usePlayer();

  const { data: empresas, isLoading: loadingEmpresas } =
    trpc.empresas.list.useQuery();

  const { data: recentAudios, isLoading: loadingAudios } =
    trpc.audios.listRecent.useQuery({ limit: 12 });

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
        className="mb-12 max-w-2xl"
      >
        <SearchBar />
      </motion.div>

      {/* Empresas Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Empresas</h2>
        </div>

        {loadingEmpresas ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-slate-900/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {empresas?.map((empresa) => (
              <motion.div key={empresa.id} variants={itemVariants}>
                <EmpresaCard
                  ticker={empresa.ticker}
                  nome={empresa.nome}
                  setor={empresa.setor}
                  logoUrl={empresa.logoUrl}
                  audioCount={empresa._count.audios}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Recent Audios Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Áudios Recentes</h2>
        </div>

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
              Nenhum áudio indexado ainda
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Configure a YOUTUBE_API_KEY no arquivo .env e clique no botão abaixo.
            </p>
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
          </div>
        )}
      </section>
    </div>
  );
}
