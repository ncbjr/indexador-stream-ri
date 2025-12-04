// Cheerio Scraper para sites de RI estáticos
// Usado quando o site não requer JavaScript para renderizar

import * as cheerio from "cheerio";

interface ScrapedAudio {
  titulo: string;
  descricao?: string;
  audioUrl: string;
  sourceType: "mp3" | "m4a" | "wav" | "external";
  dataEvento?: Date;
  trimestre?: string;
  ano?: number;
}

interface ScraperConfig {
  baseUrl: string;
  resultadosPath: string;
  // Seletores CSS
  selectors: {
    audioLinks: string;
    title?: string;
    date?: string;
    description?: string;
  };
}

// Configurações por empresa
const SCRAPER_CONFIGS: Record<string, ScraperConfig> = {
  BBDC4: {
    baseUrl: "https://www.bradescori.com.br",
    resultadosPath: "/central-de-resultados",
    selectors: {
      audioLinks: 'a[href*=".mp3"], a[href*="webcast"], a[href*="audio"]',
      title: ".titulo, .title, h3, h4",
      date: ".data, .date, time",
    },
  },
  WEGE3: {
    baseUrl: "https://ri.weg.net",
    resultadosPath: "/central-de-resultados",
    selectors: {
      audioLinks: 'a[href*=".mp3"], a[href*="webcast"]',
      title: ".titulo, h3",
      date: ".data, time",
    },
  },
  RENT3: {
    baseUrl: "https://ri.localiza.com",
    resultadosPath: "/informacoes-financeiras/central-de-resultados",
    selectors: {
      audioLinks: 'a[href*=".mp3"], a[href*="webcast"], a[href*="audio"]',
      title: ".title, h3, h4",
      date: ".date, time",
    },
  },
};

export async function scrapeRISite(
  ticker: string,
  customConfig?: Partial<ScraperConfig>
): Promise<ScrapedAudio[]> {
  const config = {
    ...SCRAPER_CONFIGS[ticker],
    ...customConfig,
  };

  if (!config.baseUrl) {
    console.warn(`Configuração de scraper não encontrada para ${ticker}`);
    return [];
  }

  try {
    const url = `${config.baseUrl}${config.resultadosPath}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const audios: ScrapedAudio[] = [];

    $(config.selectors.audioLinks).each((_, element) => {
      const $el = $(element);
      const href = $el.attr("href");

      if (!href) return;

      // Construir URL absoluta
      const audioUrl = href.startsWith("http")
        ? href
        : `${config.baseUrl}${href.startsWith("/") ? "" : "/"}${href}`;

      // Determinar tipo de fonte
      let sourceType: ScrapedAudio["sourceType"] = "external";
      if (audioUrl.includes(".mp3")) sourceType = "mp3";
      else if (audioUrl.includes(".m4a")) sourceType = "m4a";
      else if (audioUrl.includes(".wav")) sourceType = "wav";

      // Extrair título
      let titulo =
        $el.text().trim() ||
        $el.attr("title") ||
        $el.closest("li, div, article").find(config.selectors.title || "h3, h4").first().text().trim();

      if (!titulo) {
        titulo = `Áudio - ${ticker}`;
      }

      // Extrair data se possível
      let dataEvento: Date | undefined;
      const dateSelector = config.selectors.date;
      if (dateSelector) {
        const dateText = $el.closest("li, div, article").find(dateSelector).first().text().trim();
        if (dateText) {
          dataEvento = parseDate(dateText);
        }
      }

      // Extrair trimestre do título
      const trimestreInfo = extractTrimestreFromText(titulo);

      audios.push({
        titulo,
        audioUrl,
        sourceType,
        dataEvento,
        trimestre: trimestreInfo?.trimestre,
        ano: trimestreInfo?.ano,
      });
    });

    return audios;
  } catch (error) {
    console.error(`Erro ao fazer scraping de ${ticker}:`, error);
    return [];
  }
}

// Parser de data em português
function parseDate(dateStr: string): Date | undefined {
  // Tentar formatos comuns em português
  const patterns = [
    /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
  ];

  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      if (pattern === patterns[2]) {
        // YYYY-MM-DD
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      }
      // DD/MM/YYYY ou DD-MM-YYYY
      return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
  }

  // Tentar parsing direto
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

// Extrair trimestre de texto
function extractTrimestreFromText(text: string): { trimestre: string; ano: number } | null {
  const patterns = [
    /(\d)T(\d{2})(?!\d)/i,
    /(\d)T(\d{4})/i,
    /Q(\d)\s*(\d{4})/i,
    /(\d)[ºo]?\s*(?:trimestre|trim)\s*(?:de\s*)?(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const trimestre = parseInt(match[1], 10);
      let ano = parseInt(match[2], 10);
      if (ano < 100) ano += 2000;

      if (trimestre >= 1 && trimestre <= 4) {
        return {
          trimestre: `${trimestre}T${ano.toString().slice(-2)}`,
          ano,
        };
      }
    }
  }

  return null;
}

export { SCRAPER_CONFIGS };
export type { ScrapedAudio, ScraperConfig };

