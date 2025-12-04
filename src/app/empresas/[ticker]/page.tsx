"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/react";
import { usePlayer } from "@/components/PlayerProvider";
import { AudioCard } from "@/components/AudioCard";
import { ArrowLeft, ExternalLink, Headphones, Calendar } from "lucide-react";
import Link from "next/link";

interface EmpresaPageProps {
  params: Promise<{ ticker: string }>;
}

export default function EmpresaPage({ params }: EmpresaPageProps) {
  const { ticker } = use(params);
  const { playTrack } = usePlayer();

  const { data: empresa, isLoading } = trpc.empresas.getByTicker.useQuery({
    ticker: ticker.toUpperCase(),
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-slate-800 rounded mb-8" />
          <div className="flex gap-6 mb-8">
            <div className="w-24 h-24 bg-slate-800 rounded-xl" />
            <div className="flex-1">
              <div className="h-8 w-48 bg-slate-800 rounded mb-2" />
              <div className="h-4 w-32 bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          Empresa não encontrada
        </h1>
        <Link href="/" className="text-emerald-400 hover:underline">
          Voltar para o início
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 mb-12"
      >
        {/* Logo */}
        <div className="w-32 h-32 rounded-2xl bg-slate-800 overflow-hidden flex-shrink-0">
          {empresa.logoUrl ? (
            <img
              src={empresa.logoUrl}
              alt={empresa.nome}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-600 font-mono">
              {empresa.ticker.slice(0, 2)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white">{empresa.nome}</h1>
            <span className="font-mono text-2xl text-emerald-400">
              {empresa.ticker}
            </span>
          </div>
          <p className="text-slate-400 mb-4">{empresa.setor}</p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Headphones className="w-4 h-4" />
              <span>{empresa.audios.length} áudios</span>
            </div>
            {empresa.siteRi && (
              <a
                href={empresa.siteRi}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Site de RI</span>
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Audios */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Webcasts</h2>
        </div>

        {empresa.audios.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {empresa.audios.map((audio, index) => (
              <motion.div
                key={audio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <AudioCard
                  {...audio}
                  dataEvento={audio.dataEvento}
                  empresa={{
                    ticker: empresa.ticker,
                    nome: empresa.nome,
                    logoUrl: empresa.logoUrl,
                  }}
                  onPlay={() =>
                    playTrack({
                      id: audio.id,
                      titulo: audio.titulo,
                      sourceUrl: audio.sourceUrl,
                      sourceType: audio.sourceType,
                      youtubeId: audio.youtubeId,
                      thumbnailUrl: audio.thumbnailUrl,
                      duracao: audio.duracao,
                      empresa: {
                        ticker: empresa.ticker,
                        nome: empresa.nome,
                        logoUrl: empresa.logoUrl,
                      },
                    })
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-slate-900/50 rounded-xl">
            <Headphones className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">
              Nenhum áudio disponível
            </h3>
            <p className="text-sm text-slate-500">
              Os áudios serão indexados automaticamente.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

