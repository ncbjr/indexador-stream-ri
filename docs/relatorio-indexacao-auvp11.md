# 📊 Relatório de Indexação - Empresas AUVP11

**Data:** 04/12/2025  
**Versão:** 1.0  
**Total de Empresas Testadas:** 35

---

## 📋 Resumo Executivo

| Status | Quantidade |
|--------|------------|
| ✅ Funcionando | 6 |
| ⚠️ Parcialmente | 4 |
| ❌ Falhou | 25 |

---

## 📈 Resultados por Empresa

### Top 10 B3 (Empresas Originais)

| Ticker | Empresa | Áudios | Status | Observação |
|--------|---------|--------|--------|------------|
| PETR4 | Petrobras | 3 | ✅ | Scraper específico funcionando |
| VALE3 | Vale | 0 | ❌ | Site usa JavaScript pesado (SPA) |
| ITUB4 | Itaú Unibanco | 3 | ✅ | Via YouTube + scraper específico |
| BBDC4 | Bradesco | 1 | ⚠️ | Parcial - estrutura diferente |
| B3SA3 | B3 | 0 | ❌ | Links MZ mas não encontrou áudios |
| WEGE3 | WEG | 0 | ❌ | URL correta, mas sem resultados |
| ABEV3 | Ambev | 0 | ❌ | URL correta, mas sem resultados |
| MGLU3 | Magazine Luiza | 4 | ✅ | Scraper específico funcionando |
| RENT3 | Localiza | 0 | ❌ | URL correta, mas sem resultados |
| BBAS3 | Banco do Brasil | 13 | ✅ | Via YouTube API |

### Empresas AUVP11 (Novas - MZ Group Genérico)

| Ticker | Empresa | Áudios | Status | Erro | Proposta de Solução |
|--------|---------|--------|--------|------|---------------------|
| ITSA4 | Itaúsa | 0 | ❌ | Estrutura diferente | Usar canal YouTube @itausaholding ou criar scraper específico |
| BPAC11 | BTG Pactual | 0 | ❌ | Sem links de áudio na página | Site não tem áudios de teleconferência, verificar YouTube |
| PRIO3 | PRIO | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| TOTS3 | TOTVS | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| BBSE3 | BB Seguridade | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| TIMS3 | TIM | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| CMIG4 | CEMIG | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| ISAE4 | ISA CTEEP | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| EGIE3 | Engie Brasil | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| CPFE3 | CPFL Energia | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| SBSP3 | Sabesp | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| CMIN3 | CSN Mineração | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| CXSE3 | Caixa Seguridade | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| CSMG3 | Copasa | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| SAPR11 | Sanepar | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| CYRE3 | Cyrela | 0 | ❌ | SSL Error | Adicionar bypass SSL + verificar URL |
| DIRR3 | Direcional | 0 | ❌ | Não extraiu trimestre | Ajustar regex de extração de trimestre |
| CURY3 | Cury | 0 | ❌ | DNS ENOTFOUND | URL incorreta - verificar ri.cury.net.br ou ri.curyconstrutora.com.br |
| POMO4 | Marcopolo | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| UNIP6 | Unipar | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| ODPV3 | OdontoPrev | 0 | ❌ | URL não validada | Verificar URL correta do RI |
| FRAS3 | Fras-le | 0 | ❌ | DNS ENOTFOUND | URL correta: ri.fraslemobility.com (já corrigida) |
| ABCB4 | ABC Brasil | 0 | ❌ | Sem áudios encontrados | Verificar estrutura da página |
| LEVE3 | Metal Leve | 0 | ❌ | DNS ENOTFOUND | URL incorreta - verificar URL correta da MAHLE Metal Leve |
| INTB3 | Intelbras | 0 | ❌ | Sem áudios encontrados | Verificar estrutura da página |

---

## 🔧 Problemas Identificados

### 1. URLs Incorretas (DNS ENOTFOUND)
- **CURY3**: ri.cury.com.br não existe
- **FRAS3**: ri.frasle.com → Deve ser ri.fraslemobility.com ✅ Corrigido
- **LEVE3**: ri.mahle.com não existe

### 2. Erros de SSL (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
- **CYRE3**: Certificado SSL inválido ou auto-assinado

### 3. Estrutura Diferente (Não é tabela padrão MZ)
- **ITSA4**: Usa "Itaúsa Cast" (YouTube) ao invés de links MZ diretos
- **DIRR3**: Link "Conferência de Resultados" sem trimestre no texto

### 4. Sites JavaScript Pesados (Precisam Playwright)
- **VALE3**: Single Page Application

### 5. Sem Áudios Disponíveis
- Algumas empresas podem não disponibilizar áudios de teleconferência

---

## 📝 Próximos Passos

### Fase 1: Correções Urgentes (URLs)
1. [ ] Verificar URLs corretas de todas as empresas com erro DNS
2. [ ] Adicionar opção de bypass SSL para certificados inválidos
3. [ ] Corrigir regex de extração de trimestre

### Fase 2: Scrapers Específicos
Empresas que precisam scraper customizado:
1. [ ] ITSA4 - Usar canal YouTube @itausaholding
2. [ ] VALE3 - Implementar scraper Playwright
3. [ ] DIRR3 - Ajustar extração de trimestre

### Fase 3: Validação Manual
1. [ ] Acessar cada site manualmente para confirmar se há áudios
2. [ ] Documentar estrutura de cada site
3. [ ] Criar scrapers específicos quando necessário

---

## 📊 Estatísticas

- **Taxa de Sucesso:** 17% (6/35)
- **Parcialmente Funcionando:** 11% (4/35)
- **Falhas:** 71% (25/35)

### Motivos das Falhas:
- URLs incorretas: 12%
- Estrutura diferente do padrão: 34%
- SSL/Certificado: 3%
- Sem áudio disponível: 22%

---

## 🔄 Histórico de Atualizações

| Data | Versão | Alterações |
|------|--------|------------|
| 04/12/2025 | 1.0 | Relatório inicial |


