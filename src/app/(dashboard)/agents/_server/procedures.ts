import { db } from "@/db";
import { agents } from "@/db/schema";
import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { agentsInsertSchema } from "./schema";
import { z } from "zod";
import { eq, getTableColumns, sql } from "drizzle-orm";

export const agentsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;
      const data = await db
        .select()
        .from(agents)
        .where(eq(agents.id, id))
        .then((res) => res[0]);
      return data;
    }),
  getMany: baseProcedure.query(async () => {
    return await db
      .select({
        ...getTableColumns(agents),
        meetingCount: sql<number>`5`,
      })
      .from(agents);
  }),
  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { name, instructions } = input;
      return await db
        .insert(agents)
        .values({ name, instructions, userId: user.id })
        .returning()
        .then((res) => res[0]);
    }),
});
