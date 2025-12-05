// Scraper específico para Engie Brasil (EGIE3) usando Playwright
// Site: https://www.engie.com.br/investidores/videoconferencia-de-resultados/
// A página usa JavaScript pesado para carregar conteúdo dinamicamente

import { chromium, type Browser } from "playwright";
import * as cheerio from "cheerio";

interface EngieWebcast {
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

const ENGIE_URL = "https://www.engie.com.br/investidores/videoconferencia-de-resultados/";

export async function scrapeEngie(): Promise<EngieWebcast[]> {
  console.log("🔍 Iniciando scraping Engie com Playwright...");
  const webcasts: EngieWebcast[] = [];
  let browser: Browser | null = null;

  try {
    console.log(`  📄 Acessando: ${ENGIE_URL}`);
    
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Aguardar página carregar completamente
    await page.goto(ENGIE_URL, { waitUntil: "networkidle", timeout: 30000 });
    
    // Aguardar conteúdo dinâmico carregar
    await page.waitForTimeout(3000);
    
    // Obter HTML renderizado
    const html = await page.content();
    await browser.close();
    browser = null;

    const $ = cheerio.load(html);
    const youtubeIds: string[] = [];
    const audioLinks: Array<{ url: string; titulo: string; trimestre: string; ano: number }> = [];

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

    // Buscar links de áudio (MP3, MZ Group, etc)
    $('a[href*="api.mziq.com"], a[href*=".mp3"], a[href*="audio"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href");
      if (!href) return;

      const texto = $el.text().toLowerCase() + " " + $el.closest("tr, div, article, li").text().toLowerCase();
      
      // Filtrar apenas áudios (não PDFs, transcrições, etc)
      if (texto.includes("transcrição") || texto.includes("transcricao") || 
          texto.includes("pdf") || texto.includes("apresentação") || 
          texto.includes("apresentacao") || texto.includes("release")) {
        return;
      }

      if (texto.includes("áudio") || texto.includes("audio") || 
          texto.includes("videoconferência") || texto.includes("videoconferencia") ||
          texto.includes("webcast") || href.includes(".mp3")) {
        
        // Extrair trimestre do contexto
        const trimestreMatch = texto.match(/(\d)[TtQq](\d{2,4})/);
        let trimestre = getCurrentTrimestre();
        let ano = new Date().getFullYear();

        if (trimestreMatch) {
          const t = parseInt(trimestreMatch[1]);
          let y = parseInt(trimestreMatch[2]);
          if (y < 100) y += 2000;
          trimestre = `${t}T${y.toString().slice(-2)}`;
          ano = y;
        }

        const titulo = $el.text().trim() || 
          $el.closest("tr, div, article, li").find("h3, h4, .title, .titulo").first().text().trim() ||
          `Engie Brasil - Videoconferência ${trimestre}`;

        audioLinks.push({ url: href, titulo, trimestre, ano });
        console.log(`  🎙️ Áudio encontrado: ${titulo}`);
      }
    });

    // Adicionar vídeos do YouTube
    for (const videoId of youtubeIds) {
      const trimestre = getCurrentTrimestre();
      const ano = new Date().getFullYear();
      
      webcasts.push({
        titulo: `Engie Brasil - Resultados ${trimestre}`,
        descricao: "Videoconferência de resultados Engie Brasil",
        sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
        sourceType: "youtube",
        youtubeId: videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        dataEvento: new Date(),
        trimestre,
        ano,
        tipo: "resultado",
      });
    }

    // Adicionar áudios MP3
    for (const audio of audioLinks) {
      webcasts.push({
        titulo: audio.titulo,
        descricao: "Videoconferência de resultados Engie Brasil",
        sourceUrl: audio.url,
        sourceType: audio.url.includes(".mp3") ? "mp3" : "external",
        dataEvento: getDataTrimestre(audio.trimestre, audio.ano),
        trimestre: audio.trimestre,
        ano: audio.ano,
        tipo: "resultado",
      });
    }

  } catch (error) {
    console.log(`  ⚠️ Erro:`, error instanceof Error ? error.message : error);
    if (browser) {
      await browser.close();
    }
  }

  webcasts.sort((a, b) => b.dataEvento.getTime() - a.dataEvento.getTime());
  console.log(`🎯 Engie: ${webcasts.length} webcasts encontrados`);
  return webcasts;
}

function getCurrentTrimestre(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `${quarter}T${now.getFullYear().toString().slice(-2)}`;
}

function getDataTrimestre(trimestre: string, ano: number): Date {
  const match = trimestre.match(/(\d)/);
  if (match) {
    const quarter = parseInt(match[1]);
    // Resultados são divulgados ~45 dias após o fim do trimestre
    const mesPublicacao = quarter * 3 + 1; // Q1->Abr, Q2->Jul, Q3->Out, Q4->Jan(+1)
    const anoPublicacao = mesPublicacao > 12 ? ano + 1 : ano;
    return new Date(anoPublicacao, (mesPublicacao - 1) % 12, 15);
  }
  return new Date();
}

export default scrapeEngie;

