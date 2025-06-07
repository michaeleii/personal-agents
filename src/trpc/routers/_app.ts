import { createTRPCRouter } from "../init";
import { agentsRouter } from "@/app/(dashboard)/agents/_server/procedures";
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
