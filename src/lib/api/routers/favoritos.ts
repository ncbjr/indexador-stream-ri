import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/api/trpc";

export const favoritosRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.favorito.findMany({
      where: { userId: ctx.session.id },
      orderBy: { createdAt: "desc" },
      include: {
        audio: {
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
        },
      },
    });
  }),

  toggle: protectedProcedure
    .input(z.object({ audioId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.favorito.findUnique({
        where: {
          userId_audioId: {
            userId: ctx.session.id,
            audioId: input.audioId,
          },
        },
      });

      if (existing) {
        await ctx.db.favorito.delete({
          where: { id: existing.id },
        });
        return { favorited: false };
      }

      await ctx.db.favorito.create({
        data: {
          userId: ctx.session.id,
          audioId: input.audioId,
        },
      });
      return { favorited: true };
    }),

  isFavorited: protectedProcedure
    .input(z.object({ audioId: z.string() }))
    .query(async ({ ctx, input }) => {
      const favorito = await ctx.db.favorito.findUnique({
        where: {
          userId_audioId: {
            userId: ctx.session.id,
            audioId: input.audioId,
          },
        },
      });
      return !!favorito;
    }),
});

