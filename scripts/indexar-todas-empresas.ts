// Script para limpar, fazer seed e indexar todas as empresas com todos os métodos
import { PrismaClient } from "@prisma/client";
import { indexarEmpresaAdaptativa } from "../src/lib/indexers/adaptive-indexer";

const prisma = new PrismaClient();

async function limparAudiosAntigos() {
  console.log("🧹 Limpando áudios antigos...");
  
  const count = await prisma.audio.count();
  console.log(`   📊 Total de áudios antes: ${count}`);
  
  // Opção 1: Limpar todos os áudios
  // await prisma.audio.deleteMany({});
  
  // Opção 2: Limpar apenas áudios duplicados ou inválidos
  // Por enquanto, vamos manter os áudios existentes
  
  console.log("   ✅ Limpeza concluída (mantendo áudios existentes)");
}

async function executarSeed() {
  console.log("\n🌱 Executando seed do banco de dados...");
  
  // Importar e executar seed diretamente
  try {
    const { execSync } = require("child_process");
    execSync("npm run db:seed", { 
      stdio: "inherit",
      cwd: process.cwd(),
    });
    console.log("   ✅ Seed executado com sucesso");
  } catch (error) {
    console.error("   ❌ Erro ao executar seed:", error);
    throw error;
  }
}

async function indexarTodasEmpresas() {
  console.log("\n🚀 Iniciando indexação adaptativa de TODAS as empresas...");
  console.log("📋 Aplicando TODOS os métodos disponíveis para cada empresa\n");

  const empresas = await prisma.empresa.findMany({
    orderBy: { ticker: "asc" },
  });

  console.log(`📊 Total de empresas para indexar: ${empresas.length}\n`);

  const resultados: Array<{
    ticker: string;
    nome: string;
    novosAudios: number;
    melhorMetodo?: string;
    metodosTentados: number;
    metodosComSucesso: number;
    erros: string[];
  }> = [];

  let totalNovosAudios = 0;
  let empresasComSucesso = 0;
  let empresasSemSucesso = 0;

  for (let i = 0; i < empresas.length; i++) {
    const empresa = empresas[i];
    const progresso = `[${i + 1}/${empresas.length}]`;
    
    console.log(`\n${"=".repeat(80)}`);
    console.log(`${progresso} 🏢 ${empresa.ticker} - ${empresa.nome}`);
    console.log("=".repeat(80));

    try {
      const resultado = await indexarEmpresaAdaptativa(empresa.id);
      
      resultados.push({
        ticker: empresa.ticker,
        nome: empresa.nome,
        novosAudios: resultado.novosAudios,
        melhorMetodo: resultado.melhorMetodo,
        metodosTentados: resultado.metodos.length,
        metodosComSucesso: resultado.metodos.filter(m => m.sucesso).length,
        erros: resultado.erros,
      });

      totalNovosAudios += resultado.novosAudios;
      
      if (resultado.novosAudios > 0) {
        empresasComSucesso++;
        console.log(`\n✅ ${empresa.ticker}: ${resultado.novosAudios} novos áudios indexados`);
        console.log(`   Melhor método: ${resultado.melhorMetodo || "N/A"}`);
      } else {
        empresasSemSucesso++;
        console.log(`\n⚠️  ${empresa.ticker}: Nenhum áudio encontrado`);
        console.log(`   Métodos tentados: ${resultado.metodos.length}`);
        console.log(`   Métodos com sucesso: ${resultado.metodos.filter(m => m.sucesso).length}`);
      }

      // Delay entre empresas para não sobrecarregar APIs
      if (i < empresas.length - 1) {
        console.log(`\n⏳ Aguardando 3 segundos antes da próxima empresa...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`\n❌ Erro ao indexar ${empresa.ticker}:`, error);
      resultados.push({
        ticker: empresa.ticker,
        nome: empresa.nome,
        novosAudios: 0,
        metodosTentados: 0,
        metodosComSucesso: 0,
        erros: [error instanceof Error ? error.message : "Erro desconhecido"],
      });
      empresasSemSucesso++;
    }
  }

  // Relatório final
  console.log("\n\n");
  console.log("=".repeat(80));
  console.log("📊 RELATÓRIO FINAL DE INDEXAÇÃO");
  console.log("=".repeat(80));
  console.log(`\n✅ Empresas com sucesso: ${empresasComSucesso}`);
  console.log(`❌ Empresas sem sucesso: ${empresasSemSucesso}`);
  console.log(`📈 Total de novos áudios: ${totalNovosAudios}`);
  console.log(`📊 Taxa de sucesso: ${((empresasComSucesso / empresas.length) * 100).toFixed(1)}%`);

  // Top empresas por número de áudios
  const topEmpresas = resultados
    .filter(r => r.novosAudios > 0)
    .sort((a, b) => b.novosAudios - a.novosAudios)
    .slice(0, 10);

  if (topEmpresas.length > 0) {
    console.log("\n🏆 Top 10 empresas por novos áudios:");
    topEmpresas.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.ticker.padEnd(8)} - ${r.nome.padEnd(30)} | ${r.novosAudios.toString().padStart(3)} áudios | ${r.melhorMetodo || "N/A"}`);
    });
  }

  // Empresas sem sucesso
  const empresasSemAudios = resultados.filter(r => r.novosAudios === 0);
  if (empresasSemAudios.length > 0) {
    console.log("\n⚠️  Empresas sem áudios encontrados:");
    empresasSemAudios.forEach(r => {
      console.log(`   ${r.ticker.padEnd(8)} - ${r.nome.padEnd(30)} | Métodos: ${r.metodosTentados} | Sucesso: ${r.metodosComSucesso}`);
    });
  }

  // Estatísticas por método
  const metodosStats: Record<string, { tentado: number; sucesso: number; audios: number }> = {};
  
  resultados.forEach(r => {
    // Aqui precisaríamos dos detalhes dos métodos, mas por enquanto vamos usar o melhor método
    if (r.melhorMetodo) {
      if (!metodosStats[r.melhorMetodo]) {
        metodosStats[r.melhorMetodo] = { tentado: 0, sucesso: 0, audios: 0 };
      }
      metodosStats[r.melhorMetodo].tentado++;
      if (r.novosAudios > 0) {
        metodosStats[r.melhorMetodo].sucesso++;
        metodosStats[r.melhorMetodo].audios += r.novosAudios;
      }
    }
  });

  if (Object.keys(metodosStats).length > 0) {
    console.log("\n📈 Estatísticas por método (melhor método):");
    Object.entries(metodosStats)
      .sort((a, b) => b[1].audios - a[1].audios)
      .forEach(([metodo, stats]) => {
        const taxaSucesso = ((stats.sucesso / stats.tentado) * 100).toFixed(1);
        console.log(`   ${metodo.padEnd(25)} | Tentado: ${stats.tentado.toString().padStart(3)} | Sucesso: ${stats.sucesso.toString().padStart(3)} (${taxaSucesso}%) | Áudios: ${stats.audios.toString().padStart(4)}`);
      });
  }

  console.log("\n" + "=".repeat(80));
  console.log("✨ Indexação completa concluída!");
  console.log("=".repeat(80) + "\n");
}

async function main() {
  try {
    // 1. Limpar (opcional - mantendo áudios existentes por padrão)
    await limparAudiosAntigos();

    // 2. Executar seed
    await executarSeed();

    // 3. Indexar todas as empresas
    await indexarTodasEmpresas();

  } catch (error) {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

