import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  meetingIdSchema,
  meetingInsertSchema,
  meetingUpdateSchema,
} from "./schema";
import { z } from "zod";
import { and, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  meetingStatus,
  MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";

export const meetingsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(meetingIdSchema)
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const existingMeeting = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(and(eq(meetings.id, id), eq(meetings.userId, ctx.user.id)))
        .then((res) => res.at(0));

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }
      return existingMeeting;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z.enum([...meetingStatus, ""]).nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status, agentId } = input;
      const data = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined
          )
        )
        .orderBy(desc(meetings.createdAt), desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const totalPages = Math.ceil(data.length / pageSize);
      return {
        items: data,
        totalPages,
      };
    }),
  create: protectedProcedure
    .input(meetingInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { name, agentId } = input;
      return await db
        .insert(meetings)
        .values({ name, userId: user.id, agentId })
        .returning()
        .then((res) => res[0]);
    }),
  update: protectedProcedure
    .input(meetingUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { id, name } = input;
      const updatedMeeting = await db
        .update(meetings)
        .set({
          name,
        })
        .where(and(eq(meetings.id, id), eq(meetings.userId, user.id)))
        .returning()
        .then((res) => res.at(0));

      if (!updatedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }
      return updatedMeeting;
    }),
  delete: protectedProcedure
    .input(meetingIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { id } = input;
      const deletedMeeting = await db
        .delete(meetings)
        .where(and(eq(meetings.id, id), eq(meetings.userId, user.id)))
        .returning()
        .then((res) => res.at(0));

      if (!deletedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }
      return deletedMeeting;
    }),
});
