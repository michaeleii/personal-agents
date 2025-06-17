import "server-only";
import { env } from "@/env";
import { StreamClient } from "@stream-io/node-sdk";
import { StreamChat } from "stream-chat";

export const stream = new StreamClient(
  env.NEXT_PUBLIC_STREAM_API_KEY,
  env.STREAM_API_SECRET
);

export const streamChat = StreamChat.getInstance(
  env.NEXT_PUBLIC_STREAM_API_KEY,
  env.STREAM_API_SECRET
);
