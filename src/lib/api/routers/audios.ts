import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/lib/api/trpc";

export const audiosRouter = createTRPCRouter({
  listRecent: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const audios = await ctx.db.audio.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { dataEvento: "desc" },
        include: {
          empresa: {
            select: {
              id: true,
              ticker: true,
              nome: true,
              logoUrl: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (audios.length > input.limit) {
        const nextItem = audios.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: audios,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.audio.findUnique({
        where: { id: input.id },
        include: {
          empresa: true,
        },
      });
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        empresaId: z.string().optional(),
        trimestre: z.string().optional(),
        ano: z.number().optional(),
        tipo: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.audio.findMany({
        where: {
          AND: [
            input.query
              ? {
                  OR: [
                    { titulo: { contains: input.query, mode: "insensitive" } },
                    { descricao: { contains: input.query, mode: "insensitive" } },
                  ],
                }
              : {},
            input.empresaId ? { empresaId: input.empresaId } : {},
            input.trimestre ? { trimestre: input.trimestre } : {},
            input.ano ? { ano: input.ano } : {},
            input.tipo ? { tipo: input.tipo } : {},
          ],
        },
        take: input.limit,
        orderBy: { dataEvento: "desc" },
        include: {
          empresa: {
            select: {
              id: true,
              ticker: true,
              nome: true,
              logoUrl: true,
            },
          },
        },
      });
    }),

  getByEmpresa: publicProcedure
    .input(
      z.object({
        empresaId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.audio.findMany({
        where: { empresaId: input.empresaId },
        take: input.limit,
        orderBy: { dataEvento: "desc" },
        include: {
          empresa: {
            select: {
              id: true,
              ticker: true,
              nome: true,
              logoUrl: true,
            },
          },
        },
      });
    }),

  // Registrar reprodução no histórico
  registerPlay: protectedProcedure
    .input(z.object({ audioId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.historico.upsert({
        where: {
          userId_audioId: {
            userId: ctx.session.id,
            audioId: input.audioId,
          },
        },
        update: {
          lastPlayed: new Date(),
        },
        create: {
          userId: ctx.session.id,
          audioId: input.audioId,
        },
      });
    }),

  // Atualizar posição de reprodução
  updatePosition: protectedProcedure
    .input(
      z.object({
        audioId: z.string(),
        posicao: z.number(),
        completado: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.historico.upsert({
        where: {
          userId_audioId: {
            userId: ctx.session.id,
            audioId: input.audioId,
          },
        },
        update: {
          posicao: input.posicao,
          completado: input.completado,
          lastPlayed: new Date(),
        },
        create: {
          userId: ctx.session.id,
          audioId: input.audioId,
          posicao: input.posicao,
          completado: input.completado ?? false,
        },
      });
    }),
});

