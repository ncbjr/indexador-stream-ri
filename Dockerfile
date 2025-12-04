# Dockerfile para desenvolvimento
FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema necessárias para Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libc6-compat

# Configurar Playwright para usar Chromium do sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

# Gerar Prisma Client
RUN npx prisma generate || true

# Expor porta
EXPOSE 3000

# Comando para desenvolvimento
CMD ["npm", "run", "dev"]

