import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { paper } from "@/server/db/schema";

export const paperRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        courseName: z.string().min(2),
        courseCode: z.string().min(1),
        professorName: z.string().min(2),
        semester: z.string().min(1),
        department: z.string().min(1),
        paperType: z.enum(["midterm", "final"]),
        paperPdfUrl: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(paper).values({
        courseName: input.courseName,
        courseCode: input.courseCode,
        professorName: input.professorName,
        semester: input.semester,
        department: input.department,
        paperType: input.paperType,
        paperPdfUrl: input.paperPdfUrl,
        createdById: ctx.session.user.id,
      });

      return result;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const paperResult = await ctx.db.query.paper.findFirst({
        where: eq(paper.id, input.id),
      });

      return paperResult;
    }),

  search: publicProcedure
    .input(
      z.object({
        searchTerm: z.string().optional(),
        department: z.string().optional(),
        semester: z.string().optional(),
        paperType: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      // Handle search term with OR logic
      if (input.searchTerm) {
        const searchConditions = [
          like(paper.courseName, `%${input.searchTerm}%`),
          like(paper.courseCode, `%${input.searchTerm}%`),
          like(paper.professorName, `%${input.searchTerm}%`),
        ];
        conditions.push(or(...searchConditions));
      }

      // Handle filters with AND logic
      if (input.department && input.department !== "All") {
        conditions.push(eq(paper.department, input.department));
      }

      if (input.semester && input.semester !== "All") {
        conditions.push(eq(paper.semester, input.semester));
      }

      if (input.paperType && input.paperType !== "All") {
        conditions.push(eq(paper.paperType, input.paperType));
      }

      const papers = await ctx.db.query.paper.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(paper.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });

      return papers;
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const papers = await ctx.db.query.paper.findMany({
        orderBy: [desc(paper.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });

      return papers;
    }),
});
