import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/lib/api/trpc";

export const empresasRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.empresa.findMany({
      orderBy: { ticker: "asc" },
      include: {
        _count: {
          select: { audios: true },
        },
      },
    });
  }),

  getByTicker: publicProcedure
    .input(z.object({ ticker: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.empresa.findUnique({
        where: { ticker: input.ticker.toUpperCase() },
        include: {
          audios: {
            orderBy: { dataEvento: "desc" },
            take: 50,
          },
        },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.empresa.findUnique({
        where: { id: input.id },
        include: {
          audios: {
            orderBy: { dataEvento: "desc" },
          },
        },
      });
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.empresa.findMany({
        where: {
          OR: [
            { ticker: { contains: input.query, mode: "insensitive" } },
            { nome: { contains: input.query, mode: "insensitive" } },
          ],
        },
        orderBy: { ticker: "asc" },
      });
    }),
});

