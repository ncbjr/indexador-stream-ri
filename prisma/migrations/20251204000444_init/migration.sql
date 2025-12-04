-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "site_ri" TEXT NOT NULL,
    "youtube_channel" TEXT,
    "logo_url" TEXT,
    "fonte" TEXT NOT NULL DEFAULT 'youtube',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audios" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "source_url" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "youtube_id" TEXT,
    "thumbnail_url" TEXT,
    "duracao" INTEGER,
    "data_evento" TIMESTAMP(3) NOT NULL,
    "trimestre" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_items" (
    "id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "playlist_id" TEXT NOT NULL,
    "audio_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "audio_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "audio_id" TEXT NOT NULL,
    "posicao" INTEGER NOT NULL DEFAULT 0,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "last_played" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indexing_logs" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "fonte" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mensagem" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indexing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_ticker_key" ON "empresas"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_items_playlist_id_audio_id_key" ON "playlist_items"("playlist_id", "audio_id");

-- CreateIndex
CREATE UNIQUE INDEX "favoritos_user_id_audio_id_key" ON "favoritos"("user_id", "audio_id");

-- CreateIndex
CREATE UNIQUE INDEX "historico_user_id_audio_id_key" ON "historico"("user_id", "audio_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audios" ADD CONSTRAINT "audios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_audio_id_fkey" FOREIGN KEY ("audio_id") REFERENCES "audios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_audio_id_fkey" FOREIGN KEY ("audio_id") REFERENCES "audios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico" ADD CONSTRAINT "historico_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico" ADD CONSTRAINT "historico_audio_id_fkey" FOREIGN KEY ("audio_id") REFERENCES "audios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
