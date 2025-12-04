# Empresas do Índice AUVP11 - Categorização por Fonte de Dados

## Resumo dos Tipos de Fonte

| Tipo | Descrição | Complexidade |
|------|-----------|--------------|
| **MZ Group** | Sites com API MZ (api.mziq.com) - Links MP3 diretos | Fácil - Cheerio |
| **YouTube** | Canais oficiais de RI no YouTube | Fácil - API YouTube |
| **Custom** | Sites próprios com estrutura customizada | Médio - Cheerio |
| **Playwright** | Sites com JS pesado que precisam de browser | Difícil - Playwright |

---

## 📊 GRUPO 1: MZ Group (Cheerio Simples)
*Empresas com site RI usando plataforma MZ - Mais fácil de implementar*

| Ticker | Empresa | Site RI | Status |
|--------|---------|---------|--------|
| B3SA3 | B3 | ri.b3.com.br | ✅ Implementado |
| ITUB4 | Itaú Unibanco | ri.itau.com.br | ✅ Implementado |
| BBDC4 | Bradesco | bradescori.com.br | ✅ Implementado |
| PETR4 | Petrobras | investidorpetrobras.com.br | ✅ Implementado |
| WEGE3 | WEG | ri.weg.net | ✅ Implementado |
| ABEV3 | Ambev | ri.ambev.com.br | ✅ Implementado |
| RENT3 | Localiza | ri.localiza.com | ✅ Implementado |
| MGLU3 | Magazine Luiza | ri.magazineluiza.com.br | ✅ Implementado |
| ITSA4 | Itaúsa | ri.itausa.com.br | ⏳ Pendente |
| BPAC11 | BTG Pactual | ri.btgpactual.com | ⏳ Pendente |
| PRIO3 | PRIO | ri.prio3.com.br | ⏳ Pendente |
| TOTS3 | TOTVS | ri.totvs.com | ⏳ Pendente |
| BBSE3 | BB Seguridade | ri.bbseguros.com.br | ⏳ Pendente |
| TIMS3 | TIM | ri.tim.com.br | ⏳ Pendente |
| EGIE3 | Engie Brasil | ri.engieenergia.com.br | ⏳ Pendente |
| CPFE3 | CPFL Energia | ri.cpfl.com.br | ⏳ Pendente |
| SBSP3 | Sabesp | ri.sabesp.com.br | ⏳ Pendente |
| CMIN3 | CSN Mineração | ri.csnmineracao.com.br | ⏳ Pendente |
| CXSE3 | Caixa Seguridade | ri.caixaseguridade.com.br | ⏳ Pendente |
| SAPR11 | Sanepar | ri.sanepar.com.br | ⏳ Pendente |
| CSMG3 | Copasa | ri.copasa.com.br | ⏳ Pendente |
| CMIG4 | CEMIG | ri.cemig.com.br | ⏳ Pendente |
| ISAE4 | ISA CTEEP | ri.isacteep.com.br | ⏳ Pendente |
| CYRE3 | Cyrela | ri.cyrela.com.br | ⏳ Pendente |
| DIRR3 | Direcional | ri.direcional.com.br | ⏳ Pendente |
| CURY3 | Cury | ri.cury.com.br | ⏳ Pendente |
| POMO4 | Marcopolo | ri.marcopolo.com.br | ⏳ Pendente |
| UNIP6 | Unipar | ri.unipar.com | ⏳ Pendente |
| ODPV3 | OdontoPrev | ri.odontoprev.com.br | ⏳ Pendente |
| FRAS3 | Fras-le | ri.frasle.com | ⏳ Pendente |
| ABCB4 | ABC Brasil | ri.abcbrasil.com.br | ⏳ Pendente |
| LEVE3 | Metal Leve | ri.metalleve.com.br | ⏳ Pendente |
| INTB3 | Intelbras | ri.intelbras.com.br | ⏳ Pendente |

---

## 🎬 GRUPO 2: YouTube API
*Empresas com canais oficiais de RI no YouTube*

| Ticker | Empresa | Canal YouTube | Status |
|--------|---------|---------------|--------|
| BBAS3 | Banco do Brasil | @bancodobrasil | ✅ Implementado |
| VALE3 | Vale | @valeglobal (sem RI) | ⚠️ Precisa scraper site |

---

## 🎭 GRUPO 3: Playwright (JS Pesado)
*Sites que precisam de browser headless*

| Ticker | Empresa | Site RI | Motivo |
|--------|---------|---------|--------|
| VALE3 | Vale | vale.com/pt/investidores | SPA com carregamento dinâmico |

---

## Progresso

### Implementados (10/35)
- [x] PETR4 - Petrobras
- [x] ITUB4 - Itaú Unibanco
- [x] BBDC4 - Bradesco
- [x] B3SA3 - B3
- [x] WEGE3 - WEG
- [x] ABEV3 - Ambev
- [x] RENT3 - Localiza
- [x] MGLU3 - Magazine Luiza
- [x] BBAS3 - Banco do Brasil
- [x] VALE3 - Vale (parcial)

### Próximos (prioridade AUVP11)
- [ ] ITSA4 - Itaúsa
- [ ] BPAC11 - BTG Pactual
- [ ] PRIO3 - PRIO
- [ ] TOTS3 - TOTVS
- [ ] BBSE3 - BB Seguridade
- [ ] TIMS3 - TIM
- [ ] EGIE3 - Engie
- [ ] CPFE3 - CPFL
- [ ] SBSP3 - Sabesp
- [ ] CMIG4 - CEMIG
- [ ] ... (25 mais)


