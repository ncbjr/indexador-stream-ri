import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Empresas indexadas - Top 10 B3 + AUVP11
// Fonte "youtube" = tem canal com webcasts de RI
// Fonte "scraping" = precisa buscar no site de RI (MZ Group ou similar)
const empresas = [
  // === TOP 10 B3 (já existentes) ===
  {
    ticker: "PETR4",
    nome: "Petrobras",
    setor: "Petróleo e Gás",
    siteRi: "https://www.investidorpetrobras.com.br/resultados-e-comunicados/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "VALE3",
    nome: "Vale",
    setor: "Mineração",
    siteRi: "https://vale.com/pt/investidores",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "ITUB4",
    nome: "Itaú Unibanco",
    setor: "Bancos",
    siteRi: "https://www.itau.com.br/relacoes-com-investidores/resultados-e-relatorios/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
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
    siteRi: "https://ri.b3.com.br/pt-br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "WEGE3",
    nome: "WEG",
    setor: "Bens Industriais",
    siteRi: "https://ri.weg.net/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "ABEV3",
    nome: "Ambev",
    setor: "Bebidas",
    siteRi: "https://ri.ambev.com.br/relatorios-publicacoes/divulgacao-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "MGLU3",
    nome: "Magazine Luiza",
    setor: "Varejo",
    siteRi: "https://ri.magazineluiza.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "RENT3",
    nome: "Localiza",
    setor: "Locação de Veículos",
    siteRi: "https://ri.localiza.com/informacoes-aos-acionistas/central-de-resultados/",
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

  // === ÍNDICE AUVP11 - Empresas adicionais ===
  {
    ticker: "ITSA4",
    nome: "Itaúsa",
    setor: "Holdings",
    siteRi: "https://ri.itausa.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "BPAC11",
    nome: "BTG Pactual",
    setor: "Bancos",
    siteRi: "https://ri.btgpactual.com",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "PRIO3",
    nome: "PRIO",
    setor: "Petróleo e Gás",
    siteRi: "https://ri.prio3.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "TOTS3",
    nome: "TOTVS",
    setor: "Tecnologia",
    siteRi: "https://ri.totvs.com/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "BBSE3",
    nome: "BB Seguridade",
    setor: "Seguros",
    siteRi: "https://www.bbseguridaderi.com.br/informacoes-ao-mercado/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "TIMS3",
    nome: "TIM",
    setor: "Telecomunicações",
    siteRi: "https://ri.tim.com.br/informacoes-ao-mercado/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "CMIG4",
    nome: "CEMIG",
    setor: "Energia Elétrica",
    siteRi: "https://ri.cemig.com.br/divulgacao-e-resultados/central-de-resultados",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "ISAE4",
    nome: "ISA Energia Brasil",
    setor: "Energia Elétrica",
    siteRi: "https://ri.isaenergiabrasil.com.br/pt/informacoes-financeiras/central-de-resultados",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "EGIE3",
    nome: "Engie Brasil",
    setor: "Energia Elétrica",
    siteRi: "https://www.engie.com.br/investidores/informacoes-financeiras/releases-e-apresentacoes-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "CPFE3",
    nome: "CPFL Energia",
    setor: "Energia Elétrica",
    siteRi: "https://ri.cpfl.com.br/listresultados.aspx?idCanal=UBKZ7EE26ff9gbUxPlf7PA==&linguagem=pt",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "SBSP3",
    nome: "Sabesp",
    setor: "Saneamento",
    siteRi: "https://ri.sabesp.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "CMIN3",
    nome: "CSN Mineração",
    setor: "Mineração",
    siteRi: "https://ri.csnmineracao.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "CXSE3",
    nome: "Caixa Seguridade",
    setor: "Seguros",
    siteRi: "https://www.ri.caixaseguridade.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "CSMG3",
    nome: "Copasa",
    setor: "Saneamento",
    siteRi: "https://ri.copasa.com.br/servicos-aos-investidores/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "SAPR11",
    nome: "Sanepar",
    setor: "Saneamento",
    siteRi: "https://ri.sanepar.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "CYRE3",
    nome: "Cyrela",
    setor: "Construção Civil",
    siteRi: "https://ri.cyrela.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "DIRR3",
    nome: "Direcional",
    setor: "Construção Civil",
    siteRi: "https://ri.direcional.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "CURY3",
    nome: "Cury",
    setor: "Construção Civil",
    siteRi: "https://ri.cury.net/informacoes-aos-investidores/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "POMO4",
    nome: "Marcopolo",
    setor: "Automóveis e Autopeças",
    siteRi: "https://ri.marcopolo.com.br/divulgacao-e-resultados/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "UNIP6",
    nome: "Unipar",
    setor: "Químicos",
    siteRi: "https://ri.unipar.com/informacoes-aos-investidores/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "ODPV3",
    nome: "OdontoPrev",
    setor: "Saúde",
    siteRi: "https://ri.odontoprev.com.br/informacoes-aos-acionistas/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "FRAS3",
    nome: "Frasle Mobility",
    setor: "Automóveis e Autopeças",
    siteRi: "https://ri.fraslemobility.com/informacoes-aos-investidores/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "ABCB4",
    nome: "ABC Brasil",
    setor: "Bancos",
    siteRi: "https://ri.abcbrasil.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "LEVE3",
    nome: "Metal Leve",
    setor: "Automóveis e Autopeças",
    siteRi: "https://ri.mahle.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "INTB3",
    nome: "Intelbras",
    setor: "Tecnologia",
    siteRi: "https://ri.intelbras.com.br/informacoes-financeiras/central-de-resultados/",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
];

// Lista de tickers que fazem parte do índice AUVP11 (para playlist padrão)
const AUVP11_TICKERS = [
  "ITUB4", "BBDC4", "SBSP3", "B3SA3", "ITSA4", "BPAC11", "WEGE3", "BBAS3",
  "ABEV3", "PRIO3", "TOTS3", "BBSE3", "CMIG4", "TIMS3", "ISAE4", "EGIE3",
  "CPFE3", "CMIN3", "CXSE3", "CSMG3", "SAPR11", "CYRE3", "DIRR3", "CURY3",
  "POMO4", "UNIP6", "ODPV3", "FRAS3", "ABCB4", "LEVE3", "INTB3"
];

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");
  console.log(`📊 Total de empresas: ${empresas.length}`);

  let created = 0;
  let updated = 0;

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
      updated++;
    } else {
      console.log(`✅ Criando ${empresa.ticker} - ${empresa.nome}`);
      await prisma.empresa.create({
        data: empresa,
      });
      created++;
    }
  }

  console.log(`\n🎉 Seed concluído!`);
  console.log(`   ✅ ${created} empresas criadas`);
  console.log(`   ⏭️  ${updated} empresas atualizadas`);
  console.log(`   📊 Total: ${empresas.length} empresas no banco`);
  console.log(`   📈 Empresas AUVP11: ${AUVP11_TICKERS.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Exportar para uso em outros lugares
export { AUVP11_TICKERS };
