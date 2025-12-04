import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/lib/api/trpc";

export const audiosRouter = createTRPCRouter({
  listRecent: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        tipo: z.string().optional(), // "resultado", "investor_day", "evento", "guidance", etc.
      })
    )
    .query(async ({ ctx, input }) => {
      const audios = await ctx.db.audio.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: input.tipo ? { tipo: input.tipo } : undefined,
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

  // Listar tipos disponíveis
  listTipos: publicProcedure.query(async ({ ctx }) => {
    const tipos = await ctx.db.audio.groupBy({
      by: ["tipo"],
      _count: { tipo: true },
      orderBy: { _count: { tipo: "desc" } },
    });
    return tipos.map((t) => ({ tipo: t.tipo, count: t._count.tipo }));
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

  // Listar áudios das empresas do índice AUVP11
  listAUVP11: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        tipo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Tickers que fazem parte do índice AUVP11
      const AUVP11_TICKERS = [
        "ITUB4", "BBDC4", "SBSP3", "B3SA3", "ITSA4", "BPAC11", "WEGE3", "BBAS3",
        "ABEV3", "PRIO3", "TOTS3", "BBSE3", "CMIG4", "TIMS3", "ISAE4", "EGIE3",
        "CPFE3", "CMIN3", "CXSE3", "CSMG3", "SAPR11", "CYRE3", "DIRR3", "CURY3",
        "POMO4", "UNIP6", "ODPV3", "FRAS3", "ABCB4", "LEVE3", "INTB3"
      ];

      // Buscar empresas AUVP11
      const empresas = await ctx.db.empresa.findMany({
        where: { ticker: { in: AUVP11_TICKERS } },
        select: { id: true },
      });

      const empresaIds = empresas.map((e) => e.id);

      return ctx.db.audio.findMany({
        where: {
          empresaId: { in: empresaIds },
          ...(input.tipo ? { tipo: input.tipo } : {}),
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

