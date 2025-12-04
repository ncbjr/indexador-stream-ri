// Scraper específico para Ambev (ABEV3)
// Site: https://ri.ambev.com.br

import * as cheerio from "cheerio";
import { getMultipleVideoDetails, extractTrimestreFromTitle } from "../youtube";

interface AmbevWebcast {
  titulo: string;
  descricao?: string;
  sourceUrl: string;
  sourceType: "youtube" | "mziq" | "external";
  youtubeId?: string;
  thumbnailUrl?: string;
  duracao?: number;
  dataEvento: Date;
  trimestre: string;
  ano: number;
  tipo: string;
}

const AMBEV_URLS = [
  "https://ri.ambev.com.br/relatorios-publicacoes/divulgacao-de-resultados/",
  "https://ri.ambev.com.br/en/reports-publications/earnings-release/",
];

export async function scrapeAmbev(): Promise<AmbevWebcast[]> {
  console.log("🔍 Iniciando scraping Ambev...");
  const youtubeIds: string[] = [];
  const otherLinks: Array<{ url: string; context: string }> = [];

  for (const url of AMBEV_URLS) {
    try {
      console.log(`  Tentando: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
      });

      if (!response.ok) {
        console.log(`  ❌ HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Coletar IDs do YouTube
      $('a[href*="youtube.com/watch"], a[href*="youtu.be"]').each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        const youtubeId = extractYouTubeId(href);
        if (youtubeId && !youtubeIds.includes(youtubeId)) {
          youtubeIds.push(youtubeId);
        }
      });

      // Coletar iframes
      $('iframe[src*="youtube"]').each((_, el) => {
        const src = $(el).attr("src");
        if (!src) return;
        const youtubeId = extractYouTubeId(src);
        if (youtubeId && !youtubeIds.includes(youtubeId)) {
          youtubeIds.push(youtubeId);
        }
      });

      // Coletar links MZ/Webcast
      $('a[href*="api.mziq.com"], a[href*="mzweb"], a[href*="webcast"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        if (!href || href.includes("youtube")) return;
        const context = $el.closest("tr, div, article").text();
        if (context.toLowerCase().includes("teleconferência") || 
            context.toLowerCase().includes("áudio") ||
            context.toLowerCase().includes("webcast") ||
            context.toLowerCase().includes("resultado")) {
          otherLinks.push({ url: href, context });
        }
      });

      if (youtubeIds.length > 0 || otherLinks.length > 0) {
        console.log(`  ✅ Encontrados ${youtubeIds.length} YouTube + ${otherLinks.length} MZ`);
        break;
      }
    } catch (error) {
      console.log(`  ⚠️ Erro:`, error instanceof Error ? error.message : error);
    }
  }

  const webcasts: AmbevWebcast[] = [];

  // Buscar metadados do YouTube
  if (youtubeIds.length > 0) {
    console.log("  🔄 Buscando metadados reais do YouTube...");
    const videoDetails = await getMultipleVideoDetails(youtubeIds);

    for (const video of videoDetails) {
      const trimestreInfo = extractTrimestreFromTitle(video.title);
      
      webcasts.push({
        titulo: video.title,
        descricao: video.description.slice(0, 500),
        sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
        sourceType: "youtube",
        youtubeId: video.id,
        thumbnailUrl: video.thumbnailUrl,
        duracao: video.duration,
        dataEvento: new Date(video.publishedAt),
        trimestre: trimestreInfo?.trimestre || "N/A",
        ano: trimestreInfo?.ano || new Date(video.publishedAt).getFullYear(),
        tipo: "resultado",
      });

      console.log(`  ✅ ${video.title}`);
    }
  }

  // Processar links MZ
  for (const link of otherLinks) {
    const { trimestre, ano } = extractTrimestre(link.context);
    if (trimestre === "N/A") continue;

    const exists = webcasts.some(w => w.sourceUrl === link.url);
    if (exists) continue;

    webcasts.push({
      titulo: `Teleconferência Ambev - ${trimestre}`,
      descricao: "Teleconferência de resultados Ambev",
      sourceUrl: link.url,
      sourceType: "mziq",
      dataEvento: getApproximateDate(trimestre, ano),
      trimestre,
      ano,
      tipo: "resultado",
    });
  }

  webcasts.sort((a, b) => b.dataEvento.getTime() - a.dataEvento.getTime());
  console.log(`🎯 Ambev: ${webcasts.length} webcasts encontrados`);
  return webcasts;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractTrimestre(text: string): { trimestre: string; ano: number } {
  const patterns = [/(\d)[TtQq](\d{2})(?!\d)/, /(\d)[TtQq](\d{4})/];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const t = parseInt(match[1]);
      let y = parseInt(match[2]);
      if (y < 100) y += 2000;
      if (t >= 1 && t <= 4) {
        return { trimestre: `${t}T${y.toString().slice(-2)}`, ano: y };
      }
    }
  }
  return { trimestre: "N/A", ano: new Date().getFullYear() };
}

function getApproximateDate(trimestre: string, ano: number): Date {
  const now = new Date();
  const match = trimestre.match(/(\d)/);
  if (match) {
    const quarter = parseInt(match[1]);
    const month = quarter * 3;
    const date = new Date(ano, month, 0);
    if (date > now) {
      const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
      const prevQuarter = currentQuarter > 1 ? currentQuarter - 1 : 4;
      const prevYear = currentQuarter > 1 ? now.getFullYear() : now.getFullYear() - 1;
      return new Date(prevYear, prevQuarter * 3, 0);
    }
    return date;
  }
  return now;
}

export default scrapeAmbev;

