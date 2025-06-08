import { z } from "zod";

export const agentsInsertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  instructions: z.string().min(1, "Instructions is required"),
});

export type AgentsInsert = z.infer<typeof agentsInsertSchema>;
