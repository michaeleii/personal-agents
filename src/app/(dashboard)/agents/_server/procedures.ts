import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  agentIdSchema,
  agentsInsertSchema,
  agentsUpdateSchema,
} from "./schema";
import { z } from "zod";
import { and, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";

export const agentsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(agentIdSchema)
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const existingAgent = await db
        .select({
          ...getTableColumns(agents),
          meetingCount: db.$count(meetings, eq(agents.id, meetings.agentId)),
        })
        .from(agents)
        .where(and(eq(agents.id, id), eq(agents.userId, ctx.user.id)))
        .then((res) => res.at(0));

      if (!existingAgent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }
      return existingAgent;
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
        .select({
          ...getTableColumns(agents),
          meetingCount: db.$count(meetings, eq(agents.id, meetings.agentId)),
        })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined
          )
        )
        .orderBy(desc(agents.createdAt), desc(agents.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const totalPages = Math.ceil(data.length / pageSize);
      return {
        items: data,
        totalPages,
      };
    }),
  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { name, instructions, voice } = input;
      return await db
        .insert(agents)
        .values({ name, instructions, voice, userId: user.id })
        .returning()
        .then((res) => res[0]);
    }),
  delete: protectedProcedure
    .input(agentIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { id } = input;
      const deletedAgent = await db
        .delete(agents)
        .where(and(eq(agents.id, id), eq(agents.userId, user.id)))
        .returning()
        .then((res) => res.at(0));

      if (!deletedAgent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }
      return deletedAgent;
    }),
  update: protectedProcedure
    .input(agentsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { id, name, instructions, voice } = input;
      const updatedAgent = await db
        .update(agents)
        .set({
          name,
          instructions,
          voice,
        })
        .where(and(eq(agents.id, id), eq(agents.userId, user.id)))
        .returning()
        .then((res) => res.at(0));

      if (!updatedAgent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }
      return updatedAgent;
    }),
});
