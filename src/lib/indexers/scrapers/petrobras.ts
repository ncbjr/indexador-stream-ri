// Scraper específico para Petrobras (PETR4)
// Site: https://www.investidorpetrobras.com.br
// Estrutura: Tabela com links diretos para áudios MP3 via MZ Group API

import * as cheerio from "cheerio";

interface PetrobrasWebcast {
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

const PETROBRAS_BASE_URL = "https://www.investidorpetrobras.com.br";
const PETROBRAS_RESULTS_URL = "/resultados-e-comunicados/central-de-resultados/";

// Mapeamento de meses para trimestres
function getTrimestreFromMonth(month: number): number {
  return Math.ceil((month + 1) / 3);
}

// Data aproximada de divulgação de cada trimestre
function getDataDivulgacao(trimestre: number, ano: number): Date {
  // Resultados são divulgados ~45 dias após o fim do trimestre
  const mesBase = trimestre * 3 + 1; // 1T→Abr, 2T→Jul, 3T→Out, 4T→Fev
  if (trimestre === 4) {
    return new Date(ano + 1, 1, 20); // Fevereiro do ano seguinte
  }
  return new Date(ano, mesBase, 15);
}

export async function scrapePetrobras(): Promise<PetrobrasWebcast[]> {
  console.log("🔍 Iniciando scraping Petrobras...");
  const webcasts: PetrobrasWebcast[] = [];

  // Buscar anos disponíveis (2024, 2025, etc)
  const anosParaBuscar = [2025, 2024, 2023];

  for (const ano of anosParaBuscar) {
    try {
      const url = `${PETROBRAS_BASE_URL}${PETROBRAS_RESULTS_URL}`;
      console.log(`  Buscando ano ${ano}: ${url}`);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
      });

      if (!response.ok) {
        console.log(`  ❌ HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extrair trimestres dos cabeçalhos da tabela
      const trimestres: { num: number; ano: number }[] = [];
      $("table thead tr th, table tfoot tr td, table tbody tr:last-child td").each((idx, el) => {
        const text = $(el).text().trim();
        const match = text.match(/(\d)[TtQq](\d{2,4})/);
        if (match) {
          const t = parseInt(match[1]);
          let y = parseInt(match[2]);
          if (y < 100) y += 2000;
          trimestres.push({ num: t, ano: y });
        }
      });

      // Fallback se não encontrar cabeçalhos
      if (trimestres.length === 0) {
        // Tentar extrair da row do rodapé
        const footerText = $("table").text();
        const matches = footerText.matchAll(/(\d)[TtQq](\d{2,4})/g);
        for (const match of matches) {
          const t = parseInt(match[1]);
          let y = parseInt(match[2]);
          if (y < 100) y += 2000;
          if (!trimestres.find(tr => tr.num === t && tr.ano === y)) {
            trimestres.push({ num: t, ano: y });
          }
        }
      }

      console.log(`  📅 Trimestres encontrados: ${trimestres.map(t => `${t.num}T${t.ano}`).join(", ")}`);

      // Buscar links de áudio na tabela
      // A Petrobras usa uma tabela com "Áudio do Webcast" como label
      $("table tr").each((_, row) => {
        const $row = $(row);
        const firstCell = $row.find("td:first-child").text().trim().toLowerCase();

        // Verificar se é a linha de áudio do webcast
        if (firstCell.includes("áudio") || firstCell.includes("audio") || firstCell.includes("webcast")) {
          // Coletar todos os links desta linha
          $row.find("td a").each((idx, link) => {
            const $link = $(link);
            const href = $link.attr("href");
            
            // Ignorar links "#" ou vazios
            if (!href || href === "#") return;
            
            // Verificar se é um link de arquivo (mziq.com ou .mp3)
            if (href.includes("mziq.com") || href.includes(".mp3") || href.includes("mzfilemanager")) {
              // Determinar qual trimestre baseado na posição
              const trimestreInfo = trimestres[idx] || { 
                num: idx + 1, 
                ano: new Date().getFullYear() 
              };

              const trimestre = `${trimestreInfo.num}T${trimestreInfo.ano.toString().slice(-2)}`;
              const dataEvento = getDataDivulgacao(trimestreInfo.num, trimestreInfo.ano);

              webcasts.push({
                titulo: `Petrobras - Webcast Resultados ${trimestre}`,
                descricao: `Teleconferência de resultados da Petrobras referente ao ${trimestreInfo.num}º trimestre de ${trimestreInfo.ano}`,
                sourceUrl: href.startsWith("http") ? href : `${PETROBRAS_BASE_URL}${href}`,
                sourceType: "mp3",
                dataEvento,
                trimestre,
                ano: trimestreInfo.ano,
                tipo: "resultado",
              });

              console.log(`  ✅ Áudio ${trimestre}: ${href.substring(0, 60)}...`);
            }
          });
        }
      });

      // Buscar links de áudio fora da tabela também (para redundância)
      $('a[href*="mziq.com"], a[href*=".mp3"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        if (!href || href === "#") return;

        // Verificar se já não foi adicionado
        if (webcasts.find(w => w.sourceUrl === href)) return;

        // Tentar extrair trimestre do contexto
        const context = $el.closest("div, li, td, section").text();
        const match = context.match(/(\d)[TtQq](\d{2,4})/);
        
        let trimestre = getCurrentTrimestre();
        let anoAudio = new Date().getFullYear();
        
        if (match) {
          const t = parseInt(match[1]);
          let y = parseInt(match[2]);
          if (y < 100) y += 2000;
          trimestre = `${t}T${y.toString().slice(-2)}`;
          anoAudio = y;
        }

        webcasts.push({
          titulo: `Petrobras - Webcast Resultados ${trimestre}`,
          descricao: `Teleconferência de resultados da Petrobras`,
          sourceUrl: href.startsWith("http") ? href : `${PETROBRAS_BASE_URL}${href}`,
          sourceType: "mp3",
          dataEvento: getDataDivulgacao(parseInt(trimestre[0]), anoAudio),
          trimestre,
          ano: anoAudio,
          tipo: "resultado",
        });
      });

    } catch (error) {
      console.log(`  ⚠️ Erro ao buscar ano ${ano}:`, error instanceof Error ? error.message : error);
    }
  }

  // Deduplica por URL
  const unique = webcasts.filter((w, i, arr) => 
    arr.findIndex(x => x.sourceUrl === w.sourceUrl) === i
  );

  // Ordena por data (mais recente primeiro)
  unique.sort((a, b) => b.dataEvento.getTime() - a.dataEvento.getTime());

  console.log(`🎯 Petrobras: ${unique.length} webcasts únicos encontrados`);
  return unique;
}

function getCurrentTrimestre(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `${quarter}T${now.getFullYear().toString().slice(-2)}`;
}

export default scrapePetrobras;
