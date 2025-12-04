// Indexador principal - orquestra todas as fontes de dados

import { db } from "@/lib/db";
import {
  searchRIVideos,
  getChannelIdByHandle,
  extractTrimestreFromTitle,
  extractTipoFromTitle,
  type YouTubeVideo,
} from "./youtube";
import { scrapeRISite, type ScrapedAudio } from "./cheerio-scraper";

interface IndexingResult {
  empresaId: string;
  ticker: string;
  fonte: string;
  novosAudios: number;
  erros: string[];
}

// Indexar uma empresa específica
export async function indexarEmpresa(empresaId: string): Promise<IndexingResult> {
  const empresa = await db.empresa.findUnique({
    where: { id: empresaId },
  });

  if (!empresa) {
    throw new Error(`Empresa não encontrada: ${empresaId}`);
  }

  const result: IndexingResult = {
    empresaId,
    ticker: empresa.ticker,
    fonte: empresa.fonte,
    novosAudios: 0,
    erros: [],
  };

  try {
    let audiosParaIndexar: Array<{
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
    }> = [];

    // Tentar YouTube primeiro
    if (empresa.youtubeChannel) {
      try {
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
        audiosParaIndexar = videos.map((video: YouTubeVideo) => {
          const trimestreInfo = extractTrimestreFromTitle(video.title);
          return {
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
            tipo: extractTipoFromTitle(video.title),
          };
        });

        result.fonte = "youtube";
      } catch (error) {
        result.erros.push(`YouTube: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      }
    }

    // Se não encontrou no YouTube ou não tem canal, tentar scraping
    if (audiosParaIndexar.length === 0 && empresa.siteRi) {
      try {
        const scrapedAudios = await scrapeRISite(empresa.ticker);
        audiosParaIndexar = scrapedAudios.map((audio: ScrapedAudio) => ({
          titulo: audio.titulo,
          descricao: audio.descricao,
          sourceUrl: audio.audioUrl,
          sourceType: audio.sourceType,
          dataEvento: audio.dataEvento || new Date(),
          trimestre: audio.trimestre || "N/A",
          ano: audio.ano || new Date().getFullYear(),
          tipo: "resultado",
        }));

        result.fonte = "scraping";
      } catch (error) {
        result.erros.push(`Scraping: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      }
    }

    // Salvar novos áudios no banco
    for (const audio of audiosParaIndexar) {
      // Verificar se já existe
      const existing = await db.audio.findFirst({
        where: {
          OR: [
            { sourceUrl: audio.sourceUrl },
            ...(audio.youtubeId ? [{ youtubeId: audio.youtubeId }] : []),
          ],
        },
      });

      if (!existing) {
        await db.audio.create({
          data: {
            ...audio,
            empresaId,
          },
        });
        result.novosAudios++;
      }
    }

    // Registrar log de indexação
    await db.indexingLog.create({
      data: {
        empresaId,
        fonte: result.fonte,
        status: result.erros.length > 0 ? "partial" : "success",
        mensagem:
          result.erros.length > 0
            ? result.erros.join("; ")
            : `${result.novosAudios} novos áudios indexados`,
      },
    });
  } catch (error) {
    result.erros.push(error instanceof Error ? error.message : "Erro desconhecido");

    await db.indexingLog.create({
      data: {
        empresaId,
        fonte: result.fonte,
        status: "error",
        mensagem: result.erros.join("; "),
      },
    });
  }

  return result;
}

// Indexar todas as empresas
export async function indexarTodasEmpresas(): Promise<IndexingResult[]> {
  const empresas = await db.empresa.findMany();
  const results: IndexingResult[] = [];

  for (const empresa of empresas) {
    const result = await indexarEmpresa(empresa.id);
    results.push(result);
    
    // Pequeno delay entre empresas para não sobrecarregar APIs
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

export type { IndexingResult };

