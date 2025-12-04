// Script para limpar áudios que não são reproduzíveis
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function limparAudiosInvalidos() {
  console.log("🧹 Limpando áudios inválidos...\n");

  // Buscar todos os áudios
  const audios = await prisma.audio.findMany({
    include: { empresa: true },
  });

  let removidos = 0;
  let mantidos = 0;

  for (const audio of audios) {
    const isValido = isAudioValido(audio);
    
    if (!isValido) {
      console.log(`❌ Removendo: ${audio.titulo.substring(0, 50)}...`);
      console.log(`   URL: ${audio.sourceUrl}`);
      console.log(`   Motivo: ${getMotivo(audio)}\n`);
      
      await prisma.audio.delete({ where: { id: audio.id } });
      removidos++;
    } else {
      mantidos++;
    }
  }

  console.log(`\n✨ Concluído!`);
  console.log(`   Mantidos: ${mantidos}`);
  console.log(`   Removidos: ${removidos}`);
}

function isAudioValido(audio: { sourceUrl: string; sourceType: string; youtubeId: string | null; titulo: string }): boolean {
  const url = audio.sourceUrl.toLowerCase();
  const titulo = audio.titulo.toLowerCase();
  
  // URLs claramente inválidas
  if (url.includes("javascript:") || url === "#" || url === "") return false;
  
  // Títulos que indicam links genéricos
  if (titulo.includes("powered by") || titulo.includes("link para")) return false;
  
  // Se é YouTube, precisa ter youtubeId válido
  if (audio.sourceType === "youtube") {
    if (!audio.youtubeId) return false;
    if (audio.youtubeId.length !== 11) return false;
  }
  
  // Se é áudio direto, precisa ser URL de mídia
  if (audio.sourceType === "mp3" || audio.sourceType === "m4a" || audio.sourceType === "wav") {
    if (!url.includes(".mp3") && !url.includes(".m4a") && !url.includes(".wav")) return false;
  }
  
  // URLs de MZ Group que não são vídeos
  if (url.includes("mzgroup") && !url.includes("video") && !url.includes("webcast")) {
    return false;
  }
  
  return true;
}

function getMotivo(audio: { sourceUrl: string; sourceType: string; youtubeId: string | null; titulo: string }): string {
  const url = audio.sourceUrl.toLowerCase();
  const titulo = audio.titulo.toLowerCase();
  
  if (titulo.includes("powered by")) return "Título genérico (Powered by)";
  if (titulo.includes("link para")) return "Título genérico (Link para)";
  if (!audio.youtubeId && audio.sourceType === "youtube") return "YouTube sem ID válido";
  if (url.includes("mzgroup") && !url.includes("video")) return "Link MZ Group não é vídeo";
  return "URL não reproduzível";
}

limparAudiosInvalidos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



