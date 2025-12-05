# Instruções para Indexação Completa

## 🎯 Objetivo

Aplicar **TODOS os métodos conhecidos** de indexação a **TODAS as empresas** no banco de dados.

## 📋 Métodos Aplicados

O sistema adaptativo aplica os seguintes métodos para cada empresa:

1. **Scraper Específico** (confiança: 0.9)
   - Scrapers customizados por empresa
   
2. **YouTube API** (confiança: 0.95)
   - Busca em canais do YouTube quando configurado
   
3. **MZ Group Configurado** (confiança: 0.85)
   - Scraping de plataforma MZ Group com configuração prévia
   
4. **MZ Group Auto-detectado** (confiança: 0.7)
   - Detecção automática de plataforma MZ Group
   
5. **Scraping Genérico** (confiança: 0.6)
   - Cheerio para sites estáticos
   
6. **Análise HTML** (confiança: 0.5)
   - Busca direta de links de áudio no HTML

## 🚀 Como Executar

### Opção 1: Via Script TypeScript (Recomendado)

```bash
# 1. Executar seed (se necessário)
npm run db:seed

# 2. Executar indexação completa
npx tsx scripts/indexar-tudo.ts
```

### Opção 2: Via API

```bash
# 1. Executar seed (se necessário)
npm run db:seed

# 2. Chamar API para indexar todas as empresas
curl http://localhost:3000/api/indexar
```

### Opção 3: Via Script Shell

```bash
chmod +x scripts/executar-indexacao-completa.sh
./scripts/executar-indexacao-completa.sh
```

## ⏱️ Tempo Estimado

- **Por empresa**: ~5-30 segundos (dependendo dos métodos)
- **35 empresas**: ~3-15 minutos total
- **Com delays**: ~10-20 minutos total

## 📊 O que o Sistema Faz

Para cada empresa:

1. ✅ Tenta **TODOS** os métodos disponíveis
2. ✅ Coleta resultados de todos os métodos
3. ✅ Remove duplicatas por URL
4. ✅ Ordena resultados por confiança
5. ✅ Indexa no banco de dados
6. ✅ Identifica o melhor método
7. ✅ Registra conhecimento para futuras indexações

## 📈 Monitoramento

### Ver logs em tempo real:

```bash
# Se executou em background
tail -f logs/indexacao-*.log

# Ou verificar processo
ps aux | grep "indexar-tudo"
```

### Verificar progresso no banco:

```bash
# Ver quantas empresas têm áudios
npx prisma studio
# Ou
npx tsx scripts/check-indexacao.ts
```

## 🧹 Limpeza (Opcional)

Se quiser limpar áudios antigos antes de indexar:

```typescript
// Em scripts/indexar-todas-empresas.ts
// Descomentar a linha:
await prisma.audio.deleteMany({});
```

## ✅ Verificação Final

Após a indexação, verifique:

1. **Total de empresas processadas**: Deve ser 35
2. **Taxa de sucesso**: Esperado > 50%
3. **Total de áudios**: Depende das empresas, mas esperado > 100

## 🔍 Troubleshooting

### Erro: "Nenhuma empresa encontrada"
```bash
npm run db:seed
```

### Erro: "Playwright não encontrado"
```bash
npx playwright install chromium
```

### Erro: "Timeout"
- Aumente o timeout no código
- Verifique conexão com internet
- Algumas empresas podem demorar mais

### Processo travado
```bash
# Matar processo
pkill -f "indexar-tudo"
# Ou
killall node
```

## 📝 Notas

- O sistema mantém áudios existentes (não deleta)
- Duplicatas são removidas automaticamente
- O sistema aprende qual método funciona melhor para cada empresa
- Logs detalhados são gerados para cada empresa

## 🎉 Resultado Esperado

Após a execução completa, você terá:

- ✅ Todas as 35 empresas processadas
- ✅ Todos os métodos aplicados
- ✅ Relatório detalhado de sucessos/falhas
- ✅ Identificação do melhor método por empresa
- ✅ Áudios indexados no banco de dados


