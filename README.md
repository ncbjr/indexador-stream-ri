# RI Stream 🎧

Plataforma de streaming de áudios de Relações com Investidores (RI) das empresas listadas na B3. Um "Spotify de RI" que indexa, organiza e permite ouvir webcasts de resultados trimestrais.

## 🚀 Funcionalidades

- **Feed de Áudios**: Visualize os webcasts mais recentes de todas as empresas
- **Página por Empresa**: Acesse todos os áudios de uma empresa específica
- **Busca Avançada**: Encontre webcasts por empresa, trimestre ou palavras-chave
- **Player Persistente**: Ouça áudios enquanto navega pelo site
- **Playlists**: Organize seus webcasts favoritos em playlists personalizadas
- **Favoritos**: Marque áudios para ouvir depois
- **Histórico**: Continue de onde parou

## 🏗️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: tRPC + Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Background Jobs**: Inngest
- **Player**: YouTube embarcado (react-youtube) + HTML5 Audio
- **Autenticação**: Custom JWT com bcrypt

## 📦 Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Conta no Google Cloud (para YouTube Data API)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/ri-stream.git
cd ri-stream
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp env.example .env
```

Edite o arquivo `.env` e configure:
- `DATABASE_URL`: URL de conexão com PostgreSQL
- `NEXTAUTH_SECRET`: Chave secreta para JWT
- `YOUTUBE_API_KEY`: Chave da API do YouTube

### 4. Inicie o banco de dados

```bash
docker-compose up -d db
```

### 5. Execute as migrations e seed

```bash
npm run db:migrate
npm run db:seed
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔑 Configurando a YouTube Data API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a "YouTube Data API v3"
4. Crie uma credencial do tipo "API Key"
5. Copie a chave para o `.env` na variável `YOUTUBE_API_KEY`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home - Feed de áudios
│   ├── empresas/[ticker]/ # Página da empresa
│   ├── buscar/            # Busca avançada
│   ├── playlists/         # Gerenciar playlists
│   ├── favoritos/         # Áudios favoritos
│   ├── login/             # Login
│   └── registro/          # Cadastro
├── components/            # Componentes React
│   ├── AudioPlayer.tsx    # Player de áudio
│   ├── AudioCard.tsx      # Card de áudio
│   ├── EmpresaCard.tsx    # Card de empresa
│   └── ...
├── lib/
│   ├── api/               # tRPC routers
│   ├── auth/              # Autenticação
│   ├── db/                # Prisma client
│   ├── indexers/          # Indexadores (YouTube, Scraping)
│   ├── inngest/           # Background jobs
│   └── trpc/              # Cliente tRPC
└── prisma/
    ├── schema.prisma      # Schema do banco
    └── seed.ts            # Seed das empresas
```

## 🎯 Empresas do MVP

| Ticker | Empresa | Fonte |
|--------|---------|-------|
| PETR4 | Petrobras | YouTube |
| VALE3 | Vale | YouTube |
| ITUB4 | Itaú Unibanco | YouTube |
| BBDC4 | Bradesco | Scraping |
| B3SA3 | B3 | YouTube |
| WEGE3 | WEG | Scraping |
| ABEV3 | Ambev | YouTube |
| MGLU3 | Magazine Luiza | YouTube |
| RENT3 | Localiza | Scraping |
| BBAS3 | Banco do Brasil | YouTube |

## 🐳 Docker

### Desenvolvimento completo com Docker

```bash
docker-compose up -d
```

Isso inicia:
- PostgreSQL na porta 5432
- Aplicação Next.js na porta 3000

### Apenas o banco de dados

```bash
docker-compose up -d db
```

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Executa migrations |
| `npm run db:seed` | Popula o banco com empresas |
| `npm run db:studio` | Abre o Prisma Studio |
| `npm run docker:up` | Inicia containers Docker |
| `npm run docker:down` | Para containers Docker |

## 🔄 Indexação de Áudios

A indexação de áudios é feita automaticamente pelo Inngest:
- **Diariamente às 6h**: Indexa todas as empresas
- **A cada 4h**: Verifica novos conteúdos

Para disparar manualmente, acesse `/api/inngest` no Inngest Dev Server.

## 📝 Licença

MIT
