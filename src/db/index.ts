import { env } from "@/env";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

export const db = drizzle(env.DATABASE_URL, {
  schema,
  casing: "snake_case",
});
