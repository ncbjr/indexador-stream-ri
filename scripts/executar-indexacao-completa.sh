#!/bin/bash

# Script para executar seed e indexação completa de todas as empresas

echo "🚀 Iniciando processo completo de indexação..."
echo ""

# 1. Executar seed
echo "📦 Passo 1/2: Executando seed do banco de dados..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Erro ao executar seed. Abortando."
    exit 1
fi

echo ""
echo "✅ Seed concluído com sucesso!"
echo ""

# 2. Indexar todas as empresas via API
echo "📦 Passo 2/2: Indexando todas as empresas com sistema adaptativo..."
echo "   Isso pode demorar vários minutos..."
echo ""

# Tentar diferentes portas
for porta in 3000 3001 3002 3003; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$porta/api/indexar" 2>/dev/null)
    if [ "$response" = "200" ] || [ "$response" = "000" ]; then
        echo "   Tentando porta $porta..."
        curl -s "http://localhost:$porta/api/indexar" | jq '.' || echo "   Resposta recebida (pode estar processando em background)"
        break
    fi
done

echo ""
echo "✨ Processo concluído!"
echo ""
echo "💡 Dica: Verifique os logs do servidor para acompanhar o progresso."


