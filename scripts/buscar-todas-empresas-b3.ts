// Script para buscar TODAS as empresas listadas na B3 e adicionar ao banco
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface EmpresaAPI {
  ticker: string;
  nome: string;
  setor?: string;
  subsetor?: string;
  siteRi?: string;
}

async function buscarEmpresasDaAPI(): Promise<EmpresaAPI[]> {
  console.log("🔍 Buscando empresas da API Dados de Mercado...");
  
  try {
    const response = await fetch("https://api.dadosdemercado.com.br/acoes");
    
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${data.length || 0} empresas encontradas na API`);
    
    return data.map((item: any) => ({
      ticker: item.ticker || item.codigo,
      nome: item.nome || item.empresa,
      setor: item.setor,
      subsetor: item.subsetor,
    }));
  } catch (error) {
    console.error("❌ Erro ao buscar da API:", error);
    console.log("⚠️  Tentando método alternativo...");
    return [];
  }
}

async function buscarSiteRI(ticker: string, nome: string): Promise<string | null> {
  // Padrões comuns de URLs de RI
  const padroes = [
    `https://ri.${nome.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com.br`,
    `https://www.${nome.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com.br/ri`,
    `https://investidores.${nome.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com.br`,
  ];
  
  // Por enquanto, retornar null - será preenchido manualmente ou via scraping
  return null;
}

async function processarEmpresas(empresasAPI: EmpresaAPI[]) {
  console.log(`\n📊 Processando ${empresasAPI.length} empresas...`);
  
  let criadas = 0;
  let atualizadas = 0;
  let ignoradas = 0;
  
  for (const empresaAPI of empresasAPI) {
    if (!empresaAPI.ticker || !empresaAPI.nome) {
      ignoradas++;
      continue;
    }
    
    // Normalizar ticker (maiúsculas, remover espaços)
    const ticker = empresaAPI.ticker.toUpperCase().trim();
    
    // Verificar se já existe
    const existente = await prisma.empresa.findUnique({
      where: { ticker },
    });
    
    if (existente) {
      // Atualizar se necessário
      await prisma.empresa.update({
        where: { ticker },
        data: {
          nome: empresaAPI.nome,
          setor: empresaAPI.setor || existente.setor || "Não especificado",
        },
      });
      atualizadas++;
    } else {
      // Criar nova empresa
      const siteRi = await buscarSiteRI(ticker, empresaAPI.nome);
      
      await prisma.empresa.create({
        data: {
          ticker,
          nome: empresaAPI.nome,
          setor: empresaAPI.setor || "Não especificado",
          siteRi: siteRi || `https://www.google.com/search?q=${encodeURIComponent(empresaAPI.nome + " relações com investidores")}`,
          youtubeChannel: null,
          logoUrl: null,
          fonte: "scraping",
        },
      });
      criadas++;
    }
    
    // Log de progresso a cada 50 empresas
    if ((criadas + atualizadas) % 50 === 0) {
      console.log(`   Processadas: ${criadas + atualizadas}/${empresasAPI.length}`);
    }
  }
  
  console.log(`\n✅ Processamento concluído!`);
  console.log(`   ✅ ${criadas} empresas criadas`);
  console.log(`   ⏭️  ${atualizadas} empresas atualizadas`);
  console.log(`   ⏭️  ${ignoradas} empresas ignoradas (dados inválidos)`);
}

async function main() {
  try {
    console.log("🚀 Iniciando busca de TODAS as empresas da B3\n");
    
    // 1. Buscar empresas da API
    const empresasAPI = await buscarEmpresasDaAPI();
    
    if (empresasAPI.length === 0) {
      console.log("\n⚠️  Não foi possível buscar empresas da API.");
      console.log("💡 Usando lista expandida manual...");
      
      // Lista expandida manual (vou adicionar mais empresas conhecidas)
      const empresasManuais = await import("../prisma/seed-expandido");
      await processarEmpresas(empresasManuais.default || empresasManuais.empresas || []);
      return;
    }
    
    // 2. Processar empresas
    await processarEmpresas(empresasAPI);
    
    // 3. Relatório final
    const total = await prisma.empresa.count();
    console.log(`\n📊 Total de empresas no banco: ${total}`);
    
  } catch (error) {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

