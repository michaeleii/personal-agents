import { z } from "zod";

export const meetingIdSchema = z.object({
  id: z.string().min(1, "Id is required"),
});

export const meetingInsertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  agentId: z.string().min(1, "Agent is required"),
});

export const meetingUpdateSchema = meetingInsertSchema.merge(meetingIdSchema);

export type MeetingsInsert = z.infer<typeof meetingInsertSchema>;
export type MeetingUpdate = z.infer<typeof meetingUpdateSchema>;
