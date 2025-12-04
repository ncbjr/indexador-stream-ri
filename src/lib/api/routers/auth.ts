import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/lib/api/trpc";
import { registerUser, loginUser, deleteSession } from "@/lib/auth";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const user = await registerUser(input.email, input.password, input.name);
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Erro ao criar conta",
        });
      }
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { user, token } = await loginUser(input.email, input.password);
        return {
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error instanceof Error ? error.message : "Credenciais inválidas",
        });
      }
    }),

  logout: protectedProcedure.mutation(async () => {
    await deleteSession();
    return { success: true };
  }),

  me: publicProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),
});

