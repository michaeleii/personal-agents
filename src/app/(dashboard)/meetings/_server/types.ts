import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

export type MeetingsGetOne =
  inferRouterOutputs<AppRouter>["meetings"]["getOne"];
export type SingleMeetingsGetMany =
  inferRouterOutputs<AppRouter>["meetings"]["getMany"]["items"][0];
