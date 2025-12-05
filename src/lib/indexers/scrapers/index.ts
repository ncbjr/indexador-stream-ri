// Central de scrapers específicos por empresa
// Cada empresa pode ter seu próprio scraper customizado
// Empresas novas usam o scraper genérico MZ Group

import scrapePetrobras from "./petrobras";
import scrapeBradesco from "./bradesco";
import scrapeItau from "./itau";
import scrapeItausa from "./itausa";
import scrapeVale from "./vale";
import scrapeB3 from "./b3";
import scrapeWeg from "./weg";
import scrapeEngie from "./engie";
import scrapeAmbev from "./ambev";
import scrapeLocaliza from "./localiza";
import scrapeMagazineLuiza from "./magazineluiza";
import scrapeMZGroup, { EMPRESAS_MZ_CONFIG, type MZGroupAudio } from "./mzgroup";

export interface WebcastResult {
  titulo: string;
  descricao?: string;
  sourceUrl: string;
  sourceType: "youtube" | "mp3" | "m4a" | "wav" | "mziq" | "external" | "zoom";
  youtubeId?: string;
  thumbnailUrl?: string;
  duracao?: number;
  dataEvento: Date;
  trimestre: string;
  ano: number;
  tipo: string;
}

// Converter resultado MZ Group para WebcastResult
function convertMZToWebcast(audio: MZGroupAudio): WebcastResult {
  return {
    ...audio,
    sourceType: audio.sourceType === "mp3" ? "mp3" : "external",
  };
}

// Mapa de scrapers específicos por ticker
const SPECIFIC_SCRAPERS: Record<string, () => Promise<WebcastResult[]>> = {
  PETR4: scrapePetrobras,
  BBDC4: scrapeBradesco,
  ITUB4: scrapeItau,
  ITSA4: scrapeItausa,
  VALE3: scrapeVale,
  B3SA3: scrapeB3,
  WEGE3: scrapeWeg,
  EGIE3: scrapeEngie,
  ABEV3: scrapeAmbev,
  RENT3: scrapeLocaliza,
  MGLU3: scrapeMagazineLuiza,
  // BBAS3 usa YouTube API direto (configurado no seed)
};

// Empresas que usam o scraper genérico MZ Group
const MZ_GROUP_EMPRESAS = Object.keys(EMPRESAS_MZ_CONFIG);

// Todas as empresas que têm scraper (específico ou MZ Group)
export const EMPRESAS_COM_SCRAPER = [
  ...Object.keys(SPECIFIC_SCRAPERS),
  ...MZ_GROUP_EMPRESAS,
];

// Função principal para executar scraping de uma empresa
export async function runScraper(ticker: string): Promise<WebcastResult[]> {
  // Primeiro tentar scraper específico
  const specificScraper = SPECIFIC_SCRAPERS[ticker];
  if (specificScraper) {
    try {
      return await specificScraper();
    } catch (error) {
      console.error(`❌ Erro no scraper específico de ${ticker}:`, error);
      return [];
    }
  }
  
  // Depois tentar scraper MZ Group genérico
  const mzConfig = EMPRESAS_MZ_CONFIG[ticker];
  if (mzConfig) {
    try {
      const audios = await scrapeMZGroup(mzConfig);
      return audios.map(convertMZToWebcast);
    } catch (error) {
      console.error(`❌ Erro no scraper MZ Group de ${ticker}:`, error);
      return [];
    }
  }

  console.log(`⚠️ Scraper não implementado para ${ticker}`);
  return [];
}

// Status de implementação dos scrapers
export const SCRAPER_STATUS: Record<string, "implementado" | "youtube" | "mzgroup" | "pendente"> = {
  // Top 10 MVP - Scrapers específicos
  PETR4: "implementado",
  VALE3: "implementado",
  ITUB4: "implementado",
  BBDC4: "implementado",
  B3SA3: "implementado",
  WEGE3: "implementado",
  ABEV3: "implementado",
  RENT3: "implementado",
  MGLU3: "implementado",
  BBAS3: "youtube",
  
  // AUVP11 - Scrapers MZ Group genérico
  ITSA4: "mzgroup",
  BPAC11: "mzgroup",
  PRIO3: "mzgroup",
  TOTS3: "mzgroup",
  BBSE3: "mzgroup",
  TIMS3: "mzgroup",
  CMIG4: "mzgroup",
  EGIE3: "mzgroup",
  CPFE3: "mzgroup",
  SBSP3: "mzgroup",
  CMIN3: "mzgroup",
  CXSE3: "mzgroup",
  CSMG3: "mzgroup",
  SAPR11: "mzgroup",
  ISAE4: "mzgroup",
  CYRE3: "mzgroup",
  DIRR3: "mzgroup",
  CURY3: "mzgroup",
  POMO4: "mzgroup",
  UNIP6: "mzgroup",
  ODPV3: "mzgroup",
  FRAS3: "mzgroup",
  ABCB4: "mzgroup",
  LEVE3: "mzgroup",
  INTB3: "mzgroup",
};

export { 
  scrapePetrobras, 
  scrapeBradesco, 
  scrapeItau, 
  scrapeVale, 
  scrapeB3,
  scrapeWeg,
  scrapeAmbev,
  scrapeLocaliza,
  scrapeMagazineLuiza,
  scrapeMZGroup,
  EMPRESAS_MZ_CONFIG,
};
