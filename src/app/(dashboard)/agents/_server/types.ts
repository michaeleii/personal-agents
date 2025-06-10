import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

export type AgentsGetOne = inferRouterOutputs<AppRouter>["agents"]["getOne"];
export type SingleAgentsGetMany =
  inferRouterOutputs<AppRouter>["agents"]["getMany"]["items"][0];
