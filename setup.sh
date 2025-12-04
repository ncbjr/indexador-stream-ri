#!/bin/bash
# Script de setup do RI Stream

set -e

echo "🚀 Iniciando setup do RI Stream..."

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cat > .env << 'EOF'
# Banco de Dados
DATABASE_URL="postgresql://ristream:ristream_dev_2024@localhost:5432/ristream?schema=public"

# NextAuth
NEXTAUTH_SECRET="super-secret-key-change-in-production-abc123xyz"
NEXTAUTH_URL="http://localhost:3000"

# YouTube Data API v3
YOUTUBE_API_KEY=""

# Inngest
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
EOF
    echo "✅ Arquivo .env criado"
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Subir banco de dados (usando docker compose com espaço)
echo "🐘 Iniciando PostgreSQL..."
docker compose up -d db
sleep 5

# Verificar se o banco está rodando
echo "⏳ Aguardando banco de dados..."
until docker compose exec -T db pg_isready -U ristream -d ristream > /dev/null 2>&1; do
    sleep 2
done
echo "✅ PostgreSQL pronto"

# Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
npx prisma generate

# Rodar migrations
echo "📦 Executando migrations..."
npx prisma migrate dev --name init

# Seed das empresas
echo "🌱 Populando banco com empresas..."
npx tsx prisma/seed.ts

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o projeto, execute:"
echo "  npm run dev"
echo ""
echo "Acesse: http://localhost:3000"
