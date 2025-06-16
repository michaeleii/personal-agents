import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import type { meetingInsertSchema, meetingUpdateSchema } from "./schema";
import type { z } from "zod";
import type { meetingStatus } from "@/constants";

export type MeetingsGetOne =
  inferRouterOutputs<AppRouter>["meetings"]["getOne"];
export type SingleMeetingsGetMany =
  inferRouterOutputs<AppRouter>["meetings"]["getMany"]["items"][0];

export type MeetingsInsert = z.infer<typeof meetingInsertSchema>;
export type MeetingUpdate = z.infer<typeof meetingUpdateSchema>;
export type MeetingStatus = (typeof meetingStatus)[number];

export interface StreamTranscriptItem {
  speaker_id: string;
  type: string;
  text: string;
  start_ts: number;
  stop_ts: number;
}
