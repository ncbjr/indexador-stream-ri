import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Top 10 empresas mais negociadas da B3
// Logos são opcionais - o componente mostra iniciais coloridas como fallback
const empresas = [
  {
    ticker: "PETR4",
    nome: "Petrobras",
    setor: "Petróleo e Gás",
    siteRi: "https://ri.petrobras.com.br",
    youtubeChannel: "@petrobaborasbr",
    logoUrl: null, // Fallback visual será usado
    fonte: "youtube",
  },
  {
    ticker: "VALE3",
    nome: "Vale",
    setor: "Mineração",
    siteRi: "https://vale.com/pt/investors",
    youtubeChannel: "@valeglobal",
    logoUrl: null,
    fonte: "youtube",
  },
  {
    ticker: "ITUB4",
    nome: "Itaú Unibanco",
    setor: "Bancos",
    siteRi: "https://www.itau.com.br/relacoes-com-investidores",
    youtubeChannel: "@itaborasbr",
    logoUrl: null,
    fonte: "youtube",
  },
  {
    ticker: "BBDC4",
    nome: "Bradesco",
    setor: "Bancos",
    siteRi: "https://www.bradescori.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "B3SA3",
    nome: "B3",
    setor: "Serviços Financeiros",
    siteRi: "https://ri.b3.com.br",
    youtubeChannel: "@b3oficial",
    logoUrl: null,
    fonte: "youtube",
  },
  {
    ticker: "WEGE3",
    nome: "WEG",
    setor: "Bens Industriais",
    siteRi: "https://ri.weg.net",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "ABEV3",
    nome: "Ambev",
    setor: "Bebidas",
    siteRi: "https://ri.ambev.com.br",
    youtubeChannel: "@ambev",
    logoUrl: null,
    fonte: "youtube",
  },
  {
    ticker: "MGLU3",
    nome: "Magazine Luiza",
    setor: "Varejo",
    siteRi: "https://ri.magazineluiza.com.br",
    youtubeChannel: "@magazineluiza",
    logoUrl: null,
    fonte: "youtube",
  },
  {
    ticker: "RENT3",
    nome: "Localiza",
    setor: "Locação de Veículos",
    siteRi: "https://ri.localiza.com",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "BBAS3",
    nome: "Banco do Brasil",
    setor: "Bancos",
    siteRi: "https://ri.bb.com.br",
    youtubeChannel: "@bancodobrasil",
    logoUrl: null,
    fonte: "youtube",
  },
];

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  for (const empresa of empresas) {
    const existing = await prisma.empresa.findUnique({
      where: { ticker: empresa.ticker },
    });

    if (existing) {
      console.log(`⏭️  ${empresa.ticker} já existe, atualizando...`);
      await prisma.empresa.update({
        where: { ticker: empresa.ticker },
        data: empresa,
      });
    } else {
      console.log(`✅ Criando ${empresa.ticker} - ${empresa.nome}`);
      await prisma.empresa.create({
        data: empresa,
      });
    }
  }

  console.log(`\n🎉 Seed concluído! ${empresas.length} empresas no banco.`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
