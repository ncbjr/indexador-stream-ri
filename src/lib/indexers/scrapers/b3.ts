// Scraper específico para B3 (B3SA3)
// Site: https://ri.b3.com.br/pt-br/informacoes-financeiras/central-de-resultados/

import * as cheerio from "cheerio";

interface B3Webcast {
  titulo: string;
  descricao?: string;
  sourceUrl: string;
  sourceType: "mziq" | "mp3" | "external";
  youtubeId?: string;
  thumbnailUrl?: string;
  dataEvento: Date;
  trimestre: string;
  ano: number;
  tipo: string;
}

const B3_URL = "https://ri.b3.com.br/pt-br/informacoes-financeiras/central-de-resultados/";

export async function scrapeB3(): Promise<B3Webcast[]> {
  console.log("🔍 Iniciando scraping B3...");
  const webcasts: B3Webcast[] = [];

  try {
    const response = await fetch(B3_URL, {
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

    // A B3 tem uma tabela organizada com links de áudio
    $('a[href*="api.mziq.com"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href");
      if (!href) return;

      // Extrair texto do link e do contexto
      const linkText = $el.text().trim() || $el.find("img").attr("alt") || "";
      const rowText = $el.closest("tr, td").text();
      const fullContext = linkText + " " + rowText;

      // Verificar se é áudio
      const isAudio = 
        fullContext.toLowerCase().includes("teleconferência") ||
        fullContext.toLowerCase().includes("teleconferencia") ||
        fullContext.toLowerCase().includes("áudio") ||
        fullContext.toLowerCase().includes("audio") ||
        fullContext.toLowerCase().includes("podcast");

      if (!isAudio) return;

      // Extrair trimestre
      const { trimestre, ano } = extractTrimestre(fullContext);
      if (trimestre === "N/A") return;

      // Determinar tipo - tudo é resultado trimestral
      const tipo = fullContext.toLowerCase().includes("podcast") ? "podcast" : "resultado";
      
      // Criar título descritivo baseado no contexto real
      let titulo = tipo === "podcast" 
        ? `Podcast de Resultados B3 - ${trimestre}`
        : `Teleconferência de Resultados B3 - ${trimestre}`;

      // Tentar extrair mais detalhes do texto da linha (PT/EN, CEO/CFO)
      if (fullContext.toLowerCase().includes("inglês") || fullContext.toLowerCase().includes("english")) {
        titulo += " [EN]";
      } else if (fullContext.toLowerCase().includes("português")) {
        titulo += " [PT]";
      }

      // Evitar duplicatas
      const exists = webcasts.some(w => w.sourceUrl === href);
      if (!exists) {
        webcasts.push({
          titulo,
          descricao: `Áudio ${tipo === "podcast" ? "do podcast" : "da teleconferência"} de resultados da B3`,
          sourceUrl: href,
          sourceType: "mziq",
          dataEvento: getApproximateDate(trimestre, ano),
          trimestre,
          ano,
          tipo,
        });

        console.log(`  ✅ ${tipo}: ${trimestre}`);
      }
    });

  } catch (error) {
    console.error(`❌ Erro no scraping B3:`, error instanceof Error ? error.message : error);
  }

  // Ordenar por data (mais recente primeiro)
  webcasts.sort((a, b) => b.dataEvento.getTime() - a.dataEvento.getTime());

  console.log(`🎯 B3: ${webcasts.length} áudios encontrados`);
  return webcasts;
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
        return {
          trimestre: `${t}T${y.toString().slice(-2)}`,
          ano: y,
        };
      }
    }
  }

  return { trimestre: "N/A", ano: new Date().getFullYear() };
}

// Garantir que datas não sejam no futuro
function getApproximateDate(trimestre: string, ano: number): Date {
  const now = new Date();
  const match = trimestre.match(/(\d)/);
  
  if (match) {
    const quarter = parseInt(match[1]);
    const month = quarter * 3;
    const date = new Date(ano, month, 0);
    
    // Se a data calculada for no futuro, usar o trimestre anterior
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

export default scrapeB3;
