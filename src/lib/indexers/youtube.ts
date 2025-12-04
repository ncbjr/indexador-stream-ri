// YouTube Data API v3 Indexer
// Documentação: https://developers.google.com/youtube/v3

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: number; // em segundos
  channelId: string;
}

interface YouTubeSearchResult {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Keywords para buscar webcasts de RI
const RI_KEYWORDS = [
  "resultado trimestral",
  "earnings call",
  "webcast resultado",
  "teleconferência resultado",
  "conference call",
  "investor day",
  "relações com investidores",
];

export async function searchChannelVideos(
  channelId: string,
  query?: string,
  maxResults = 50
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY não configurada");
    return [];
  }

  try {
    // Primeiro, buscar vídeos do canal
    const searchParams = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      channelId,
      part: "snippet",
      type: "video",
      order: "date",
      maxResults: maxResults.toString(),
      ...(query && { q: query }),
    });

    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?${searchParams}`
    );
    
    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    const videoIds = searchData.items
      ?.map((item: { id?: { videoId?: string } }) => item.id?.videoId)
      .filter(Boolean)
      .join(",");

    if (!videoIds) return [];

    // Buscar detalhes dos vídeos (incluindo duração)
    const detailsParams = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      id: videoIds,
      part: "snippet,contentDetails",
    });

    const detailsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?${detailsParams}`
    );
    
    if (!detailsResponse.ok) {
      throw new Error(`YouTube API error: ${detailsResponse.statusText}`);
    }

    const detailsData = await detailsResponse.json();

    return detailsData.items?.map((item: {
      id: string;
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
        channelId: string;
      };
      contentDetails: { duration: string };
    }) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        "",
      duration: parseDuration(item.contentDetails.duration),
      channelId: item.snippet.channelId,
    })) ?? [];
  } catch (error) {
    console.error("Erro ao buscar vídeos do YouTube:", error);
    return [];
  }
}

export async function getChannelIdByHandle(handle: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY não configurada");
    return null;
  }

  try {
    // Remover @ se presente
    const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;

    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      forHandle: cleanHandle,
      part: "id",
    });

    const response = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items?.[0]?.id || null;
  } catch (error) {
    console.error("Erro ao buscar channel ID:", error);
    return null;
  }
}

export async function searchRIVideos(channelId: string): Promise<YouTubeVideo[]> {
  const allVideos: YouTubeVideo[] = [];

  // Buscar vídeos com cada keyword de RI
  for (const keyword of RI_KEYWORDS) {
    const videos = await searchChannelVideos(channelId, keyword, 10);
    allVideos.push(...videos);
  }

  // Remover duplicatas
  const uniqueVideos = Array.from(
    new Map(allVideos.map((v) => [v.id, v])).values()
  );

  // Filtrar apenas vídeos longos (provavelmente webcasts)
  return uniqueVideos.filter((v) => v.duration > 600); // Maior que 10 minutos
}

// Parsear duração ISO 8601 para segundos
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

// Extrair trimestre do título do vídeo
export function extractTrimestreFromTitle(title: string): {
  trimestre: string;
  ano: number;
} | null {
  // Padrões comuns: "1T24", "1T2024", "Q1 2024", "1º Trimestre 2024"
  const patterns = [
    /(\d)T(\d{2})(?!\d)/i, // 1T24
    /(\d)T(\d{4})/i, // 1T2024
    /Q(\d)\s*(\d{4})/i, // Q1 2024
    /(\d)[ºo]?\s*(?:trimestre|trim)\s*(?:de\s*)?(\d{4})/i, // 1º Trimestre 2024
    /(\d{4})\s*[–-]\s*(\d)[ºo]?\s*(?:trimestre|trim)/i, // 2024 - 1º Trimestre
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      let trimestre: number;
      let ano: number;

      if (pattern === patterns[4]) {
        // Padrão invertido (ano primeiro)
        ano = parseInt(match[1], 10);
        trimestre = parseInt(match[2], 10);
      } else {
        trimestre = parseInt(match[1], 10);
        ano = parseInt(match[2], 10);
        if (ano < 100) ano += 2000; // Converter 24 para 2024
      }

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

// Determinar tipo de evento pelo título
export function extractTipoFromTitle(title: string): string {
  const titleLower = title.toLowerCase();

  if (
    titleLower.includes("investor day") ||
    titleLower.includes("dia do investidor")
  ) {
    return "investor_day";
  }
  if (
    titleLower.includes("guidance") ||
    titleLower.includes("projeção") ||
    titleLower.includes("perspectiva")
  ) {
    return "guidance";
  }
  if (
    titleLower.includes("resultado") ||
    titleLower.includes("earnings") ||
    titleLower.includes("trimestral") ||
    titleLower.includes("conference call")
  ) {
    return "resultado";
  }

  return "evento";
}

export type { YouTubeVideo, YouTubeSearchResult };

