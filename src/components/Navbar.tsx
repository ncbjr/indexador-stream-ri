"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ListMusic, Heart, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/react";

export function Navbar() {
  const pathname = usePathname();
  const { data: user } = trpc.auth.me.useQuery();

  const navItems = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/buscar", icon: Search, label: "Buscar" },
    { href: "/playlists", icon: ListMusic, label: "Playlists" },
    { href: "/favoritos", icon: Heart, label: "Favoritos" },
  ];

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
      <div className="flex-1 px-3">
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
        <div className="my-6 border-t border-slate-800" />

        {/* Section: Empresas */}
        <div className="px-4 mb-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Top Empresas
          </h2>
        </div>
        <ul className="space-y-1">
          {["PETR4", "VALE3", "ITUB4", "B3SA3", "WEGE3"].map((ticker) => (
            <li key={ticker}>
              <Link
                href={`/empresas/${ticker}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                  pathname === `/empresas/${ticker}`
                    ? "bg-slate-800 text-emerald-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <span className="font-mono text-sm">{ticker}</span>
              </Link>
            </li>
          ))}
        </ul>
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

