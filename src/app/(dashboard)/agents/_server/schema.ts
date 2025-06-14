import { z } from "zod";

export const agentsInsertSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  instructions: z.string().trim().min(1, "Instructions is required"),
});

export const agentIdSchema = z.object({
  id: z.string().trim().min(1, "Id is required"),
});

export const agentsUpdateSchema = agentsInsertSchema.merge(agentIdSchema);
