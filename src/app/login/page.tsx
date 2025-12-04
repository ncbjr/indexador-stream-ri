"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/react";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      // Salvar token no cookie via API route
      document.cookie = `session=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">RI</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Entrar no RI Stream</h1>
          <p className="text-slate-400 mt-2">
            Acesse sua conta para gerenciar playlists e favoritos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-400 mt-6">
          Não tem uma conta?{" "}
          <Link
            href="/registro"
            className="text-emerald-400 hover:underline font-medium"
          >
            Criar conta
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

