"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ListMusic, Heart, User, LogOut, Building2, ChevronDown, ChevronRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/react";

export function Navbar() {
  const pathname = usePathname();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();
  const [showEmpresas, setShowEmpresas] = useState(false);

  const navItems = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/buscar", icon: Search, label: "Buscar" },
    { href: "/playlists", icon: ListMusic, label: "Playlists" },
    { href: "/favoritos", icon: Heart, label: "Favoritos" },
  ];

  // Agrupar empresas por setor
  const empresasPorSetor = empresas?.reduce((acc, empresa) => {
    const setor = empresa.setor || "Outros";
    if (!acc[setor]) acc[setor] = [];
    acc[setor].push(empresa);
    return acc;
  }, {} as Record<string, typeof empresas>);

  return (
    <nav className="fixed top-0 left-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">RI</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">RI Stream</h1>
            <p className="text-xs text-slate-500">Áudios de RI</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="my-4 border-t border-slate-800" />

        {/* Playlist AUVP11 - Destaque */}
        <Link
          href="/playlists/auvp11"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2",
            pathname === "/playlists/auvp11"
              ? "bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 text-emerald-400 border border-emerald-500/30"
              : "text-slate-400 hover:text-white bg-slate-800/30 hover:bg-gradient-to-r hover:from-emerald-600/10 hover:to-cyan-600/10 border border-transparent hover:border-slate-700"
          )}
        >
          <TrendingUp className="w-5 h-5" />
          <div className="flex-1">
            <span className="font-medium">Índice AUVP11</span>
            <p className="text-[10px] text-slate-500">31 empresas de valor</p>
          </div>
        </Link>

        {/* Divider */}
        <div className="my-4 border-t border-slate-800" />

        {/* Section: Empresas - Colapsável */}
        <button
          onClick={() => setShowEmpresas(!showEmpresas)}
          className="w-full flex items-center justify-between px-4 py-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Empresas</span>
            {empresas && (
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                {empresas.length}
              </span>
            )}
          </div>
          {showEmpresas ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Lista de Empresas */}
        {showEmpresas && empresasPorSetor && (
          <div className="mt-2 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {Object.entries(empresasPorSetor).sort().map(([setor, empresasDoSetor]) => (
              <div key={setor}>
                <div className="px-4 py-1">
                  <h3 className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    {setor}
                  </h3>
                </div>
                <ul className="space-y-0.5">
                  {empresasDoSetor?.sort((a, b) => a.ticker.localeCompare(b.ticker)).map((empresa) => (
                    <li key={empresa.id}>
                      <Link
                        href={`/empresas/${empresa.ticker}`}
                        className={cn(
                          "flex items-center justify-between px-4 py-1.5 rounded-lg transition-colors group",
                          pathname === `/empresas/${empresa.ticker}`
                            ? "bg-emerald-600/20 text-emerald-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs font-bold">{empresa.ticker}</span>
                          <span className="text-[10px] text-slate-500 truncate group-hover:text-slate-400">
                            {empresa.nome.length > 12 ? empresa.nome.slice(0, 12) + "..." : empresa.nome}
                          </span>
                        </div>
                        {empresa._count.audios > 0 && (
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                            {empresa._count.audios}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User section */}
      <div className="p-4 border-t border-slate-800">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || user.email}
                </p>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Entrar</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

