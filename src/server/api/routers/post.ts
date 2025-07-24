import { and, asc, desc, eq, inArray, isNull, lt, sql } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { post, postLike, postRetweet } from "@/server/db/schema";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(1000),
        mediaUrls: z.array(z.string().url()).optional(),
        replyToId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newPost = await ctx.db
        .insert(post)
        .values({
          content: input.content,
          mediaUrls: input.mediaUrls ? JSON.stringify(input.mediaUrls) : null,
          replyToId: input.replyToId,
          createdById: ctx.session.user.id,
        })
        .returning();

      // If this is a reply, increment the reply count of the parent post
      if (input.replyToId) {
        await ctx.db
          .update(post)
          .set({ replyCount: sql`${post.replyCount} + 1` })
          .where(eq(post.id, input.replyToId));
      }

      return newPost[0];
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const posts = await ctx.db.query.post.findMany({
        where: cursor
          ? and(
              lt(post.id, cursor),
              isNull(post.replyToId), // Only show main posts, not replies
            )
          : isNull(post.replyToId), // Only show main posts, not replies
        limit: limit + 1,
        orderBy: [desc(post.createdAt)],
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Get user interaction data if user is authenticated
      let userInteractions: Record<
        number,
        { liked: boolean; retweeted: boolean }
      > = {};

      if (ctx.session?.user?.id) {
        const postIds = posts.map((p) => p.id);

        // Get user likes
        const userLikes = await ctx.db
          .select({ postId: postLike.postId })
          .from(postLike)
          .where(
            and(
              eq(postLike.userId, ctx.session.user.id),
              inArray(postLike.postId, postIds),
            ),
          );

        // Get user retweets
        const userRetweets = await ctx.db
          .select({ originalPostId: postRetweet.originalPostId })
          .from(postRetweet)
          .where(
            and(
              eq(postRetweet.userId, ctx.session.user.id),
              inArray(postRetweet.originalPostId, postIds),
            ),
          );

        // Create interaction map
        userInteractions = postIds.reduce(
          (acc, postId) => {
            acc[postId] = {
              liked: userLikes.some((like) => like.postId === postId),
              retweeted: userRetweets.some(
                (retweet) => retweet.originalPostId === postId,
              ),
            };
            return acc;
          },
          {} as Record<number, { liked: boolean; retweeted: boolean }>,
        );
      }

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: posts.map((p) => ({
          ...p,
          userInteractions: userInteractions[p.id] ?? {
            liked: false,
            retweeted: false,
          },
        })),
        nextCursor,
      };
    }),

  getComments: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { postId, limit, cursor } = input;

      const comments = await ctx.db.query.post.findMany({
        where: cursor
          ? and(eq(post.replyToId, postId), lt(post.id, cursor))
          : eq(post.replyToId, postId),
        limit: limit + 1,
        orderBy: [asc(post.createdAt)],
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Get user interaction data if user is authenticated
      let userInteractions: Record<
        number,
        { liked: boolean; retweeted: boolean }
      > = {};

      if (ctx.session?.user?.id) {
        const commentIds = comments.map((c) => c.id);

        // Get user likes for comments
        const userLikes = await ctx.db
          .select({ postId: postLike.postId })
          .from(postLike)
          .where(
            and(
              eq(postLike.userId, ctx.session.user.id),
              inArray(postLike.postId, commentIds),
            ),
          );

        // Create interaction map
        userInteractions = commentIds.reduce(
          (acc, commentId) => {
            acc[commentId] = {
              liked: userLikes.some((like) => like.postId === commentId),
              retweeted: false, // Comments typically can't be retweeted
            };
            return acc;
          },
          {} as Record<number, { liked: boolean; retweeted: boolean }>,
        );
      }

      let nextCursor: typeof cursor | undefined = undefined;
      if (comments.length > limit) {
        const nextItem = comments.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: comments.map((c) => ({
          ...c,
          userInteractions: userInteractions[c.id] ?? {
            liked: false,
            retweeted: false,
          },
        })),
        nextCursor,
      };
    }),

  like: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db
        .select()
        .from(postLike)
        .where(
          and(
            eq(postLike.postId, input.postId),
            eq(postLike.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (existingLike.length > 0) {
        // Unlike
        await ctx.db
          .delete(postLike)
          .where(
            and(
              eq(postLike.postId, input.postId),
              eq(postLike.userId, ctx.session.user.id),
            ),
          );

        // Decrease like count
        await ctx.db
          .update(post)
          .set({ likeCount: sql`${post.likeCount} - 1` })
          .where(eq(post.id, input.postId));

        return { liked: false };
      } else {
        // Like
        await ctx.db.insert(postLike).values({
          postId: input.postId,
          userId: ctx.session.user.id,
        });

        // Increase like count
        await ctx.db
          .update(post)
          .set({ likeCount: sql`${post.likeCount} + 1` })
          .where(eq(post.id, input.postId));

        return { liked: true };
      }
    }),

  retweet: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existingRetweet = await ctx.db
        .select()
        .from(postRetweet)
        .where(
          and(
            eq(postRetweet.originalPostId, input.postId),
            eq(postRetweet.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (existingRetweet.length > 0) {
        // Unretweet
        await ctx.db
          .delete(postRetweet)
          .where(
            and(
              eq(postRetweet.originalPostId, input.postId),
              eq(postRetweet.userId, ctx.session.user.id),
            ),
          );

        // Decrease retweet count
        await ctx.db
          .update(post)
          .set({ retweetCount: sql`${post.retweetCount} - 1` })
          .where(eq(post.id, input.postId));

        return { retweeted: false };
      } else {
        // Retweet
        await ctx.db.insert(postRetweet).values({
          originalPostId: input.postId,
          retweetPostId: input.postId, // For now, we'll use the same post ID
          userId: ctx.session.user.id,
        });

        // Increase retweet count
        await ctx.db
          .update(post)
          .set({ retweetCount: sql`${post.retweetCount} + 1` })
          .where(eq(post.id, input.postId));

        return { retweeted: true };
      }
    }),

  delete: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the post
      const postToDelete = await ctx.db
        .select()
        .from(post)
        .where(
          and(
            eq(post.id, input.postId),
            eq(post.createdById, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (postToDelete.length === 0) {
        throw new Error(
          "Post not found or you don't have permission to delete it",
        );
      }

      // Delete the post (cascade will handle related records)
      await ctx.db.delete(post).where(eq(post.id, input.postId));

      return { success: true };
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.post.findFirst({
      orderBy: (post, { desc }) => [desc(post.createdAt)],
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
