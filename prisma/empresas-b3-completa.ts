// Lista expandida de empresas listadas na B3
// Fonte: Baseado em dados públicos da B3 e sites de RI conhecidos

export interface EmpresaSeed {
  ticker: string;
  nome: string;
  setor: string;
  siteRi: string | null;
  youtubeChannel: string | null;
  logoUrl: string | null;
  fonte: "youtube" | "scraping";
}

// Lista expandida - Top 100+ empresas mais negociadas + outras conhecidas
export const empresasB3Completa: EmpresaSeed[] = [
  // === JÁ EXISTENTES NO SEED ORIGINAL (mantidas para referência) ===
  // PETR4, VALE3, ITUB4, BBDC4, B3SA3, WEGE3, ABEV3, MGLU3, RENT3, BBAS3
  // ITSA4, BPAC11, PRIO3, TOTS3, BBSE3, TIMS3, CMIG4, ISAE4, EGIE3, CPFE3
  // SBSP3, CMIN3, CXSE3, CSMG3, SAPR11, CYRE3, DIRR3, CURY3, POMO4, UNIP6
  // ODPV3, FRAS3, ABCB4, LEVE3, INTB3

  // === BANCOS ===
  {
    ticker: "SANB11",
    nome: "Santander Brasil",
    setor: "Bancos",
    siteRi: "https://www.santander.com.br/ri",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "NUBR33",
    nome: "Nu Holdings",
    setor: "Bancos",
    siteRi: "https://investors.nu",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "BRSR6",
    nome: "Banco do Estado do Rio Grande do Sul",
    setor: "Bancos",
    siteRi: "https://www.banrisul.com.br/ri",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "BIDI11",
    nome: "Banco Inter",
    setor: "Bancos",
    siteRi: "https://investidores.bancointer.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "BMEB4",
    nome: "Banco Mercantil do Brasil",
    setor: "Bancos",
    siteRi: "https://www.mercantil.com.br/ri",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === PETRÓLEO E GÁS ===
  {
    ticker: "3R11",
    nome: "3R Petroleum",
    setor: "Petróleo e Gás",
    siteRi: "https://ri.3rpetroleum.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "RECV3",
    nome: "Petroreconcavo",
    setor: "Petróleo e Gás",
    siteRi: "https://ri.petroreconcavo.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "UGPA3",
    nome: "Ultrapar",
    setor: "Petróleo e Gás",
    siteRi: "https://ri.ultra.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === MINERAÇÃO ===
  {
    ticker: "CSNA3",
    nome: "CSN",
    setor: "Siderurgia",
    siteRi: "https://ri.csn.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "GGBR4",
    nome: "Gerdau",
    setor: "Siderurgia",
    siteRi: "https://ri.gerdau.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "USIM5",
    nome: "Usinas Siderúrgicas de Minas Gerais",
    setor: "Siderurgia",
    siteRi: "https://ri.usiminas.com",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "KLBN11",
    nome: "Klabin",
    setor: "Papel e Celulose",
    siteRi: "https://ri.klabin.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "SUZB3",
    nome: "Suzano",
    setor: "Papel e Celulose",
    siteRi: "https://ri.suzano.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === ENERGIA ELÉTRICA ===
  {
    ticker: "ELET3",
    nome: "Eletrobras",
    setor: "Energia Elétrica",
    siteRi: "https://ri.eletrobras.com",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "ELET6",
    nome: "Eletrobras",
    setor: "Energia Elétrica",
    siteRi: "https://ri.eletrobras.com",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "AESB3",
    nome: "AES Brasil",
    setor: "Energia Elétrica",
    siteRi: "https://ri.aesbrasil.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "TAEE11",
    nome: "Taesa",
    setor: "Energia Elétrica",
    siteRi: "https://ri.taesa.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "TRPL4",
    nome: "Transmissora Paulista",
    setor: "Energia Elétrica",
    siteRi: "https://ri.transmissorapaulista.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "ELPL3",
    nome: "Eletropaulo",
    setor: "Energia Elétrica",
    siteRi: "https://ri.eletropaulo.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === TELECOMUNICAÇÕES ===
  {
    ticker: "VIVT3",
    nome: "Telefônica Brasil",
    setor: "Telecomunicações",
    siteRi: "https://ri.telefonica.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "OIBR3",
    nome: "Oi",
    setor: "Telecomunicações",
    siteRi: "https://ri.oi.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === VAREJO ===
  {
    ticker: "VVAR3",
    nome: "Via",
    setor: "Varejo",
    siteRi: "https://ri.via.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "LIGT3",
    nome: "Lojas Renner",
    setor: "Varejo",
    siteRi: "https://ri.lojasrenner.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "AMER3",
    nome: "Americanas",
    setor: "Varejo",
    siteRi: "https://ri.americanas.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "BHIA3",
    nome: "Casas Bahia",
    setor: "Varejo",
    siteRi: "https://ri.casasbahia.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "RADL3",
    nome: "Raia Drogasil",
    setor: "Varejo Farmacêutico",
    siteRi: "https://ri.raiadrogasil.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "PCAR3",
    nome: "GPA",
    setor: "Varejo",
    siteRi: "https://ri.gpa.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === ALIMENTOS ===
  {
    ticker: "JBSS3",
    nome: "JBS",
    setor: "Alimentos",
    siteRi: "https://ri.jbs.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "MRFG3",
    nome: "Marfrig",
    setor: "Alimentos",
    siteRi: "https://ri.marfrig.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "BRFS3",
    nome: "BRF",
    setor: "Alimentos",
    siteRi: "https://ri.brf.com",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "MDIA3",
    nome: "M. Dias Branco",
    setor: "Alimentos",
    siteRi: "https://ri.mdiasbranco.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === TECNOLOGIA ===
  {
    ticker: "LWSA3",
    nome: "Locaweb",
    setor: "Tecnologia",
    siteRi: "https://ri.locaweb.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "CIEL3",
    nome: "Cielo",
    setor: "Meios de Pagamento",
    siteRi: "https://ri.cielo.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "STOC31",
    nome: "Stone",
    setor: "Meios de Pagamento",
    siteRi: "https://investors.stone.co",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "PAGS34",
    nome: "PagSeguro",
    setor: "Meios de Pagamento",
    siteRi: "https://investors.pagseguro.com",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === CONSTRUÇÃO CIVIL ===
  {
    ticker: "EZTC3",
    nome: "EZTEC",
    setor: "Construção Civil",
    siteRi: "https://ri.eztec.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "JHSF3",
    nome: "JHSF",
    setor: "Construção Civil",
    siteRi: "https://ri.jhsf.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "MRVE3",
    nome: "MRV",
    setor: "Construção Civil",
    siteRi: "https://ri.mrv.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "TEND3",
    nome: "Tenda",
    setor: "Construção Civil",
    siteRi: "https://ri.tenda.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === SEGUROS ===
  {
    ticker: "PSSA3",
    nome: "Porto Seguro",
    setor: "Seguros",
    siteRi: "https://ri.portoseguro.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "SULA11",
    nome: "SulAmérica",
    setor: "Seguros",
    siteRi: "https://ri.sulamerica.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "IRBR3",
    nome: "IRB Brasil",
    setor: "Seguros",
    siteRi: "https://ri.irbbrasil.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === LOGÍSTICA ===
  {
    ticker: "RAIL3",
    nome: "Rumo",
    setor: "Logística",
    siteRi: "https://ri.rumolog.com",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "VLOE34",
    nome: "Vale",
    setor: "Logística",
    siteRi: "https://vale.com/pt/investidores",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === AERONÁUTICA ===
  {
    ticker: "EMBR3",
    nome: "Embraer",
    setor: "Aeronáutica",
    siteRi: "https://ri.embraer.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === QUÍMICOS ===
  {
    ticker: "BRKM5",
    nome: "Braskem",
    setor: "Químicos",
    siteRi: "https://ri.braskem.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "DTEX3",
    nome: "Duratex",
    setor: "Químicos",
    siteRi: "https://ri.duratex.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === BENS INDUSTRIAIS ===
  {
    ticker: "RAPT4",
    nome: "Randon",
    setor: "Bens Industriais",
    siteRi: "https://ri.randon.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "TUPY3",
    nome: "Tupy",
    setor: "Bens Industriais",
    siteRi: "https://ri.tupy.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "MYPK3",
    nome: "Iochpe-Maxion",
    setor: "Bens Industriais",
    siteRi: "https://ri.iochpe-maxion.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === HOLDINGS ===
  {
    ticker: "BRAP4",
    nome: "Bradespar",
    setor: "Holdings",
    siteRi: "https://ri.bradespar.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "IGTA3",
    nome: "Iguatemi",
    setor: "Holdings",
    siteRi: "https://ri.iguatemi.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },

  // === SAÚDE ===
  {
    ticker: "RDOR3",
    nome: "Rede D'Or",
    setor: "Saúde",
    siteRi: "https://ri.rededor.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "QUAL3",
    nome: "Qualicorp",
    setor: "Saúde",
    siteRi: "https://ri.qualicorp.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
  {
    ticker: "HAPV3",
    nome: "Hapvida",
    setor: "Saúde",
    siteRi: "https://ri.hapvida.com.br",
    youtubeChannel: null,
    logoUrl: null,
    fonte: "scraping",
  },
];

