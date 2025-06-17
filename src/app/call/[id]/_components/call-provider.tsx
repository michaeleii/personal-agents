"use client";

import type { MeetingsGetOne } from "@/app/(dashboard)/meetings/_server/types";
import type { User } from "better-auth";
import CallConnect from "./call-connect";

interface Props {
  meeting: MeetingsGetOne;
  user: User;
}

export default function CallProvider({ meeting, user }: Props) {
  return <CallConnect meeting={meeting} user={user} />;
}
