// Script para analisar estrutura de sites de RI
import * as cheerio from "cheerio";

const SITES_PARA_ANALISAR = [
  {
    nome: "Itaú",
    ticker: "ITUB4",
    url: "https://www.itau.com.br/relacoes-com-investidores/resultados-e-relatorios/central-de-resultados/",
  },
  {
    nome: "Petrobras",
    ticker: "PETR4",
    url: "https://www.investidorpetrobras.com.br/resultados-e-comunicados/central-de-resultados/",
  },
  {
    nome: "Vale",
    ticker: "VALE3",
    url: "https://www.vale.com/pt/investors/information-market/results-center",
  },
  {
    nome: "B3",
    ticker: "B3SA3",
    url: "https://ri.b3.com.br/pt-br/informacoes-financeiras/central-de-resultados/",
  },
];

async function analisarSite(nome: string, ticker: string, url: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔍 Analisando: ${nome} (${ticker})`);
  console.log(`   URL: ${url}`);
  console.log("=".repeat(60));

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
      return;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Analisar links de vídeo/áudio
    console.log("\n📹 Links de Vídeo/Áudio encontrados:");
    const videoLinks: string[] = [];
    
    $('a[href*="youtube"], a[href*="youtu.be"], a[href*="vimeo"], a[href*=".mp3"], a[href*=".mp4"], a[href*="webcast"], a[href*="video"]').each((i, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim().substring(0, 50);
      if (href && !videoLinks.includes(href)) {
        videoLinks.push(href);
        console.log(`   ${i + 1}. ${text || "(sem texto)"}`);
        console.log(`      URL: ${href.substring(0, 80)}${href.length > 80 ? "..." : ""}`);
      }
    });

    if (videoLinks.length === 0) {
      console.log("   Nenhum link direto de vídeo encontrado");
    }

    // Analisar iframes
    console.log("\n🖼️  Iframes encontrados:");
    $("iframe").each((i, el) => {
      const src = $(el).attr("src");
      if (src) {
        console.log(`   ${i + 1}. ${src.substring(0, 80)}${src.length > 80 ? "..." : ""}`);
      }
    });

    // Analisar links para webcasts
    console.log("\n🎙️  Links com 'webcast' ou 'resultado':");
    $('a[href*="webcast"], a[href*="resultado"], a[href*="earnings"], a[href*="conference"]').each((i, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim().substring(0, 50);
      if (href) {
        console.log(`   ${i + 1}. ${text || "(sem texto)"}`);
        console.log(`      ${href.substring(0, 80)}${href.length > 80 ? "..." : ""}`);
      }
    });

    // Analisar estrutura de cards/items
    console.log("\n📦 Estrutura de conteúdo (primeiros 5 items):");
    const containers = $("article, .card, .item, .resultado, .webcast, [class*='result'], [class*='video']");
    containers.slice(0, 5).each((i, el) => {
      const text = $(el).text().trim().substring(0, 100);
      console.log(`   ${i + 1}. ${text.replace(/\s+/g, " ")}...`);
    });

    // Analisar scripts que podem carregar conteúdo dinâmico
    console.log("\n⚙️  Scripts que podem indicar conteúdo dinâmico:");
    $("script").each((i, el) => {
      const src = $(el).attr("src") || "";
      const content = $(el).html() || "";
      
      if (src.includes("player") || src.includes("video") || src.includes("youtube")) {
        console.log(`   Script externo: ${src}`);
      }
      if (content.includes("youtube") || content.includes("video") || content.includes("webcast")) {
        console.log(`   Script inline com referência a vídeo`);
      }
    });

    // Verificar se precisa de JavaScript
    const needsJS = html.includes("__NEXT_DATA__") || 
                    html.includes("window.__INITIAL_STATE__") ||
                    html.includes("react-root") ||
                    $("noscript").length > 0;
    
    console.log(`\n⚠️  Precisa de JavaScript: ${needsJS ? "SIM (Playwright recomendado)" : "Provavelmente não"}`);

  } catch (error) {
    console.log(`❌ Erro: ${error instanceof Error ? error.message : error}`);
  }
}

async function main() {
  console.log("🚀 Iniciando análise de sites de RI...\n");
  
  // Analisar apenas o site especificado ou todos
  const siteArg = process.argv[2];
  
  if (siteArg) {
    const site = SITES_PARA_ANALISAR.find(s => s.ticker === siteArg.toUpperCase());
    if (site) {
      await analisarSite(site.nome, site.ticker, site.url);
    } else {
      console.log(`Site não encontrado: ${siteArg}`);
      console.log("Disponíveis:", SITES_PARA_ANALISAR.map(s => s.ticker).join(", "));
    }
  } else {
    for (const site of SITES_PARA_ANALISAR) {
      await analisarSite(site.nome, site.ticker, site.url);
      await new Promise(r => setTimeout(r, 1000)); // delay entre requisições
    }
  }
  
  console.log("\n\n✅ Análise concluída!");
}

main();



