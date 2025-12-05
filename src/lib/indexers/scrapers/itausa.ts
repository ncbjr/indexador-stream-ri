// Scraper específico para Itaúsa (ITSA4)
// Site: https://ri.itausa.com.br
// Itaúsa tem vídeos do YouTube embutidos e o podcast "Itaúsa Cast"

import * as cheerio from "cheerio";

interface ItausaWebcast {
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

const ITAUSA_URL = "https://ri.itausa.com.br/informacoes-financeiras/central-de-resultados/";

export async function scrapeItausa(): Promise<ItausaWebcast[]> {
  console.log("🔍 Iniciando scraping Itaúsa...");
  const webcasts: ItausaWebcast[] = [];
  const youtubeIds: string[] = [];

  try {
    console.log(`  📄 Acessando: ${ITAUSA_URL}`);
    
    const response = await fetch(ITAUSA_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });

    if (!response.ok) {
      console.log(`  ❌ HTTP ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Buscar iframes do YouTube
    $('iframe[src*="youtube.com/embed"]').each((_, el) => {
      const src = $(el).attr("src");
      if (!src) return;
      
      const match = src.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
      if (match && !youtubeIds.includes(match[1])) {
        youtubeIds.push(match[1]);
        console.log(`  📹 Encontrado iframe YouTube: ${match[1]}`);
      }
    });

    // Buscar links do YouTube
    $('a[href*="youtube.com/watch"], a[href*="youtu.be"]').each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      
      const match = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match && !youtubeIds.includes(match[1])) {
        youtubeIds.push(match[1]);
      }
    });

    console.log(`  📊 ${youtubeIds.length} vídeos YouTube encontrados`);

    // Adicionar vídeos do YouTube encontrados
    // Como a API do YouTube pode ter cota limitada, adicionamos com dados básicos
    if (youtubeIds.length > 0) {
      console.log("  🎬 Adicionando vídeos do YouTube...");
      
      for (const videoId of youtubeIds) {
        // Usar trimestre atual como padrão
        const trimestre = getCurrentTrimestre();
        const ano = new Date().getFullYear();
        
        webcasts.push({
          titulo: `Itaúsa - Resultados ${trimestre}`,
          descricao: "Videoconferência de resultados da Itaúsa",
          sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
          sourceType: "youtube",
          youtubeId: videoId,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          dataEvento: new Date(),
          trimestre,
          ano,
          tipo: "resultado",
        });
        
        console.log(`  ✅ Vídeo YouTube: ${videoId}`);
      }
    }

  } catch (error) {
    console.log(`  ⚠️ Erro:`, error instanceof Error ? error.message : error);
  }

  console.log(`🎯 Itaúsa: ${webcasts.length} webcasts encontrados`);
  return webcasts;
}

function detectTipo(titulo: string): string {
  const lower = titulo.toLowerCase();
  if (lower.includes("podcast") || lower.includes("cast")) return "podcast";
  if (lower.includes("investor day")) return "investor_day";
  if (lower.includes("guidance")) return "guidance";
  return "resultado";
}

function getCurrentTrimestre(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `${quarter}T${now.getFullYear().toString().slice(-2)}`;
}

export default scrapeItausa;

