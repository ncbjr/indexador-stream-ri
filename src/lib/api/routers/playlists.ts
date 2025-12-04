import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/api/trpc";
import { TRPCError } from "@trpc/server";

export const playlistsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.playlist.findMany({
      where: { userId: ctx.session.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          take: 4,
          orderBy: { ordem: "asc" },
          include: {
            audio: {
              select: {
                thumbnailUrl: true,
              },
            },
          },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.id },
        include: {
          items: {
            orderBy: { ordem: "asc" },
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
          },
        },
      });

      if (!playlist || playlist.userId !== ctx.session.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return playlist;
    }),

  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1).max(100),
        descricao: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.playlist.create({
        data: {
          nome: input.nome,
          descricao: input.descricao,
          userId: ctx.session.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nome: z.string().min(1).max(100).optional(),
        descricao: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.id },
      });

      if (!playlist || playlist.userId !== ctx.session.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.playlist.update({
        where: { id: input.id },
        data: {
          nome: input.nome,
          descricao: input.descricao,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.id },
      });

      if (!playlist || playlist.userId !== ctx.session.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.playlist.delete({
        where: { id: input.id },
      });
    }),

  addAudio: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        audioId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.playlistId },
      });

      if (!playlist || playlist.userId !== ctx.session.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Buscar maior ordem atual
      const lastItem = await ctx.db.playlistItem.findFirst({
        where: { playlistId: input.playlistId },
        orderBy: { ordem: "desc" },
      });

      return ctx.db.playlistItem.create({
        data: {
          playlistId: input.playlistId,
          audioId: input.audioId,
          ordem: (lastItem?.ordem ?? -1) + 1,
        },
      });
    }),

  removeAudio: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        audioId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.playlistId },
      });

      if (!playlist || playlist.userId !== ctx.session.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.playlistItem.delete({
        where: {
          playlistId_audioId: {
            playlistId: input.playlistId,
            audioId: input.audioId,
          },
        },
      });
    }),

  reorderItems: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        itemIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.playlistId },
      });

      if (!playlist || playlist.userId !== ctx.session.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updates = input.itemIds.map((id, index) =>
        ctx.db.playlistItem.update({
          where: { id },
          data: { ordem: index },
        })
      );

      await ctx.db.$transaction(updates);
      return { success: true };
    }),
});

