// Script para verificar estado atual do banco
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const totalEmpresas = await prisma.empresa.count();
  const totalAudios = await prisma.audio.count();
  
  const empresasComAudios = await prisma.empresa.findMany({
    include: {
      _count: {
        select: { audios: true },
      },
    },
  });

  const empresasComAudiosCount = empresasComAudios.filter(e => e._count.audios > 0).length;

  console.log("\n📊 ESTADO ATUAL DO BANCO DE DADOS");
  console.log("=".repeat(50));
  console.log(`Total de empresas: ${totalEmpresas}`);
  console.log(`Total de áudios: ${totalAudios}`);
  console.log(`Empresas com áudios: ${empresasComAudiosCount}`);
  console.log(`Empresas sem áudios: ${totalEmpresas - empresasComAudiosCount}`);
  console.log("=".repeat(50) + "\n");

  if (totalEmpresas === 0) {
    console.log("⚠️  Nenhuma empresa encontrada! Execute: npm run db:seed\n");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

