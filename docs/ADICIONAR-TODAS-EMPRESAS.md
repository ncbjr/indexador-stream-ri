# Como Adicionar Todas as Empresas da B3

## ✅ O que foi feito

1. **Lista expandida criada**: `prisma/empresas-b3-completa.ts`
   - Adicionadas ~80 empresas adicionais além das 35 já existentes
   - Total: ~115 empresas conhecidas

2. **Seed atualizado**: `prisma/seed.ts`
   - Agora importa e combina empresas base + lista expandida
   - Remove duplicatas automaticamente

3. **Scripts criados**:
   - `scripts/adicionar-todas-empresas-b3.ts` - Busca empresas via API
   - `scripts/buscar-todas-empresas-b3.ts` - Alternativa de busca

## 🚀 Como executar

### Opção 1: Seed atualizado (Recomendado)

```bash
npm run db:seed
```

Isso vai:
- Adicionar todas as empresas da lista expandida
- Atualizar empresas já existentes
- Total esperado: ~115 empresas

### Opção 2: Buscar via API (Para TODAS as empresas da B3)

```bash
npx tsx scripts/adicionar-todas-empresas-b3.ts
```

Isso vai:
- Buscar empresas da API do Dados de Mercado
- Adicionar todas as empresas listadas na B3
- Total esperado: ~400-500 empresas (todas as listadas)

### Opção 3: Combinar ambos

```bash
# 1. Executar seed com empresas conhecidas
npm run db:seed

# 2. Buscar empresas adicionais via API
npx tsx scripts/adicionar-todas-empresas-b3.ts
```

## 📊 Verificar resultado

```bash
# Ver total de empresas
npx tsx scripts/verificar-estado.ts

# Ou via Prisma Studio
npx prisma studio
```

## 📝 Empresas adicionadas na lista expandida

### Bancos
- SANB11 (Santander Brasil)
- NUBR33 (Nu Holdings)
- BRSR6 (Banrisul)
- BIDI11 (Banco Inter)
- BMEB4 (Banco Mercantil)

### Petróleo e Gás
- 3R11 (3R Petroleum)
- RECV3 (Petroreconcavo)
- UGPA3 (Ultrapar)

### Mineração/Siderurgia
- CSNA3 (CSN)
- GGBR4 (Gerdau)
- USIM5 (Usiminas)
- KLBN11 (Klabin)
- SUZB3 (Suzano)

### Energia Elétrica
- ELET3/ELET6 (Eletrobras)
- AESB3 (AES Brasil)
- TAEE11 (Taesa)
- TRPL4 (Transmissora Paulista)
- ELPL3 (Eletropaulo)

### Telecomunicações
- VIVT3 (Telefônica Brasil)
- OIBR3 (Oi)

### Varejo
- VVAR3 (Via)
- LIGT3 (Lojas Renner)
- AMER3 (Americanas)
- BHIA3 (Casas Bahia)
- RADL3 (Raia Drogasil)
- PCAR3 (GPA)

### Alimentos
- JBSS3 (JBS)
- MRFG3 (Marfrig)
- BRFS3 (BRF)
- MDIA3 (M. Dias Branco)

### Tecnologia
- LWSA3 (Locaweb)
- CIEL3 (Cielo)
- STOC31 (Stone)
- PAGS34 (PagSeguro)

### Construção Civil
- EZTC3 (EZTEC)
- JHSF3 (JHSF)
- MRVE3 (MRV)
- TEND3 (Tenda)

### Seguros
- PSSA3 (Porto Seguro)
- SULA11 (SulAmérica)
- IRBR3 (IRB Brasil)

### Logística
- RAIL3 (Rumo)

### Aeronáutica
- EMBR3 (Embraer)

### Químicos
- BRKM5 (Braskem)
- DTEX3 (Duratex)

### Bens Industriais
- RAPT4 (Randon)
- TUPY3 (Tupy)
- MYPK3 (Iochpe-Maxion)

### Holdings
- BRAP4 (Bradespar)
- IGTA3 (Iguatemi)

### Saúde
- RDOR3 (Rede D'Or)
- QUAL3 (Qualicorp)
- HAPV3 (Hapvida)

## 🔄 Próximos passos

Após adicionar as empresas:

1. **Indexar áudios**:
   ```bash
   npx tsx scripts/indexar-tudo.ts
   ```

2. **Verificar resultados**:
   ```bash
   npx tsx scripts/verificar-estado.ts
   ```

3. **Configurar sites RI** (se necessário):
   - Algumas empresas podem ter URLs genéricas
   - Atualize manualmente no banco ou no seed.ts

## 📈 Estatísticas esperadas

- **Empresas conhecidas (seed)**: ~115 empresas
- **Empresas via API**: ~400-500 empresas (todas listadas na B3)
- **Total possível**: ~500 empresas

## ⚠️ Notas

- Empresas com site RI genérico precisarão ser configuradas manualmente
- Algumas empresas podem não ter webcasts de RI disponíveis
- O sistema adaptativo tentará todos os métodos para cada empresa

