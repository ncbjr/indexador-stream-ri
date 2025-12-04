import { createTRPCRouter } from "./trpc";
import { empresasRouter } from "./routers/empresas";
import { audiosRouter } from "./routers/audios";
import { favoritosRouter } from "./routers/favoritos";
import { playlistsRouter } from "./routers/playlists";
import { authRouter } from "./routers/auth";

export const appRouter = createTRPCRouter({
  empresas: empresasRouter,
  audios: audiosRouter,
  favoritos: favoritosRouter,
  playlists: playlistsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;

