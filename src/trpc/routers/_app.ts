import { meetingsRouter } from "@/app/(dashboard)/meetings/_server/procedures";
import { createTRPCRouter } from "../init";
import { agentsRouter } from "@/app/(dashboard)/agents/_server/procedures";

export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  meetings: meetingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
