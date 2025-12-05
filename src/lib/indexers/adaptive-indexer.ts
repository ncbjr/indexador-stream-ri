// Sistema de indexação adaptativo e multi-método
// Aplica TODOS os métodos disponíveis e aprende com os resultados

import { db } from "@/lib/db";
import {
  searchRIVideos,
  getChannelIdByHandle,
  extractTrimestreFromTitle,
  extractTipoFromTitle,
  type YouTubeVideo,
} from "./youtube";
import { scrapeRISite, type ScrapedAudio } from "./cheerio-scraper";
import { runScraper, EMPRESAS_COM_SCRAPER, type WebcastResult } from "./scrapers";
import { scrapeMZGroup, EMPRESAS_MZ_CONFIG } from "./scrapers/mzgroup";
import * as cheerio from "cheerio";

interface AudioResult {
  titulo: string;
  descricao?: string;
  sourceUrl: string;
  sourceType: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  duracao?: number;
  dataEvento: Date;
  trimestre: string;
  ano: number;
  tipo: string;
  metodo: string; // Qual método encontrou este áudio
  confianca: number; // 0-1, quão confiável é este resultado
}

interface MethodResult {
  metodo: string;
  audios: AudioResult[];
  sucesso: boolean;
  erro?: string;
  tempo: number;
}

interface PlatformPattern {
  nome: string;
  indicadores: string[]; // URLs, classes CSS, textos que indicam esta plataforma
  metodo: string; // Qual método usar
  confianca: number;
}

// Padrões conhecidos de plataformas
const PLATFORM_PATTERNS: PlatformPattern[] = [
  {
    nome: "MZ Group",
    indicadores: [
      "api.mziq.com",
      "mzfilemanager",
      "mziq.com",
      "categories.push",
      "central_de_resultados",
    ],
    metodo: "mzgroup",
    confianca: 0.9,
  },
  {
    nome: "YouTube",
    indicadores: [
      "youtube.com",
      "youtu.be",
      "@channel",
      "youtube.com/embed",
    ],
    metodo: "youtube",
    confianca: 0.95,
  },
  {
    nome: "Zoom",
    indicadores: ["zoom.us", "zoom.com"],
    metodo: "zoom",
    confianca: 0.8,
  },
];

// Detectar plataforma baseado em URL e conteúdo
async function detectPlatform(url: string, html?: string): Promise<PlatformPattern[]> {
  const detected: PlatformPattern[] = [];
  
  // Verificar URL
  for (const pattern of PLATFORM_PATTERNS) {
    const matches = pattern.indicadores.filter(ind => 
      url.toLowerCase().includes(ind.toLowerCase())
    );
    if (matches.length > 0) {
      detected.push({
        ...pattern,
        confianca: pattern.confianca * (matches.length / pattern.indicadores.length),
      });
    }
  }
  
  // Verificar HTML se disponível
  if (html) {
    const $ = cheerio.load(html);
    const htmlText = $.text().toLowerCase();
    
    for (const pattern of PLATFORM_PATTERNS) {
      const matches = pattern.indicadores.filter(ind => 
        htmlText.includes(ind.toLowerCase()) || 
        html.includes(ind)
      );
      if (matches.length > 0 && !detected.find(d => d.nome === pattern.nome)) {
        detected.push({
          ...pattern,
          confianca: pattern.confianca * 0.7, // Menor confiança para detecção em HTML
        });
      }
    }
  }
  
  return detected.sort((a, b) => b.confianca - a.confianca);
}

// Método 1: Scraper específico
async function trySpecificScraper(ticker: string): Promise<MethodResult> {
  const start = Date.now();
  try {
    if (!EMPRESAS_COM_SCRAPER.includes(ticker)) {
      return { metodo: "scraper-especifico", audios: [], sucesso: false, tempo: Date.now() - start };
    }
    
    const webcasts = await runScraper(ticker);
    const audios: AudioResult[] = webcasts.map(w => ({
      ...w,
      metodo: "scraper-especifico",
      confianca: 0.9,
    }));
    
    return {
      metodo: "scraper-especifico",
      audios,
      sucesso: audios.length > 0,
      tempo: Date.now() - start,
    };
  } catch (error) {
    return {
      metodo: "scraper-especifico",
      audios: [],
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      tempo: Date.now() - start,
    };
  }
}

// Método 2: YouTube API
async function tryYouTube(empresa: { youtubeChannel: string | null; ticker: string }): Promise<MethodResult> {
  const start = Date.now();
  try {
    if (!empresa.youtubeChannel) {
      return { metodo: "youtube", audios: [], sucesso: false, tempo: Date.now() - start };
    }
    
    let channelId = empresa.youtubeChannel;
    
    // Se for um handle (@), converter para channel ID
    if (channelId.startsWith("@")) {
      const resolvedId = await getChannelIdByHandle(channelId);
      if (resolvedId) {
        channelId = resolvedId;
      } else {
        throw new Error(`Não foi possível resolver handle: ${empresa.youtubeChannel}`);
      }
    }
    
    const videos = await searchRIVideos(channelId);
    const audios: AudioResult[] = videos.map((video: YouTubeVideo) => {
      const trimestreInfo = extractTrimestreFromTitle(video.title);
      return {
        titulo: video.title,
        descricao: video.description?.slice(0, 500),
        sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
        sourceType: "youtube",
        youtubeId: video.id,
        thumbnailUrl: video.thumbnailUrl,
        duracao: video.duration,
        dataEvento: new Date(video.publishedAt),
        trimestre: trimestreInfo?.trimestre || "N/A",
        ano: trimestreInfo?.ano || new Date(video.publishedAt).getFullYear(),
        tipo: extractTipoFromTitle(video.title),
        metodo: "youtube",
        confianca: 0.95,
      };
    });
    
    return {
      metodo: "youtube",
      audios,
      sucesso: audios.length > 0,
      tempo: Date.now() - start,
    };
  } catch (error) {
    return {
      metodo: "youtube",
      audios: [],
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      tempo: Date.now() - start,
    };
  }
}

// Método 3: MZ Group genérico
async function tryMZGroup(ticker: string, siteRi: string): Promise<MethodResult> {
  const start = Date.now();
  try {
    // Verificar se está configurado
    const config = EMPRESAS_MZ_CONFIG[ticker];
    if (config) {
      const audios = await scrapeMZGroup(config);
      const results: AudioResult[] = audios.map(a => ({
        ...a,
        sourceType: a.sourceType === "mp3" ? "mp3" : "external",
        metodo: "mzgroup-configurado",
        confianca: 0.85,
      }));
      
      return {
        metodo: "mzgroup-configurado",
        audios: results,
        sucesso: results.length > 0,
        tempo: Date.now() - start,
      };
    }
    
    // Tentar detectar automaticamente se é MZ Group
    const platforms = await detectPlatform(siteRi);
    const mzPattern = platforms.find(p => p.nome === "MZ Group");
    
    if (mzPattern && mzPattern.confianca > 0.5) {
      // Tentar criar config automático
      try {
        const autoConfig = {
          ticker,
          nome: ticker,
          urls: [siteRi],
        };
        const audios = await scrapeMZGroup(autoConfig);
        const results: AudioResult[] = audios.map(a => ({
          ...a,
          sourceType: a.sourceType === "mp3" ? "mp3" : "external",
          metodo: "mzgroup-auto-detectado",
          confianca: mzPattern.confianca * 0.8, // Menor confiança para auto-detecção
        }));
        
        return {
          metodo: "mzgroup-auto-detectado",
          audios: results,
          sucesso: results.length > 0,
          tempo: Date.now() - start,
        };
      } catch (error) {
        // Ignorar erro, continuar
      }
    }
    
    return { metodo: "mzgroup", audios: [], sucesso: false, tempo: Date.now() - start };
  } catch (error) {
    return {
      metodo: "mzgroup",
      audios: [],
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      tempo: Date.now() - start,
    };
  }
}

// Método 4: Scraping genérico (Cheerio)
async function tryGenericScraping(ticker: string): Promise<MethodResult> {
  const start = Date.now();
  try {
    const scrapedAudios = await scrapeRISite(ticker);
    const audios: AudioResult[] = scrapedAudios.map((audio: ScrapedAudio) => ({
      titulo: audio.titulo,
      descricao: audio.descricao,
      sourceUrl: audio.audioUrl,
      sourceType: audio.sourceType,
      dataEvento: audio.dataEvento || new Date(),
      trimestre: audio.trimestre || "N/A",
      ano: audio.ano || new Date().getFullYear(),
      tipo: "resultado",
      metodo: "scraping-generico",
      confianca: 0.6, // Menor confiança para scraping genérico
    }));
    
    return {
      metodo: "scraping-generico",
      audios,
      sucesso: audios.length > 0,
      tempo: Date.now() - start,
    };
  } catch (error) {
    return {
      metodo: "scraping-generico",
      audios: [],
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      tempo: Date.now() - start,
    };
  }
}

// Método 5: Análise de HTML para detectar links de áudio
async function tryHTMLAnalysis(siteRi: string): Promise<MethodResult> {
  const start = Date.now();
  try {
    const response = await fetch(siteRi, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    
    if (!response.ok) {
      return { metodo: "html-analysis", audios: [], sucesso: false, tempo: Date.now() - start };
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const audios: AudioResult[] = [];
    
    // Buscar links de áudio
    $('a[href*=".mp3"], a[href*=".m4a"], a[href*="audio"], a[href*="podcast"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href");
      if (!href) return;
      
      const fullUrl = href.startsWith("http") ? href : new URL(href, siteRi).toString();
      const texto = $el.text().toLowerCase();
      const contexto = $el.closest("tr, div, article").text().toLowerCase();
      
      // Verificar se é realmente um áudio
      if (texto.includes("transcrição") || texto.includes("pdf") || texto.includes("apresentação")) {
        return;
      }
      
      if (texto.includes("áudio") || texto.includes("audio") || texto.includes("teleconferência") || 
          href.includes(".mp3") || href.includes(".m4a")) {
        
        const trimestreMatch = (texto + " " + contexto).match(/(\d)[TtQq](\d{2,4})/);
        let trimestre = "N/A";
        let ano = new Date().getFullYear();
        
        if (trimestreMatch) {
          const t = parseInt(trimestreMatch[1]);
          let y = parseInt(trimestreMatch[2]);
          if (y < 100) y += 2000;
          trimestre = `${t}T${y.toString().slice(-2)}`;
          ano = y;
        }
        
        audios.push({
          titulo: $el.text().trim() || `Áudio - ${trimestre}`,
          sourceUrl: fullUrl,
          sourceType: fullUrl.includes(".mp3") ? "mp3" : fullUrl.includes(".m4a") ? "m4a" : "external",
          dataEvento: new Date(),
          trimestre,
          ano,
          tipo: "resultado",
          metodo: "html-analysis",
          confianca: 0.5,
        });
      }
    });
    
    return {
      metodo: "html-analysis",
      audios,
      sucesso: audios.length > 0,
      tempo: Date.now() - start,
    };
  } catch (error) {
    return {
      metodo: "html-analysis",
      audios: [],
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      tempo: Date.now() - start,
    };
  }
}

// Função principal: indexação multi-método adaptativa
export async function indexarEmpresaAdaptativa(empresaId: string): Promise<{
  empresaId: string;
  ticker: string;
  novosAudios: number;
  metodos: MethodResult[];
  melhorMetodo?: string;
  erros: string[];
}> {
  const empresa = await db.empresa.findUnique({
    where: { id: empresaId },
  });

  if (!empresa) {
    throw new Error(`Empresa não encontrada: ${empresaId}`);
  }

  console.log(`\n🚀 Indexação adaptativa para ${empresa.ticker} - ${empresa.nome}`);
  console.log(`📋 Aplicando TODOS os métodos disponíveis...\n`);

  const resultados: MethodResult[] = [];
  const todosAudios: AudioResult[] = [];
  const urlsUnicas = new Set<string>();

  // Executar TODOS os métodos em paralelo (quando possível)
  const promises: Promise<MethodResult>[] = [];

  // Método 1: Scraper específico
  promises.push(trySpecificScraper(empresa.ticker));

  // Método 2: YouTube (se tiver canal)
  if (empresa.youtubeChannel) {
    promises.push(tryYouTube(empresa));
  }

  // Método 3: MZ Group (sempre tentar, pode detectar automaticamente)
  if (empresa.siteRi) {
    promises.push(tryMZGroup(empresa.ticker, empresa.siteRi));
    promises.push(tryHTMLAnalysis(empresa.siteRi));
  }

  // Método 4: Scraping genérico (só se não tiver scraper específico)
  if (!EMPRESAS_COM_SCRAPER.includes(empresa.ticker) && empresa.siteRi) {
    promises.push(tryGenericScraping(empresa.ticker));
  }

  // Aguardar todos os métodos
  const methodResults = await Promise.allSettled(promises);
  
  for (const result of methodResults) {
    if (result.status === "fulfilled") {
      resultados.push(result.value);
      console.log(`  ${result.value.sucesso ? "✅" : "❌"} ${result.value.metodo}: ${result.value.audios.length} áudios (${result.value.tempo}ms)`);
      if (result.value.erro) {
        console.log(`     ⚠️ ${result.value.erro}`);
      }
    }
  }

  // Consolidar resultados: remover duplicatas e ordenar por confiança
  for (const resultado of resultados) {
    for (const audio of resultado.audios) {
      if (!urlsUnicas.has(audio.sourceUrl)) {
        urlsUnicas.add(audio.sourceUrl);
        todosAudios.push(audio);
      }
    }
  }

  // Ordenar por confiança (maior primeiro)
  todosAudios.sort((a, b) => b.confianca - a.confianca);

  // Identificar melhor método
  const metodosComSucesso = resultados.filter(r => r.sucesso);
  const melhorMetodo = metodosComSucesso.length > 0
    ? metodosComSucesso.sort((a, b) => b.audios.length - a.audios.length)[0].metodo
    : undefined;

  console.log(`\n📊 Resumo:`);
  console.log(`   Total de métodos tentados: ${resultados.length}`);
  console.log(`   Métodos com sucesso: ${metodosComSucesso.length}`);
  console.log(`   Melhor método: ${melhorMetodo || "Nenhum"}`);
  console.log(`   Total de áudios únicos encontrados: ${todosAudios.length}`);

  // Indexar no banco de dados
  let novosAudios = 0;
  const erros: string[] = [];

  if (todosAudios.length > 0) {
    try {
      for (const audio of todosAudios) {
        try {
          // Verificar se já existe
          const existe = await db.audio.findFirst({
            where: {
              empresaId: empresa.id,
              sourceUrl: audio.sourceUrl,
            },
          });

          if (!existe) {
            await db.audio.create({
              data: {
                titulo: audio.titulo,
                descricao: audio.descricao,
                sourceUrl: audio.sourceUrl,
                sourceType: audio.sourceType,
                youtubeId: audio.youtubeId,
                thumbnailUrl: audio.thumbnailUrl,
                duracao: audio.duracao,
                dataEvento: audio.dataEvento,
                trimestre: audio.trimestre,
                ano: audio.ano,
                tipo: audio.tipo,
                empresaId: empresa.id,
              },
            });
            novosAudios++;
          }
        } catch (error) {
          erros.push(`Erro ao indexar áudio: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
      }
    } catch (error) {
      erros.push(`Erro geral ao indexar: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  }

  // Salvar conhecimento sobre qual método funcionou melhor
  if (melhorMetodo) {
    // Poderia salvar em uma tabela de "conhecimento" para futuras indexações
    // Por enquanto, apenas log
    console.log(`💡 Conhecimento: ${empresa.ticker} funciona melhor com ${melhorMetodo}`);
  }

  return {
    empresaId: empresa.id,
    ticker: empresa.ticker,
    novosAudios,
    metodos: resultados,
    melhorMetodo,
    erros,
  };
}

