# 📋 URLs de RI Corretas - Empresas AUVP11

**Última atualização:** 04/12/2025

## ✅ URLs Verificadas via Browser e Corrigidas no seed.ts

| Ticker | Empresa | URL Central de Resultados | Status |
|--------|---------|---------------------------|--------|
| CURY3 | Cury | `https://ri.cury.net/informacoes-aos-investidores/central-de-resultados/` | ✅ Corrigida |
| LEVE3 | Metal Leve | `https://ri.mahle.com.br/informacoes-financeiras/central-de-resultados/` | ✅ Corrigida |
| PRIO3 | PRIO | `https://ri.prio3.com.br/informacoes-financeiras/central-de-resultados/` | ✅ Verificada |
| TOTS3 | TOTVS | `https://ri.totvs.com/informacoes-financeiras/central-de-resultados/` | ✅ Verificada |
| BBSE3 | BB Seguridade | `https://www.bbseguridaderi.com.br/informacoes-ao-mercado/central-de-resultados/` | ✅ Corrigida |
| TIMS3 | TIM | `https://ri.tim.com.br/informacoes-ao-mercado/central-de-resultados/` | ✅ Corrigida |
| CMIG4 | CEMIG | `https://ri.cemig.com.br/divulgacao-e-resultados/central-de-resultados` | ✅ Corrigida |
| EGIE3 | Engie Brasil | `https://www.engie.com.br/investidores/informacoes-financeiras/releases-e-apresentacoes-de-resultados/` | ✅ Corrigida |
| CPFE3 | CPFL Energia | `https://ri.cpfl.com.br/listresultados.aspx?idCanal=UBKZ7EE26ff9gbUxPlf7PA==&linguagem=pt` | ✅ Corrigida |
| SBSP3 | Sabesp | `https://ri.sabesp.com.br/informacoes-financeiras/central-de-resultados/` | ✅ Verificada |
| INTB3 | Intelbras | `https://ri.intelbras.com.br/informacoes-financeiras/central-de-resultados/` | ✅ Verificada |
| ISAE4 | ISA Energia Brasil | `https://ri.isaenergiabrasil.com.br/pt/informacoes-financeiras/central-de-resultados` | ✅ Corrigida |
| CMIN3 | CSN Mineração | `https://ri.csnmineracao.com.br/informacoes-financeiras/central-de-resultados/` | ✅ Verificada |
| CXSE3 | Caixa Seguridade | `https://www.ri.caixaseguridade.com.br/informacoes-financeiras/central-de-resultados/` | ✅ Corrigida |
| CSMG3 | Copasa | `https://ri.copasa.com.br/servicos-aos-investidores/central-de-resultados/` | ✅ Corrigida |
| SAPR11 | Sanepar | `https://ri.sanepar.com.br/informacoes-financeiras/central-de-resultados` | ✅ Verificada |
| CYRE3 | Cyrela | `https://ri.cyrela.com.br/informacoes-financeiras/central-de-resultados/` | ✅ Verificada |
| DIRR3 | Direcional | `https://ri.direcional.com.br/informacoes-financeiras/central-de-resultados/` | ✅ Verificada |
| POMO4 | Marcopolo | `https://ri.marcopolo.com.br/divulgacao-e-resultados/central-de-resultados/` | ✅ Corrigida |
| UNIP6 | Unipar | `https://ri.unipar.com/informacoes-aos-investidores/central-de-resultados/` | ✅ Corrigida |
| ODPV3 | OdontoPrev | `https://ri.odontoprev.com.br/informacoes-aos-acionistas/central-de-resultados/` | ✅ Corrigida |

## ⚠️ URLs que Ainda Precisam Verificação

| Ticker | Empresa | URL Atual | Observação |
|--------|---------|-----------|------------|
| FRAS3 | Fras-le | `https://ri.frasle.com/informacoes-financeiras/central-de-resultados/` | Erro DNS |
| ABCB4 | ABC Brasil | `https://ri.abcbrasil.com.br/informacoes-financeiras/central-de-resultados/` | Verificar estrutura |

## 🔧 Correções Aplicadas ao seed.ts

1. **ISAE4** - Nome corrigido de "ISA CTEEP" para "ISA Energia Brasil" e URL atualizada
2. **CXSE3** - Adicionado "www" no domínio (www.ri.caixaseguridade.com.br)
3. **CSMG3** - Caminho corrigido para "servicos-aos-investidores" em vez de "informacoes-financeiras"
4. **POMO4** - Caminho corrigido para "divulgacao-e-resultados" em vez de "informacoes-financeiras"
5. **UNIP6** - Caminho corrigido para "informacoes-aos-investidores" em vez de "informacoes-financeiras"
6. **ODPV3** - Caminho corrigido para "informacoes-aos-acionistas" em vez de "informacoes-financeiras"

## 🔄 Padrões de URL MZ Group

A maioria das empresas usa plataforma MZ Group com padrões de URL similares:

- `https://ri.[empresa].com.br/informacoes-financeiras/central-de-resultados/`
- `https://ri.[empresa].com.br/informacoes-ao-mercado/central-de-resultados/`
- `https://ri.[empresa].com.br/informacoes-aos-investidores/central-de-resultados/`
- `https://ri.[empresa].com.br/informacoes-aos-acionistas/central-de-resultados/`
- `https://ri.[empresa].com.br/divulgacao-e-resultados/central-de-resultados`
- `https://ri.[empresa].com.br/servicos-aos-investidores/central-de-resultados/`

## 🏢 Sites Não MZ Group (Estrutura Própria)

| Empresa | Plataforma/Observação |
|---------|----------------------|
| Engie Brasil | Site próprio (engie.com.br/investidores) |
| BB Seguridade | Site próprio (bbseguridaderi.com.br) |
| CPFL Energia | Sistema antigo com parâmetros querystring |
| ISA Energia Brasil | Padrão MZ Group mas com prefixo `/pt/` |

## 📝 Notas

- Algumas empresas têm sites próprios (não MZ Group): Engie, BB Seguridade, CPFL
- Algumas precisam de Playwright devido a JavaScript pesado: Vale, algumas elétricas
- URLs com erro de DNS precisam ser verificadas manualmente
- ISA CTEEP mudou de nome para ISA Energia Brasil
- Total de 21 URLs verificadas e corrigidas

