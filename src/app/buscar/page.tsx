"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/react";
import { usePlayer } from "@/components/PlayerProvider";
import { AudioCard } from "@/components/AudioCard";
import { SearchBar } from "@/components/SearchBar";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";

function BuscarContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [trimestre, setTrimestre] = useState<string>("");
  const [ano, setAno] = useState<number | undefined>();

  const { playTrack } = usePlayer();

  const { data: results, isLoading } = trpc.audios.search.useQuery(
    {
      query: query || undefined,
      trimestre: trimestre || undefined,
      ano,
      limit: 50,
    },
    { enabled: true }
  );

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const trimestres = ["1T24", "2T24", "3T24", "4T24", "1T25", "2T25", "3T25"];
  const anos = [2025, 2024, 2023, 2022, 2021, 2020];

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Buscar</h1>
        <p className="text-slate-400">
          Encontre webcasts por empresa, trimestre ou palavras-chave
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        <SearchBar
          placeholder="Buscar por empresa, título, descrição..."
          onSearch={setQuery}
          autoFocus
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filtros:</span>
          </div>

          <select
            value={trimestre}
            onChange={(e) => setTrimestre(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todos os trimestres</option>
            {trimestres.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={ano || ""}
            onChange={(e) =>
              setAno(e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todos os anos</option>
            {anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Results */}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-slate-900/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-sm text-slate-400">
              {results.length} resultado(s) encontrado(s)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((audio, index) => (
                <motion.div
                  key={audio.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
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
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-400 mb-2">
              {query ? "Nenhum resultado encontrado" : "Comece sua busca"}
            </h3>
            <p className="text-slate-500">
              {query
                ? "Tente outros termos ou ajuste os filtros"
                : "Digite o nome de uma empresa ou ticker para encontrar webcasts"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BuscarContent />
    </Suspense>
  );
}
