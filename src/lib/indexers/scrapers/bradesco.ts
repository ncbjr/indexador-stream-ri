// Scraper específico para Bradesco (BBDC4)
// Site: https://www.bradescori.com.br

import * as cheerio from "cheerio";
import { getMultipleVideoDetails, extractTrimestreFromTitle } from "../youtube";

interface BradescoWebcast {
  titulo: string;
  descricao?: string;
  sourceUrl: string;
  sourceType: "youtube" | "mp3" | "external";
  youtubeId?: string;
  thumbnailUrl?: string;
  duracao?: number;
  dataEvento: Date;
  trimestre: string;
  ano: number;
  tipo: string;
}

const BRADESCO_BASE_URL = "https://www.bradescori.com.br";

const BRADESCO_URLS = [
  "/central-de-resultados/",
  "/resultados-trimestrais/",
  "/webcast/",
  "/site/",
];

export async function scrapeBradesco(): Promise<BradescoWebcast[]> {
  console.log("🔍 Iniciando scraping Bradesco...");
  const youtubeIds: string[] = [];
  const otherLinks: Array<{ url: string; titulo: string; dateText: string }> = [];

  for (const path of BRADESCO_URLS) {
    try {
      const url = `${BRADESCO_BASE_URL}${path}`;
      console.log(`  Tentando: ${url}`);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
        redirect: "follow",
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

      // Coletar outros links (MZ Group, MP3)
      $('a[href*="mzgroup"], a[href*="mzweb"], a[href*=".mp3"], a[href*="video"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        if (!href || href.includes("youtube")) return;

        const $container = $el.closest("li, div, article, tr");
        const titulo = $el.text().trim() || $el.attr("title") || 
          $container.find("h2, h3, h4").first().text().trim() || "Webcast Bradesco";
        const dateText = $container.find("time, .data, .date").first().text().trim();

        otherLinks.push({
          url: href.startsWith("http") ? href : `${BRADESCO_BASE_URL}${href}`,
          titulo: titulo.replace(/\s+/g, " ").trim().substring(0, 200),
          dateText,
        });
      });

      if (youtubeIds.length > 0 || otherLinks.length > 0) {
        console.log(`  ✅ Encontrados ${youtubeIds.length} YouTube + ${otherLinks.length} outros`);
        break;
      }
    } catch (error) {
      console.log(`  ⚠️ Erro:`, error instanceof Error ? error.message : error);
    }
  }

  const webcasts: BradescoWebcast[] = [];

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
    const trimestreMatch = link.titulo.match(/(\d)[TtQq](\d{2,4})/);
    let trimestre = getCurrentTrimestre();
    let ano = new Date().getFullYear();
    let dataEvento = new Date();

    if (trimestreMatch) {
      const t = parseInt(trimestreMatch[1]);
      let y = parseInt(trimestreMatch[2]);
      if (y < 100) y += 2000;
      trimestre = `${t}T${y.toString().slice(-2)}`;
      ano = y;
    }

    if (link.dateText) {
      const parsed = parseDate(link.dateText);
      if (parsed) dataEvento = parsed;
    }

    webcasts.push({
      titulo: link.titulo,
      sourceUrl: link.url,
      sourceType: link.url.includes(".mp3") ? "mp3" : "external",
      dataEvento,
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

  console.log(`🎯 Bradesco: ${unique.length} webcasts únicos`);
  return unique;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseDate(str: string): Date | null {
  const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function getCurrentTrimestre(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `${quarter}T${now.getFullYear().toString().slice(-2)}`;
}

function detectTipo(titulo: string): string {
  const lower = titulo.toLowerCase();
  if (lower.includes("guidance") || lower.includes("projeç")) return "guidance";
  if (lower.includes("investor day") || lower.includes("dia do investidor")) return "investor_day";
  if (lower.includes("resultado") || lower.includes("trimest") || lower.includes("webcast")) return "resultado";
  return "evento";
}

export default scrapeBradesco;
