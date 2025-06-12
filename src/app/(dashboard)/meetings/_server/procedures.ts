import { db } from "@/db";
import { meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  meetingIdSchema,
  //   agentsInsertSchema,
  //   agentsUpdateSchema,
} from "./schema";
import { z } from "zod";
import { and, desc, eq, ilike } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";

export const meetingsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(meetingIdSchema)
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const existingMeeting = await db
        .select()
        .from(meetings)
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
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const data = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined
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
  //   create: protectedProcedure
  //     .input(agentsInsertSchema)
  //     .mutation(async ({ ctx, input }) => {
  //       const { user } = ctx;
  //       const { name, instructions } = input;
  //       return await db
  //         .insert(meetings)
  //         .values({ userId: user.id, agentId })
  //         .returning()
  //         .then((res) => res[0]);
  //     }),
  //   delete: protectedProcedure
  //     .input(agentIdSchema)
  //     .mutation(async ({ ctx, input }) => {
  //       const { user } = ctx;
  //       const { id } = input;
  //       const deletedAgent = await db
  //         .delete(agents)
  //         .where(and(eq(agents.id, id), eq(agents.userId, user.id)))
  //         .returning()
  //         .then((res) => res.at(0));

  //       if (!deletedAgent) {
  //         throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
  //       }
  //       return deletedAgent;
  //     }),
  //   update: protectedProcedure
  //     .input(agentsUpdateSchema)
  //     .mutation(async ({ ctx, input }) => {
  //       const { user } = ctx;
  //       const { id, name, instructions } = input;
  //       const updatedAgent = await db
  //         .update(agents)
  //         .set({
  //           name,
  //           instructions,
  //         })
  //         .where(and(eq(agents.id, id), eq(agents.userId, user.id)))
  //         .returning()
  //         .then((res) => res.at(0));

  //       if (!updatedAgent) {
  //         throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
  //       }
  //       return updatedAgent;
  //     }),
});
