import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/react";
import { Navbar } from "@/components/Navbar";
import { PlayerProvider } from "@/components/PlayerProvider";
import { ToastProvider } from "@/components/ToastProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RI Stream - Áudios de Relações com Investidores",
  description:
    "Plataforma para descobrir, buscar e ouvir webcasts de resultados trimestrais das empresas listadas na B3",
  keywords: [
    "RI",
    "Relações com Investidores",
    "B3",
    "Bolsa de Valores",
    "Webcasts",
    "Resultados Trimestrais",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-950 text-white`}
      >
        <TRPCProvider>
          <PlayerProvider>
            <div className="flex min-h-screen">
              <Navbar />
              <main className="flex-1 ml-64 pb-24">{children}</main>
            </div>
            <ToastProvider />
          </PlayerProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
