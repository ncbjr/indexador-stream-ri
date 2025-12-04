"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Headphones } from "lucide-react";

interface EmpresaCardProps {
  ticker: string;
  nome: string;
  setor: string;
  logoUrl?: string | null;
  audioCount: number;
}

// Cores baseadas no ticker para consistência visual
const getTickerColor = (ticker: string) => {
  const colors = [
    "from-emerald-600 to-emerald-800",
    "from-blue-600 to-blue-800",
    "from-violet-600 to-violet-800",
    "from-amber-600 to-amber-800",
    "from-rose-600 to-rose-800",
    "from-cyan-600 to-cyan-800",
    "from-fuchsia-600 to-fuchsia-800",
    "from-lime-600 to-lime-800",
    "from-orange-600 to-orange-800",
    "from-teal-600 to-teal-800",
  ];
  const index = ticker.charCodeAt(0) % colors.length;
  return colors[index];
};

export function EmpresaCard({
  ticker,
  nome,
  setor,
  logoUrl,
  audioCount,
}: EmpresaCardProps) {
  const [imgError, setImgError] = useState(false);
  const tickerColor = getTickerColor(ticker);
  
  // Pega as iniciais do nome da empresa
  const initials = nome
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <Link href={`/empresas/${ticker}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 cursor-pointer border border-slate-800 hover:border-emerald-500/50 transition-colors"
      >
        {/* Logo */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center ${
            !logoUrl || imgError ? `bg-gradient-to-br ${tickerColor}` : "bg-slate-700"
          }`}>
            {logoUrl && !imgError ? (
              <img
                src={logoUrl}
                alt={nome}
                className="w-full h-full object-contain p-2"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-lg font-bold text-white font-mono drop-shadow-md">
                {initials}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-mono text-lg font-bold text-emerald-400">
              {ticker}
            </h3>
            <p className="text-sm text-slate-400">{nome}</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
            {setor}
          </span>
          <div className="flex items-center gap-1 text-slate-400">
            <Headphones className="w-4 h-4" />
            <span className="text-sm">{audioCount}</span>
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    </Link>
  );
}
