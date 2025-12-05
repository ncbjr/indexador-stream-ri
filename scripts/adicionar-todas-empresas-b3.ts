// Script para adicionar TODAS as empresas listadas na B3 ao banco
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface EmpresaAPI {
  ticker: string;
  nome: string;
  setor?: string;
  subsetor?: string;
}

async function buscarEmpresasInfoMoney(): Promise<EmpresaAPI[]> {
  console.log("🔍 Buscando empresas da API Dados de Mercado...");
  
  try {
    // Tentar buscar da API do Dados de Mercado com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
    
    const response = await fetch("https://api.dadosdemercado.com.br/acoes", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      // Verificar Content-Type antes de fazer parse
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.log(`⚠️  API retornou HTML ao invés de JSON. Status: ${response.status}`);
        console.log(`   Primeiros caracteres: ${text.substring(0, 100)}...`);
        return [];
      }
      
      try {
        const data = await response.json();
        console.log(`✅ ${data.length || 0} empresas encontradas na API`);
        
        return (Array.isArray(data) ? data : []).map((item: any) => ({
          ticker: (item.ticker || item.codigo || item.symbol || "").toUpperCase().trim(),
          nome: item.nome || item.empresa || item.name || "",
          setor: item.setor || item.sector || null,
          subsetor: item.subsetor || item.subsector || null,
        })).filter((e: EmpresaAPI) => e.ticker && e.nome);
      } catch (jsonError) {
        console.log(`⚠️  Erro ao fazer parse do JSON: ${jsonError instanceof Error ? jsonError.message : "Erro desconhecido"}`);
        return [];
      }
    } else {
      console.log(`⚠️  API retornou status ${response.status}`);
      const text = await response.text().catch(() => "");
      if (text) {
        console.log(`   Resposta: ${text.substring(0, 200)}...`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.log("⚠️  Timeout ao buscar da API (10s)");
      } else {
        console.log(`⚠️  Erro ao buscar da API: ${error.message}`);
      }
    } else {
      console.log("⚠️  Erro desconhecido ao buscar da API");
    }
  }
  
  return [];
}

// Lista alternativa de empresas conhecidas da B3 (quando API não funciona)
function obterEmpresasAlternativas(): EmpresaAPI[] {
  console.log("📋 Usando lista alternativa de empresas conhecidas...");
  
  // Lista expandida de empresas conhecidas da B3
  const empresasConhecidas = [
    // Bancos adicionais
    { ticker: "SANB11", nome: "Santander Brasil", setor: "Bancos" },
    { ticker: "NUBR33", nome: "Nu Holdings", setor: "Bancos" },
    { ticker: "BRSR6", nome: "Banrisul", setor: "Bancos" },
    { ticker: "BIDI11", nome: "Banco Inter", setor: "Bancos" },
    { ticker: "BMEB4", nome: "Banco Mercantil", setor: "Bancos" },
    
    // Petróleo e Gás
    { ticker: "3R11", nome: "3R Petroleum", setor: "Petróleo e Gás" },
    { ticker: "RECV3", nome: "Petroreconcavo", setor: "Petróleo e Gás" },
    { ticker: "UGPA3", nome: "Ultrapar", setor: "Petróleo e Gás" },
    
    // Mineração/Siderurgia
    { ticker: "CSNA3", nome: "CSN", setor: "Siderurgia" },
    { ticker: "GGBR4", nome: "Gerdau", setor: "Siderurgia" },
    { ticker: "USIM5", nome: "Usiminas", setor: "Siderurgia" },
    { ticker: "KLBN11", nome: "Klabin", setor: "Papel e Celulose" },
    { ticker: "SUZB3", nome: "Suzano", setor: "Papel e Celulose" },
    
    // Energia
    { ticker: "ELET3", nome: "Eletrobras", setor: "Energia Elétrica" },
    { ticker: "ELET6", nome: "Eletrobras", setor: "Energia Elétrica" },
    { ticker: "AESB3", nome: "AES Brasil", setor: "Energia Elétrica" },
    { ticker: "TAEE11", nome: "Taesa", setor: "Energia Elétrica" },
    { ticker: "TRPL4", nome: "Transmissora Paulista", setor: "Energia Elétrica" },
    
    // Telecom
    { ticker: "VIVT3", nome: "Telefônica Brasil", setor: "Telecomunicações" },
    { ticker: "OIBR3", nome: "Oi", setor: "Telecomunicações" },
    
    // Varejo
    { ticker: "VVAR3", nome: "Via", setor: "Varejo" },
    { ticker: "LIGT3", nome: "Lojas Renner", setor: "Varejo" },
    { ticker: "AMER3", nome: "Americanas", setor: "Varejo" },
    { ticker: "BHIA3", nome: "Casas Bahia", setor: "Varejo" },
    { ticker: "RADL3", nome: "Raia Drogasil", setor: "Varejo Farmacêutico" },
    { ticker: "PCAR3", nome: "GPA", setor: "Varejo" },
    
    // Alimentos
    { ticker: "JBSS3", nome: "JBS", setor: "Alimentos" },
    { ticker: "MRFG3", nome: "Marfrig", setor: "Alimentos" },
    { ticker: "BRFS3", nome: "BRF", setor: "Alimentos" },
    { ticker: "MDIA3", nome: "M. Dias Branco", setor: "Alimentos" },
    
    // Tecnologia
    { ticker: "LWSA3", nome: "Locaweb", setor: "Tecnologia" },
    { ticker: "CIEL3", nome: "Cielo", setor: "Meios de Pagamento" },
    { ticker: "STOC31", nome: "Stone", setor: "Meios de Pagamento" },
    { ticker: "PAGS34", nome: "PagSeguro", setor: "Meios de Pagamento" },
    
    // Construção
    { ticker: "EZTC3", nome: "EZTEC", setor: "Construção Civil" },
    { ticker: "JHSF3", nome: "JHSF", setor: "Construção Civil" },
    { ticker: "MRVE3", nome: "MRV", setor: "Construção Civil" },
    { ticker: "TEND3", nome: "Tenda", setor: "Construção Civil" },
    
    // Seguros
    { ticker: "PSSA3", nome: "Porto Seguro", setor: "Seguros" },
    { ticker: "SULA11", nome: "SulAmérica", setor: "Seguros" },
    { ticker: "IRBR3", nome: "IRB Brasil", setor: "Seguros" },
    
    // Logística
    { ticker: "RAIL3", nome: "Rumo", setor: "Logística" },
    
    // Aeronáutica
    { ticker: "EMBR3", nome: "Embraer", setor: "Aeronáutica" },
    
    // Químicos
    { ticker: "BRKM5", nome: "Braskem", setor: "Químicos" },
    { ticker: "DTEX3", nome: "Duratex", setor: "Químicos" },
    
    // Bens Industriais
    { ticker: "RAPT4", nome: "Randon", setor: "Bens Industriais" },
    { ticker: "TUPY3", nome: "Tupy", setor: "Bens Industriais" },
    { ticker: "MYPK3", nome: "Iochpe-Maxion", setor: "Bens Industriais" },
    
    // Holdings
    { ticker: "BRAP4", nome: "Bradespar", setor: "Holdings" },
    { ticker: "IGTA3", nome: "Iguatemi", setor: "Holdings" },
    
    // Saúde
    { ticker: "RDOR3", nome: "Rede D'Or", setor: "Saúde" },
    { ticker: "QUAL3", nome: "Qualicorp", setor: "Saúde" },
    { ticker: "HAPV3", nome: "Hapvida", setor: "Saúde" },
  ];
  
  return empresasConhecidas.map(e => ({
    ticker: e.ticker,
    nome: e.nome,
    setor: e.setor,
  }));
}

async function gerarSiteRI(ticker: string, nome: string): Promise<string> {
  // Normalizar nome para URL
  const nomeNormalizado = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "") // Remove espaços
    .replace(/^(banco|banco do|banco de|banco nacional|banco regional|banco cooperativo|banco múltiplo)/i, "")
    .trim();
  
  // Padrões comuns
  const padroes = [
    `https://ri.${nomeNormalizado}.com.br`,
    `https://www.${nomeNormalizado}.com.br/ri`,
    `https://investidores.${nomeNormalizado}.com.br`,
    `https://ri.${nomeNormalizado}.com`,
  ];
  
  // Por enquanto, retornar URL genérica que será atualizada depois
  return `https://www.google.com/search?q=${encodeURIComponent(nome + " relações com investidores site:ri")}`;
}

async function processarEmpresas(empresasAPI: EmpresaAPI[]) {
  console.log(`\n📊 Processando ${empresasAPI.length} empresas...\n`);
  
  let criadas = 0;
  let atualizadas = 0;
  let ignoradas = 0;
  let erros = 0;
  
  const batchSize = 100;
  
  for (let i = 0; i < empresasAPI.length; i += batchSize) {
    const batch = empresasAPI.slice(i, i + batchSize);
    
    for (const empresaAPI of batch) {
      try {
        if (!empresaAPI.ticker || !empresaAPI.nome) {
          ignoradas++;
          continue;
        }
        
        // Normalizar ticker
        const ticker = empresaAPI.ticker.toUpperCase().trim();
        
        // Validar formato de ticker (ex: PETR4, VALE3, etc)
        if (!/^[A-Z]{4}\d{1,2}$/.test(ticker)) {
          ignoradas++;
          continue;
        }
        
        // Verificar se já existe
        const existente = await prisma.empresa.findUnique({
          where: { ticker },
        });
        
        if (existente) {
          // Atualizar dados se necessário
          const dadosAtualizados: any = {};
          
          if (empresaAPI.nome && empresaAPI.nome !== existente.nome) {
            dadosAtualizados.nome = empresaAPI.nome;
          }
          
          if (empresaAPI.setor && empresaAPI.setor !== existente.setor) {
            dadosAtualizados.setor = empresaAPI.setor;
          }
          
          if (Object.keys(dadosAtualizados).length > 0) {
            await prisma.empresa.update({
              where: { ticker },
              data: dadosAtualizados,
            });
            atualizadas++;
          }
        } else {
          // Criar nova empresa
          const siteRi = await gerarSiteRI(ticker, empresaAPI.nome);
          
          await prisma.empresa.create({
            data: {
              ticker,
              nome: empresaAPI.nome,
              setor: empresaAPI.setor || "Não especificado",
              siteRi,
              youtubeChannel: null,
              logoUrl: null,
              fonte: "scraping",
            },
          });
          criadas++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar ${empresaAPI.ticker}:`, error instanceof Error ? error.message : "Erro desconhecido");
        erros++;
      }
    }
    
    // Log de progresso
    const processadas = Math.min(i + batchSize, empresasAPI.length);
    console.log(`   📊 Progresso: ${processadas}/${empresasAPI.length} (${((processadas / empresasAPI.length) * 100).toFixed(1)}%)`);
  }
  
  console.log(`\n✅ Processamento concluído!`);
  console.log(`   ✅ ${criadas} empresas criadas`);
  console.log(`   ⏭️  ${atualizadas} empresas atualizadas`);
  console.log(`   ⏭️  ${ignoradas} empresas ignoradas (dados inválidos)`);
  if (erros > 0) {
    console.log(`   ❌ ${erros} erros durante processamento`);
  }
}

async function main() {
  try {
    console.log("🚀 Iniciando busca de TODAS as empresas da B3\n");
    console.log("=".repeat(60));
    
    // 1. Buscar empresas da API
    let empresasAPI = await buscarEmpresasInfoMoney();
    
    // Se API falhar, usar lista alternativa
    if (empresasAPI.length === 0) {
      console.log("\n⚠️  Não foi possível buscar empresas da API.");
      console.log("💡 Usando lista alternativa de empresas conhecidas...\n");
      empresasAPI = obterEmpresasAlternativas();
      
      if (empresasAPI.length === 0) {
        console.log("❌ Nenhuma empresa encontrada. Abortando.");
        process.exit(1);
      }
    }
    
    console.log(`\n📋 ${empresasAPI.length} empresas encontradas para processar`);
    
    // 2. Processar empresas
    await processarEmpresas(empresasAPI);
    
    // 3. Relatório final
    const total = await prisma.empresa.count();
    const empresasComSiteRi = await prisma.empresa.count({
      where: {
        siteRi: {
          not: {
            contains: "google.com/search",
          },
        },
      },
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("📊 RELATÓRIO FINAL");
    console.log("=".repeat(60));
    console.log(`\n📈 Total de empresas no banco: ${total}`);
    console.log(`🌐 Empresas com site RI configurado: ${empresasComSiteRi}`);
    console.log(`🔍 Empresas com site RI genérico: ${total - empresasComSiteRi}`);
    console.log("\n💡 Próximos passos:");
    console.log("   1. Execute: npm run db:seed (para atualizar empresas existentes)");
    console.log("   2. Execute: npx tsx scripts/indexar-tudo.ts (para indexar áudios)");
    console.log("   3. Configure sites RI manualmente para empresas com URL genérica");
    console.log("=".repeat(60) + "\n");
    
  } catch (error) {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

