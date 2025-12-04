// Scraper específico para Vale (VALE3)
// Site: https://vale.com/pt/investidores

import * as cheerio from "cheerio";
import { getMultipleVideoDetails, extractTrimestreFromTitle } from "../youtube";

interface ValeWebcast {
  titulo: string;
  descricao?: string;
  sourceUrl: string;
  sourceType: "youtube" | "zoom" | "mziq" | "external";
  youtubeId?: string;
  thumbnailUrl?: string;
  duracao?: number;
  dataEvento: Date;
  trimestre: string;
  ano: number;
  tipo: string;
}

const VALE_URLS = [
  "https://vale.com/pt/investidores",
  "https://vale.com/pt/comunicados-resultados-apresentacoes-e-relatorios",
];

export async function scrapeVale(): Promise<ValeWebcast[]> {
  console.log("🔍 Iniciando scraping Vale...");
  const youtubeIds: string[] = [];
  const otherLinks: Array<{ url: string; context: string; sourceType: "zoom" | "mziq" | "external" }> = [];

  for (const url of VALE_URLS) {
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

      // Coletar iframes do YouTube
      $('iframe[src*="youtube"]').each((_, el) => {
        const src = $(el).attr("src");
        if (!src) return;
        const youtubeId = extractYouTubeId(src);
        if (youtubeId && !youtubeIds.includes(youtubeId)) {
          youtubeIds.push(youtubeId);
        }
      });

      // Coletar links de Zoom
      $('a[href*="zoom.us"], a[href*="webinar"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        if (!href) return;
        const context = $el.closest("article, section, div").text();
        if (context.toLowerCase().includes("webcast") || context.toLowerCase().includes("resultado")) {
          otherLinks.push({ url: href, context, sourceType: "zoom" });
        }
      });

      // Coletar links de MZ
      $('a[href*="api.mziq.com"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        if (!href) return;
        const text = $el.text().toLowerCase();
        const alt = $el.find("img").attr("alt")?.toLowerCase() || "";
        if (text.includes("vídeo") || text.includes("video") || 
            text.includes("webcast") || alt.includes("video")) {
          const context = $el.closest("article, section, div, tr").text();
          otherLinks.push({ url: href, context: context + " " + text, sourceType: "mziq" });
        }
      });

      if (youtubeIds.length > 0 || otherLinks.length > 0) {
        console.log(`  ✅ Encontrados ${youtubeIds.length} YouTube + ${otherLinks.length} outros`);
        break;
      }
    } catch (error) {
      console.error(`  ⚠️ Erro:`, error instanceof Error ? error.message : error);
    }
  }

  const webcasts: ValeWebcast[] = [];

  // Buscar metadados REAIS do YouTube
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
        tipo: detectTipo(video.title),
      });

      console.log(`  ✅ ${video.title}`);
    }
  }

  // Processar outros links
  for (const link of otherLinks) {
    const { trimestre, ano } = extractTrimestre(link.context);
    if (trimestre === "N/A") continue;

    const exists = webcasts.some(w => w.sourceUrl === link.url);
    if (exists) continue;

    webcasts.push({
      titulo: link.sourceType === "zoom" ? `Webcast Vale - ${trimestre}` : `Vídeo Vale - ${trimestre}`,
      descricao: `Conteúdo de resultados da Vale`,
      sourceUrl: link.url,
      sourceType: link.sourceType,
      dataEvento: getApproximateDate(trimestre, ano),
      trimestre,
      ano,
      tipo: "resultado",
    });
  }

  // Deduplica e ordena
  const unique = webcasts.filter((w, i, arr) => 
    arr.findIndex(x => x.sourceUrl === w.sourceUrl) === i
  );
  unique.sort((a, b) => b.dataEvento.getTime() - a.dataEvento.getTime());

  console.log(`🎯 Vale: ${unique.length} webcasts encontrados`);
  return unique;
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
  const patterns = [
    /(\d)[TtQq](\d{2})(?!\d)/,
    /(\d)[TtQq](\d{4})/,
  ];
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

function detectTipo(titulo: string): string {
  const lower = titulo.toLowerCase();
  if (lower.includes("guidance") || lower.includes("projeç")) return "guidance";
  if (lower.includes("investor day") || lower.includes("dia do investidor")) return "investor_day";
  if (lower.includes("resultado") || lower.includes("trimest") || lower.includes("earnings")) return "resultado";
  return "evento";
}

// Garantir que datas não sejam no futuro
function getApproximateDate(trimestre: string, ano: number): Date {
  const now = new Date();
  const match = trimestre.match(/(\d)/);
  
  if (match) {
    const quarter = parseInt(match[1]);
    const month = quarter * 3;
    const date = new Date(ano, month, 0);
    
    // Se a data for no futuro, usar trimestre anterior
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

export default scrapeVale;
