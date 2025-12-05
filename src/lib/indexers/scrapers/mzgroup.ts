// Scraper genérico para empresas que usam MZ Group
// A maioria das empresas listadas na B3 usa a plataforma MZ Group para RI
// Estrutura padrão: tabelas com links para api.mziq.com (áudio MP3)
// Usa Playwright como fallback quando o conteúdo é carregado via JavaScript

import * as cheerio from "cheerio";
import { chromium, type Browser } from "playwright";

export interface MZGroupAudio {
  titulo: string;
  descricao?: string;
  sourceUrl: string;
  sourceType: "mp3" | "external";
  thumbnailUrl?: string;
  duracao?: number;
  dataEvento: Date;
  trimestre: string;
  ano: number;
  tipo: string;
}

interface MZScraperConfig {
  ticker: string;
  nome: string;
  urls: string[];
  // Seletores customizados (opcional - usa padrões se não informado)
  audioKeywords?: string[];
  excludeKeywords?: string[];
}

// Palavras-chave para identificar links de áudio em português
const DEFAULT_AUDIO_KEYWORDS = [
  "áudio",
  "audio",
  "teleconferência",
  "teleconferencia",
  "webcast",
  "podcast",
  "conference call",
  "earnings call",
];

// Palavras para excluir (não são áudios)
const DEFAULT_EXCLUDE_KEYWORDS = [
  "transcrição",
  "transcricao",
  "apresentação",
  "apresentacao",
  "release",
  "pdf",
  ".pdf",
];

// Extrair trimestre e ano do texto
function extractTrimestreAno(text: string): { trimestre: string; ano: number } | null {
  // Padrões comuns: "1T24", "1T2024", "1Q24", "Q1 2024", "1º Trimestre 2024"
  const patterns = [
    /(\d)[TQ](\d{2})\b/i,           // 1T24, 1Q24
    /(\d)[TQ](\d{4})\b/i,           // 1T2024, 1Q2024
    /[TQ](\d)\s*[/-]?\s*(\d{2,4})/i, // T1-24, Q1 2024
    /(\d)º?\s*(?:trimestre|tri)\s*(?:de\s*)?(\d{4})/i, // 1º Trimestre 2024
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const tri = parseInt(match[1]);
      let ano = parseInt(match[2]);
      if (ano < 100) ano += 2000;
      return { trimestre: `${tri}T${ano.toString().slice(-2)}`, ano };
    }
  }

  // Tentar extrair apenas o ano
  const yearMatch = text.match(/20\d{2}/);
  if (yearMatch) {
    return { trimestre: "?T" + yearMatch[0].slice(-2), ano: parseInt(yearMatch[0]) };
  }

  return null;
}

// Determinar tipo de conteúdo
function determinarTipo(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.includes("podcast")) return "podcast";
  if (lower.includes("investor day") || lower.includes("investidor")) return "investor_day";
  if (lower.includes("guidance") || lower.includes("projeção") || lower.includes("projecao")) return "guidance";
  if (lower.includes("evento") || lower.includes("event")) return "evento";
  
  // Padrão: resultado
  return "resultado";
}

// Obter data aproximada do trimestre
function getDataTrimestre(trimestre: string, ano: number): Date {
  const tri = parseInt(trimestre.charAt(0));
  
  // Resultados são divulgados ~45 dias após o fim do trimestre
  const mesPublicacao = tri * 3 + 1; // Q1->Abr, Q2->Jul, Q3->Out, Q4->Jan(+1)
  
  if (mesPublicacao > 12) {
    return new Date(ano + 1, 0, 15); // Janeiro do ano seguinte
  }
  
  return new Date(ano, mesPublicacao - 1, 15);
}

export async function scrapeMZGroup(config: MZScraperConfig): Promise<MZGroupAudio[]> {
  console.log(`🔍 Iniciando scraping MZ Group para ${config.ticker}...`);
  
  const audios: MZGroupAudio[] = [];
  const processedUrls = new Set<string>();
  
  const audioKeywords = config.audioKeywords || DEFAULT_AUDIO_KEYWORDS;
  const excludeKeywords = config.excludeKeywords || DEFAULT_EXCLUDE_KEYWORDS;

  for (const url of config.urls) {
    try {
      console.log(`  📄 Acessando: ${url}`);
      
      let html: string | null = null;
      let usePlaywright = false;

      // Tentar primeiro com fetch (mais rápido)
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
          },
        });

        if (!response.ok) {
          console.log(`  ⚠️ Erro HTTP ${response.status} para ${url}`);
          continue;
        }

        html = await response.text();
        
        // Verificar se há conteúdo dinâmico (indicadores de JavaScript)
        if (html.includes("mziq.com/filemanager") || html.includes("categories.push") || 
            html.length < 50000) {
          // Pode precisar de JavaScript, mas tentar Cheerio primeiro
          const $test = cheerio.load(html);
          const linksCount = $test('a[href*="api.mziq.com"]').length;
          
          if (linksCount === 0) {
            console.log(`  🔄 Nenhum link encontrado com Cheerio, tentando Playwright...`);
            usePlaywright = true;
          }
        }
      } catch (fetchError) {
        console.log(`  ⚠️ Erro no fetch, tentando Playwright...`);
        usePlaywright = true;
      }

      // Se necessário, usar Playwright
      if (usePlaywright) {
        let browser: Browser | null = null;
        try {
          // Tentar usar chromium headless shell (mais leve)
          browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Para WSL/containers
          });
          const page = await browser.newPage();
          await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
          await page.waitForTimeout(3000); // Aguardar JavaScript carregar
          html = await page.content();
          await browser.close();
          browser = null;
          console.log(`  ✅ HTML obtido via Playwright (${html.length} caracteres)`);
        } catch (playwrightError) {
          const errorMsg = playwrightError instanceof Error ? playwrightError.message : String(playwrightError);
          console.log(`  ⚠️ Erro no Playwright: ${errorMsg}`);
          if (errorMsg.includes("Executable doesn't exist") || errorMsg.includes("Missing dependencies")) {
            console.log(`  💡 Dica: Execute 'npx playwright install chromium' para instalar o browser`);
          }
          if (browser) {
            try {
              await browser.close();
            } catch (e) {
              // Ignorar erro ao fechar
            }
          }
          // Continuar sem HTML - não foi possível obter conteúdo
          continue;
        }
      }

      // Verificar se conseguimos obter HTML
      if (!html) {
        console.log(`  ⚠️ Não foi possível obter HTML para ${url}`);
        continue;
      }

      const $ = cheerio.load(html);

      // Buscar todos os links para api.mziq.com (áudios MZ Group)
      $('a[href*="api.mziq.com"], a[href*="mzfilemanager"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        
        if (!href || processedUrls.has(href)) return;
        
        // Coletar contexto do link
        const linkText = $el.text().trim();
        const parentText = $el.parent().text().trim();
        const rowText = $el.closest("tr").text().trim() || parentText;
        const fullContext = `${linkText} ${rowText}`.toLowerCase();

        // Verificar se é um áudio (não PDF, não apresentação)
        const isAudio = audioKeywords.some((kw) => fullContext.includes(kw.toLowerCase()));
        const isExcluded = excludeKeywords.some((kw) => fullContext.includes(kw.toLowerCase()));

        if (!isAudio && !isExcluded) {
          // Se não tem palavra-chave, tentar inferir pelo contexto
          if (!fullContext.includes("resultado") && !fullContext.includes("earning")) {
            return;
          }
        }

        if (isExcluded && !fullContext.includes("áudio") && !fullContext.includes("audio")) {
          return;
        }

        // Extrair trimestre e ano
        const triAno = extractTrimestreAno(fullContext) || extractTrimestreAno(rowText);
        if (!triAno) {
          console.log(`    ⚠️ Não conseguiu extrair trimestre de: ${linkText.slice(0, 50)}`);
          return;
        }

        // Determinar tipo
        const tipo = determinarTipo(fullContext);

        // Construir título
        let titulo = linkText || `${config.nome} - ${triAno.trimestre}`;
        if (!titulo.toLowerCase().includes(config.nome.toLowerCase()) && titulo.length < 30) {
          titulo = `${config.nome} - ${titulo}`;
        }

        processedUrls.add(href);

        audios.push({
          titulo,
          descricao: `Teleconferência de resultados ${triAno.trimestre} - ${config.nome}`,
          sourceUrl: href,
          sourceType: "mp3",
          dataEvento: getDataTrimestre(triAno.trimestre, triAno.ano),
          trimestre: triAno.trimestre,
          ano: triAno.ano,
          tipo,
        });

        console.log(`    ✅ ${triAno.trimestre} - ${tipo}: ${titulo.slice(0, 50)}...`);
      });

      // Também buscar links de áudio diretos (não MZ)
      $('a[href$=".mp3"], a[href$=".m4a"], a[href$=".wav"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        
        if (!href || processedUrls.has(href)) return;
        
        const linkText = $el.text().trim();
        const rowText = $el.closest("tr").text().trim() || $el.parent().text().trim();
        
        const triAno = extractTrimestreAno(`${linkText} ${rowText}`);
        if (!triAno) return;

        processedUrls.add(href);

        const titulo = linkText || `${config.nome} - ${triAno.trimestre}`;
        const tipo = determinarTipo(`${linkText} ${rowText}`);

        audios.push({
          titulo: titulo.includes(config.nome) ? titulo : `${config.nome} - ${titulo}`,
          descricao: `Teleconferência de resultados ${triAno.trimestre}`,
          sourceUrl: href.startsWith("http") ? href : new URL(href, url).toString(),
          sourceType: "mp3",
          dataEvento: getDataTrimestre(triAno.trimestre, triAno.ano),
          trimestre: triAno.trimestre,
          ano: triAno.ano,
          tipo,
        });
      });

    } catch (error) {
      console.error(`  ❌ Erro ao acessar ${url}:`, error);
    }
  }

  console.log(`📊 ${config.ticker}: ${audios.length} áudios encontrados`);
  return audios;
}

// Configurações pré-definidas para empresas AUVP11
// URLs verificadas via browser em 04/12/2025
// ITSA4 removido - usa scraper específico em scrapers/itausa.ts
export const EMPRESAS_MZ_CONFIG: Record<string, MZScraperConfig> = {
  BPAC11: {
    ticker: "BPAC11",
    nome: "BTG Pactual",
    urls: ["https://ri.btgpactual.com"],
  },
  PRIO3: {
    ticker: "PRIO3",
    nome: "PRIO",
    urls: ["https://ri.prio3.com.br/informacoes-financeiras/central-de-resultados/"],
  },
  TOTS3: {
    ticker: "TOTS3",
    nome: "TOTVS",
    urls: ["https://ri.totvs.com/informacoes-financeiras/central-de-resultados/"],
  },
  BBSE3: {
    ticker: "BBSE3",
    nome: "BB Seguridade",
    urls: ["https://www.bbseguridaderi.com.br/informacoes-ao-mercado/central-de-resultados/"],
  },
  TIMS3: {
    ticker: "TIMS3",
    nome: "TIM",
    urls: ["https://ri.tim.com.br/informacoes-ao-mercado/central-de-resultados/"],
  },
  CMIG4: {
    ticker: "CMIG4",
    nome: "CEMIG",
    urls: ["https://ri.cemig.com.br/divulgacao-e-resultados/central-de-resultados"],
  },
  // EGIE3 removido - usa scraper específico em scrapers/engie.ts
  CPFE3: {
    ticker: "CPFE3",
    nome: "CPFL Energia",
    urls: ["https://ri.cpfl.com.br/listresultados.aspx?idCanal=UBKZ7EE26ff9gbUxPlf7PA==&linguagem=pt"],
  },
  SBSP3: {
    ticker: "SBSP3",
    nome: "Sabesp",
    urls: ["https://ri.sabesp.com.br/informacoes-financeiras/central-de-resultados/"],
  },
  CMIN3: {
    ticker: "CMIN3",
    nome: "CSN Mineração",
    urls: ["https://ri.csnmineracao.com.br/informacoes-financeiras/central-de-resultados/"],
  },
  CXSE3: {
    ticker: "CXSE3",
    nome: "Caixa Seguridade",
    urls: ["https://www.ri.caixaseguridade.com.br/informacoes-financeiras/central-de-resultados/"],
  },
  CSMG3: {
    ticker: "CSMG3",
    nome: "Copasa",
    urls: ["https://ri.copasa.com.br/servicos-aos-investidores/central-de-resultados/"],
  },
  SAPR11: {
    ticker: "SAPR11",
    nome: "Sanepar",
    urls: ["https://ri.sanepar.com.br/informacoes-financeiras/central-de-resultados"],
  },
  ISAE4: {
    ticker: "ISAE4",
    nome: "ISA Energia Brasil",
    urls: ["https://ri.isaenergiabrasil.com.br/pt/informacoes-financeiras/central-de-resultados"],
  },
  CYRE3: {
    ticker: "CYRE3",
    nome: "Cyrela",
    urls: ["https://ri.cyrela.com.br/informacoes-financeiras/central-de-resultados/"],
  },
  DIRR3: {
    ticker: "DIRR3",
    nome: "Direcional",
    urls: ["https://ri.direcional.com.br/informacoes-financeiras/central-de-resultados/"],
  },
  CURY3: {
    ticker: "CURY3",
    nome: "Cury",
    urls: ["https://ri.cury.net/informacoes-aos-investidores/central-de-resultados/"],
  },
  POMO4: {
    ticker: "POMO4",
    nome: "Marcopolo",
    urls: ["https://ri.marcopolo.com.br/divulgacao-e-resultados/central-de-resultados/"],
  },
  UNIP6: {
    ticker: "UNIP6",
    nome: "Unipar",
    urls: ["https://ri.unipar.com/informacoes-aos-investidores/central-de-resultados/"],
  },
  ODPV3: {
    ticker: "ODPV3",
    nome: "OdontoPrev",
    urls: ["https://ri.odontoprev.com.br/informacoes-aos-acionistas/central-de-resultados/"],
  },
  FRAS3: {
    ticker: "FRAS3",
    nome: "Frasle Mobility",
    urls: ["https://ri.fraslemobility.com/informacoes-aos-investidores/central-de-resultados/"],
  },
  ABCB4: {
    ticker: "ABCB4",
    nome: "ABC Brasil",
    urls: ["https://ri.abcbrasil.com.br/informacoes-financeiras/central-de-resultados/"],
  },
  LEVE3: {
    ticker: "LEVE3",
    nome: "Metal Leve",
    urls: ["https://ri.mahle.com.br/informacoes-financeiras/central-de-resultados/"],
  },
  INTB3: {
    ticker: "INTB3",
    nome: "Intelbras",
    urls: ["https://ri.intelbras.com.br/informacoes-financeiras/central-de-resultados/"],
  },
};

export default scrapeMZGroup;

