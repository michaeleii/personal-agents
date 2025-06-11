import { z } from "zod";

export const agentsInsertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  instructions: z.string().min(1, "Instructions is required"),
});

export const agentIdSchema = z.object({
  id: z.string().min(1, "Id is required"),
});

export const agentsUpdateSchema = agentsInsertSchema.merge(agentIdSchema);

export type AgentsInsert = z.infer<typeof agentsInsertSchema>;
export type AgentsUpdate = z.infer<typeof agentsUpdateSchema>;
