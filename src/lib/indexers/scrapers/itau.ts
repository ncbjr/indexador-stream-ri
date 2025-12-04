// Scraper específico para Itaú Unibanco (ITUB4)
// Site: https://www.itau.com.br/relacoes-com-investidores/resultados-e-relatorios/central-de-resultados/

import * as cheerio from "cheerio";
import { getMultipleVideoDetails, extractTrimestreFromTitle } from "../youtube";

interface ItauWebcast {
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

const ITAU_URL = "https://www.itau.com.br/relacoes-com-investidores/resultados-e-relatorios/central-de-resultados/";

export async function scrapeItau(): Promise<ItauWebcast[]> {
  console.log("🔍 Iniciando scraping Itaú...");
  const youtubeIds: string[] = [];
  const mziqLinks: Array<{ url: string; context: string }> = [];

  try {
    const response = await fetch(ITAU_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Coletar IDs do YouTube
    $('a[href*="youtube.com/watch"], a[href*="youtu.be"]').each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      const youtubeId = extractYouTubeId(href);
      if (youtubeId && !youtubeIds.includes(youtubeId)) {
        youtubeIds.push(youtubeId);
      }
    });

    // 2. Coletar iframes do YouTube
    $('iframe[src*="youtube"]').each((_, el) => {
      const src = $(el).attr("src");
      if (!src) return;

      const youtubeId = extractYouTubeId(src);
      if (youtubeId && !youtubeIds.includes(youtubeId)) {
        youtubeIds.push(youtubeId);
      }
    });

    // 3. Coletar links MZ (vídeos hospedados)
    $('a[href*="api.mziq.com"], a[href*="mzfilemanager"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href");
      if (!href) return;

      const linkText = $el.text().trim();
      const $row = $el.closest("tr, td, div");
      const rowText = $row.text();
      const fullContext = `${linkText} ${rowText}`;

      // Verificar se é vídeo
      if (/v[íi]deo/i.test(fullContext)) {
        mziqLinks.push({ url: href, context: fullContext });
      }
    });

    console.log(`  📹 Encontrados ${youtubeIds.length} vídeos do YouTube`);
    console.log(`  🎬 Encontrados ${mziqLinks.length} vídeos MZ`);

  } catch (error) {
    console.error(`❌ Erro no scraping Itaú:`, error instanceof Error ? error.message : error);
    return [];
  }

  // Buscar metadados REAIS do YouTube
  const webcasts: ItauWebcast[] = [];

  if (youtubeIds.length > 0) {
    console.log("  🔄 Buscando metadados reais do YouTube...");
    const videoDetails = await getMultipleVideoDetails(youtubeIds);

    for (const video of videoDetails) {
      // Extrair trimestre do título real
      const trimestreInfo = extractTrimestreFromTitle(video.title);
      
      webcasts.push({
        titulo: video.title, // TÍTULO REAL DO YOUTUBE
        descricao: video.description.slice(0, 500), // DESCRIÇÃO REAL
        sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
        sourceType: "youtube",
        youtubeId: video.id,
        thumbnailUrl: video.thumbnailUrl, // THUMBNAIL REAL
        duracao: video.duration, // DURAÇÃO REAL
        dataEvento: new Date(video.publishedAt), // DATA REAL DE PUBLICAÇÃO
        trimestre: trimestreInfo?.trimestre || "N/A",
        ano: trimestreInfo?.ano || new Date(video.publishedAt).getFullYear(),
        tipo: detectTipoFromTitle(video.title),
      });

      console.log(`  ✅ ${video.title}`);
    }
  }

  // Processar links MZ (sem API para metadados, usar contexto da página)
  for (const mzLink of mziqLinks) {
    const trimestreInfo = extractTrimestreFromContext(mzLink.context);
    
    // Tentar criar um título mais descritivo baseado no contexto
    let titulo = "Vídeo Itaú";
    if (trimestreInfo.trimestre !== "N/A") {
      titulo = `Webcast Itaú - ${trimestreInfo.trimestre}`;
    }

    // Evitar duplicatas
    const exists = webcasts.some(w => w.sourceUrl === mzLink.url);
    if (!exists) {
      webcasts.push({
        titulo,
        descricao: mzLink.context.slice(0, 200),
        sourceUrl: mzLink.url,
        sourceType: "mziq",
        dataEvento: getApproximateDate(trimestreInfo.trimestre, trimestreInfo.ano),
        trimestre: trimestreInfo.trimestre,
        ano: trimestreInfo.ano,
        tipo: "resultado",
      });
    }
  }

  // Ordenar por data (mais recente primeiro)
  webcasts.sort((a, b) => b.dataEvento.getTime() - a.dataEvento.getTime());

  console.log(`🎯 Itaú: ${webcasts.length} webcasts encontrados`);
  return webcasts;
}

function detectTipoFromTitle(title: string): string {
  const titleLower = title.toLowerCase();

  if (titleLower.includes("investor day") || titleLower.includes("dia do investidor")) {
    return "investor_day";
  }
  if (titleLower.includes("guidance") || titleLower.includes("projeção")) {
    return "guidance";
  }
  if (titleLower.includes("resultado") || titleLower.includes("earnings") || 
      titleLower.includes("trimestral") || titleLower.includes("conference")) {
    return "resultado";
  }
  if (titleLower.includes("podcast")) {
    return "podcast";
  }

  return "evento";
}

function extractTrimestreFromContext(text: string): { trimestre: string; ano: number } {
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
        return {
          trimestre: `${t}T${y.toString().slice(-2)}`,
          ano: y,
        };
      }
    }
  }

  return { trimestre: "N/A", ano: new Date().getFullYear() };
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Para vídeos sem data real, usar data aproximada baseada no trimestre
// mas garantindo que seja no PASSADO
function getApproximateDate(trimestre: string, ano: number): Date {
  const now = new Date();
  const match = trimestre.match(/(\d)/);
  
  if (match) {
    const quarter = parseInt(match[1]);
    // Último dia do trimestre
    const month = quarter * 3;
    const date = new Date(ano, month, 0);
    
    // Se a data calculada for no futuro, usar o trimestre anterior do ano atual
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

export default scrapeItau;
