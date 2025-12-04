"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = "Buscar empresas, áudios, trimestres...",
  className,
  onSearch,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        if (onSearch) {
          onSearch(query.trim());
        } else {
          router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
        }
      }
    },
    [query, onSearch, router]
  );

  const clearQuery = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center bg-slate-900/50 border rounded-xl transition-all",
          isFocused
            ? "border-emerald-500/50 ring-2 ring-emerald-500/20"
            : "border-slate-700 hover:border-slate-600"
        )}
      >
        <Search className="absolute left-4 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-transparent py-3 pl-12 pr-10 text-white placeholder-slate-500 focus:outline-none"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearQuery}
              className="absolute right-4 p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

