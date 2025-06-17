"use client";
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { User } from "better-auth";

import CallProvider from "./_components/call-provider";

interface Props {
  id: string;
  user: User;
}

export default function CallView({ id, user }: Props) {
  const trpc = useTRPC();
  const { data: meeting } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id })
  );

  if (meeting.status === "completed") {
    return (
      <div className="flex h-dvh items-center justify-center">
        <ErrorState
          title="Meeting has ended"
          description="You can no longer join this meeting"
        />
      </div>
    );
  }

  return <CallProvider meeting={meeting} user={user} />;
}
