// Scraper específico para Magazine Luiza (MGLU3)
// Site: https://ri.magazineluiza.com.br
// Estrutura: Central de Resultados com links diretos para áudios de teleconferência

import * as cheerio from "cheerio";

interface MagaluWebcast {
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

const MAGALU_BASE_URL = "https://ri.magazineluiza.com.br";
const MAGALU_RESULTS_URL = "/ListResultados/Central-de-Resultados?=0WX0bwP76pYcZvx+vXUnvg==&linguagem=pt";

export async function scrapeMagazineLuiza(): Promise<MagaluWebcast[]> {
  console.log("🔍 Iniciando scraping Magazine Luiza...");
  const webcasts: MagaluWebcast[] = [];

  try {
    // Primeiro, acessar a página inicial para pegar o resultado mais recente
    const homeResponse = await fetch(MAGALU_BASE_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    if (homeResponse.ok) {
      const homeHtml = await homeResponse.text();
      const $home = cheerio.load(homeHtml);

      // Procurar links de áudio na página inicial
      $home('a[href*="Audio"], a[href*="audio"]').each((_, el) => {
        const $el = $home(el);
        const href = $el.attr("href");
        const text = $el.text().trim();

        if (href && (text.toLowerCase().includes("áudio") || text.toLowerCase().includes("teleconferência"))) {
          const trimestreMatch = text.match(/(\d)[TtQq](\d{2,4})/);
          let trimestre = getCurrentTrimestre();
          let ano = new Date().getFullYear();

          if (trimestreMatch) {
            const t = parseInt(trimestreMatch[1]);
            let y = parseInt(trimestreMatch[2]);
            if (y < 100) y += 2000;
            trimestre = `${t}T${y.toString().slice(-2)}`;
            ano = y;
          }

          const sourceUrl = href.startsWith("http") ? href : `${MAGALU_BASE_URL}${href}`;

          webcasts.push({
            titulo: `Magazine Luiza - Teleconferência ${trimestre}`,
            descricao: `Áudio da teleconferência de resultados do Magazine Luiza - ${trimestre}`,
            sourceUrl,
            sourceType: "mp3",
            dataEvento: getDataDivulgacao(parseInt(trimestre[0]), ano),
            trimestre,
            ano,
            tipo: "resultado",
          });

          console.log(`  ✅ Áudio ${trimestre}: ${text}`);
        }
      });
    }

    // Depois, acessar a central de resultados para o histórico
    const resultsUrl = `${MAGALU_BASE_URL}${MAGALU_RESULTS_URL}`;
    console.log(`  Buscando histórico: ${resultsUrl}`);

    const response = await fetch(resultsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      console.log(`  ❌ HTTP ${response.status} ao buscar central de resultados`);
    } else {
      const html = await response.text();
      const $ = cheerio.load(html);

      // Procurar todos os links de áudio
      $('a').each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        const text = $el.text().trim().toLowerCase();

        if (!href) return;

        // Verificar se é um link de áudio
        if (text.includes("áudio") || text.includes("audio") || text.includes("teleconferência") || text.includes("webcast")) {
          // Extrair trimestre do texto ou URL
          const fullText = $el.text().trim() + " " + (href || "");
          const trimestreMatch = fullText.match(/(\d)[TtQq](\d{2,4})/);

          if (!trimestreMatch) return;

          const t = parseInt(trimestreMatch[1]);
          let y = parseInt(trimestreMatch[2]);
          if (y < 100) y += 2000;
          const trimestre = `${t}T${y.toString().slice(-2)}`;

          const sourceUrl = href.startsWith("http") ? href : `${MAGALU_BASE_URL}${href}`;

          // Verificar se já não foi adicionado
          if (webcasts.find(w => w.trimestre === trimestre)) return;

          webcasts.push({
            titulo: `Magazine Luiza - Teleconferência ${trimestre}`,
            descricao: `Áudio da teleconferência de resultados do Magazine Luiza - ${trimestre}`,
            sourceUrl,
            sourceType: "mp3",
            dataEvento: getDataDivulgacao(t, y),
            trimestre,
            ano: y,
            tipo: "resultado",
          });

          console.log(`  ✅ Histórico ${trimestre}`);
        }
      });

      // Também procurar por links de download que contenham "audio"
      $('a[href*="Download"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href") || "";
        
        if (href.toLowerCase().includes("audio") || href.toLowerCase().includes("teleconferencia")) {
          const trimestreMatch = href.match(/(\d)[TtQq](\d{2,4})/i);
          
          if (trimestreMatch) {
            const t = parseInt(trimestreMatch[1]);
            let y = parseInt(trimestreMatch[2]);
            if (y < 100) y += 2000;
            const trimestre = `${t}T${y.toString().slice(-2)}`;

            // Verificar se já não foi adicionado
            if (webcasts.find(w => w.trimestre === trimestre)) return;

            const sourceUrl = href.startsWith("http") ? href : `${MAGALU_BASE_URL}${href}`;

            webcasts.push({
              titulo: `Magazine Luiza - Teleconferência ${trimestre}`,
              descricao: `Áudio da teleconferência de resultados do Magazine Luiza - ${trimestre}`,
              sourceUrl,
              sourceType: "mp3",
              dataEvento: getDataDivulgacao(t, y),
              trimestre,
              ano: y,
              tipo: "resultado",
            });

            console.log(`  ✅ Download ${trimestre}`);
          }
        }
      });
    }
  } catch (error) {
    console.log(`  ⚠️ Erro:`, error instanceof Error ? error.message : error);
  }

  // Deduplica e ordena
  const unique = webcasts.filter((w, i, arr) => 
    arr.findIndex(x => x.trimestre === w.trimestre && x.ano === w.ano) === i
  );
  unique.sort((a, b) => b.dataEvento.getTime() - a.dataEvento.getTime());

  console.log(`🎯 Magazine Luiza: ${unique.length} webcasts únicos encontrados`);
  return unique;
}

function getCurrentTrimestre(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `${quarter}T${now.getFullYear().toString().slice(-2)}`;
}

function getDataDivulgacao(trimestre: number, ano: number): Date {
  // Resultados são divulgados ~45 dias após o fim do trimestre
  const mesBase = trimestre * 3 + 1;
  if (trimestre === 4) {
    return new Date(ano + 1, 1, 15); // Fevereiro do ano seguinte
  }
  return new Date(ano, mesBase, 15);
}

export default scrapeMagazineLuiza;


