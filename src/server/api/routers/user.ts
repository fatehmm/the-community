import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { user } from "@/server/db/schema";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.email(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(user)
        .set({
          name: input.name,
          image: input.image,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.session.user.id));

      return result;
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userProfile = await ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
    });

    return userProfile;
  }),
});
