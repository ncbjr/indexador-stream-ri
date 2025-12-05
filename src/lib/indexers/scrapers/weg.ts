// Scraper específico para WEG (WEGE3) usando Playwright
// Site: https://ri.weg.net
// A página usa JavaScript pesado para carregar conteúdo dinamicamente

import { chromium, type Browser } from "playwright";
import * as cheerio from "cheerio";

interface WegWebcast {
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

const WEG_URL = "https://ri.weg.net/informacoes-financeiras/central-de-resultados/";

export async function scrapeWeg(): Promise<WegWebcast[]> {
  console.log("🔍 Iniciando scraping WEG com Playwright...");
  const webcasts: WegWebcast[] = [];
  let browser: Browser | null = null;

  try {
    console.log(`  📄 Acessando: ${WEG_URL}`);
    
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Aguardar página carregar completamente
    await page.goto(WEG_URL, { waitUntil: "networkidle", timeout: 30000 });
    
    // Aguardar conteúdo dinâmico carregar (categorias MZ Group)
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

    // Buscar links de áudio da API MZ (Áudio da Teleconferência)
    $('a[href*="api.mziq.com"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href");
      if (!href) return;

      // Verificar se é áudio (não PDF, não transcrição)
      const texto = $el.text().toLowerCase() + " " + $el.closest("tr, div, article").text().toLowerCase();
      
      if (texto.includes("transcrição") || texto.includes("transcricao") || 
          texto.includes("pdf") || texto.includes("apresentação") || 
          texto.includes("apresentacao")) {
        return; // Pular documentos
      }

      if (texto.includes("áudio") || texto.includes("audio") || 
          texto.includes("teleconferência") || texto.includes("teleconferencia")) {
        
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
          $el.closest("tr, div, article").find("h3, h4, .title").first().text().trim() ||
          `WEG - Teleconferência ${trimestre}`;

        audioLinks.push({ url: href, titulo, trimestre, ano });
        console.log(`  🎙️ Áudio encontrado: ${titulo}`);
      }
    });

    // Adicionar vídeos do YouTube
    for (const videoId of youtubeIds) {
      const trimestre = getCurrentTrimestre();
      const ano = new Date().getFullYear();
      
      webcasts.push({
        titulo: `WEG - Resultados ${trimestre}`,
        descricao: "Videoconferência de resultados WEG",
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
        descricao: "Teleconferência de resultados WEG",
        sourceUrl: audio.url,
        sourceType: "mp3",
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
  console.log(`🎯 WEG: ${webcasts.length} webcasts encontrados`);
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

export default scrapeWeg;
