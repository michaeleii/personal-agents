import { agents } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";

export const agentsInsertSchema = createInsertSchema(agents);
