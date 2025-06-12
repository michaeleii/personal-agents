import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";
import type { z } from "zod";
import type { agentsInsertSchema, agentsUpdateSchema } from "./schema";

export type AgentsGetOne = inferRouterOutputs<AppRouter>["agents"]["getOne"];
export type SingleAgentsGetMany =
  inferRouterOutputs<AppRouter>["agents"]["getMany"]["items"][0];

export type AgentsInsert = z.infer<typeof agentsInsertSchema>;
export type AgentsUpdate = z.infer<typeof agentsUpdateSchema>;
