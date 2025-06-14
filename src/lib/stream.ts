import "server-only";
import { env } from "@/env";
import { StreamClient } from "@stream-io/node-sdk";

export const stream = new StreamClient(
  env.NEXT_PUBLIC_STREAM_API_KEY,
  env.STREAM_API_SECRET
);
