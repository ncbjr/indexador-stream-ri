// Script simplificado para executar seed e indexar todas as empresas
import { PrismaClient } from "@prisma/client";
import { indexarTodasEmpresasAdaptativa } from "../src/lib/indexers";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando processo completo de indexação adaptativa\n");

  // 1. Verificar empresas no banco
  const totalEmpresas = await prisma.empresa.count();
  console.log(`📊 Total de empresas no banco: ${totalEmpresas}`);

  if (totalEmpresas === 0) {
    console.log("\n⚠️  Nenhuma empresa encontrada no banco!");
    console.log("💡 Execute primeiro: npm run db:seed");
    process.exit(1);
  }

  // 2. Indexar todas as empresas
  console.log("\n🚀 Iniciando indexação adaptativa de TODAS as empresas...");
  console.log("📋 Aplicando TODOS os métodos disponíveis para cada empresa\n");
  console.log("⏳ Isso pode demorar vários minutos...\n");

  try {
    const results = await indexarTodasEmpresasAdaptativa();
    
    const totalNovos = results.reduce((acc, r) => acc + r.novosAudios, 0);
    const empresasComSucesso = results.filter(r => r.novosAudios > 0).length;
    const taxaSucesso = ((empresasComSucesso / results.length) * 100).toFixed(1);

    console.log("\n" + "=".repeat(80));
    console.log("📊 RELATÓRIO FINAL");
    console.log("=".repeat(80));
    console.log(`\n✅ Empresas com sucesso: ${empresasComSucesso}`);
    console.log(`❌ Empresas sem sucesso: ${results.length - empresasComSucesso}`);
    console.log(`📈 Total de novos áudios: ${totalNovos}`);
    console.log(`📊 Taxa de sucesso: ${taxaSucesso}%`);
    console.log(`📋 Total de empresas processadas: ${results.length}`);

    // Top empresas
    const topEmpresas = results
      .filter(r => r.novosAudios > 0)
      .sort((a, b) => b.novosAudios - a.novosAudios)
      .slice(0, 10);

    if (topEmpresas.length > 0) {
      console.log("\n🏆 Top 10 empresas por novos áudios:");
      topEmpresas.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.ticker.padEnd(8)} | ${r.novosAudios.toString().padStart(3)} áudios | ${r.melhorMetodo || "N/A"}`);
      });
    }

    // Estatísticas por método
    const metodosStats: Record<string, { usado: number; audios: number }> = {};
    results.forEach(r => {
      if (r.melhorMetodo) {
        if (!metodosStats[r.melhorMetodo]) {
          metodosStats[r.melhorMetodo] = { usado: 0, audios: 0 };
        }
        metodosStats[r.melhorMetodo].usado++;
        metodosStats[r.melhorMetodo].audios += r.novosAudios;
      }
    });

    if (Object.keys(metodosStats).length > 0) {
      console.log("\n📈 Estatísticas por método (melhor método):");
      Object.entries(metodosStats)
        .sort((a, b) => b[1].audios - a[1].audios)
        .forEach(([metodo, stats]) => {
          console.log(`   ${metodo.padEnd(25)} | Usado: ${stats.usado.toString().padStart(3)} | Áudios: ${stats.audios.toString().padStart(4)}`);
        });
    }

    console.log("\n" + "=".repeat(80));
    console.log("✨ Indexação completa concluída!");
    console.log("=".repeat(80) + "\n");

  } catch (error) {
    console.error("\n❌ Erro durante indexação:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


