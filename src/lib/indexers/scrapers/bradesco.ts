// Scraper específico para Bradesco (BBDC4)
// Site: https://www.bradescori.com.br
// Os podcasts de resultados estão na página de Mídia

import * as cheerio from "cheerio";

interface BradescoWebcast {
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

const BRADESCO_BASE_URL = "https://www.bradescori.com.br";

// Página de Mídia contém os Podcasts de Resultados em MP3
const BRADESCO_MIDIA_URL = "/o-bradesco/midia/";

export async function scrapeBradesco(): Promise<BradescoWebcast[]> {
  console.log("🔍 Iniciando scraping Bradesco...");
  const webcasts: BradescoWebcast[] = [];

  try {
    const url = `${BRADESCO_BASE_URL}${BRADESCO_MIDIA_URL}`;
    console.log(`  📄 Acessando página de Mídia: ${url}`);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.log(`  ❌ HTTP ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Buscar todos os itens de mídia
    // Estrutura: link com api.mziq.com, seguido de parágrafo com descrição e data
    const items: Array<{url: string, titulo: string, descricao: string, data: string, categoria: string}> = [];
    
    // A página tem categorias como "Podcast", "Notícias", "Vídeos"
    // Os podcasts de resultados têm URLs api.mziq.com e são MP3
    $('a[href*="api.mziq.com"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href");
      if (!href) return;

      const titulo = $el.text().trim();
      
      // Pegar descrição e data do contexto
      const $parent = $el.parent();
      const descricao = $parent.find("p").first().text().trim();
      
      // Procurar data no texto próximo (formato DD/MM/YYYY)
      const parentText = $parent.parent().text();
      const dataMatch = parentText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      const data = dataMatch ? `${dataMatch[1]}/${dataMatch[2]}/${dataMatch[3]}` : "";
      
      // Detectar categoria pelo texto anterior
      const prevText = $parent.prev().text().trim().toLowerCase();
      let categoria = "outro";
      if (prevText.includes("podcast") || titulo.toLowerCase().includes("podcast") || 
          titulo.toLowerCase().includes("resultado")) {
        categoria = "podcast";
      } else if (prevText.includes("vídeo")) {
        categoria = "video";
      }

      items.push({ url: href, titulo, descricao, data, categoria });
    });

    console.log(`  📊 Encontrados ${items.length} itens de mídia`);

    // Filtrar apenas podcasts de resultados (são MP3s válidos)
    const podcasts = items.filter(item => 
      item.categoria === "podcast" || 
      item.titulo.toLowerCase().includes("resultado") ||
      item.titulo.toLowerCase().includes("podcast")
    );

    console.log(`  🎙️ ${podcasts.length} podcasts de resultados encontrados`);

    for (const podcast of podcasts) {
      // Extrair trimestre do título (ex: "Resultados 4T24" ou "4T24")
      const trimestreMatch = podcast.titulo.match(/(\d)[TtQq](\d{2,4})/);
      let trimestre = getCurrentTrimestre();
      let ano = new Date().getFullYear();
      let dataEvento = new Date();

      if (trimestreMatch) {
        const t = parseInt(trimestreMatch[1]);
        let y = parseInt(trimestreMatch[2]);
        if (y < 100) y += 2000;
        trimestre = `${t}T${y.toString().slice(-2)}`;
        ano = y;
        // Estimar data do evento baseado no trimestre
        const mes = (t * 3) + 1; // Próximo mês após fim do trimestre
        dataEvento = new Date(y, mes - 1, 1);
      }

      // Se tiver data explícita, usar ela
      if (podcast.data) {
        const parsed = parseDate(podcast.data);
        if (parsed) dataEvento = parsed;
      }

      webcasts.push({
        titulo: `Bradesco ${trimestre} - ${podcast.titulo}`,
        descricao: podcast.descricao,
        sourceUrl: podcast.url,
        sourceType: "mp3", // Os podcasts do Bradesco são audio/mpeg
        dataEvento,
        trimestre,
        ano,
        tipo: "resultado",
      });

      console.log(`  ✅ ${podcast.titulo}`);
    }

  } catch (error) {
    console.log(`  ⚠️ Erro:`, error instanceof Error ? error.message : error);
  }

  // Deduplica e ordena
  const unique = webcasts.filter((w, i, arr) => 
    arr.findIndex(x => x.sourceUrl === w.sourceUrl) === i
  );
  unique.sort((a, b) => b.dataEvento.getTime() - a.dataEvento.getTime());

  console.log(`🎯 Bradesco: ${unique.length} webcasts únicos`);
  return unique;
}

function parseDate(str: string): Date | null {
  const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function getCurrentTrimestre(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `${quarter}T${now.getFullYear().toString().slice(-2)}`;
}

export default scrapeBradesco;
