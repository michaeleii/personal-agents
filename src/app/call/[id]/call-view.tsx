"use client";
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import CallConnect from "./_components/call-connect";

interface Props {
  id: string;
  userName: string;
  userImage: string;
  userId: string;
}

export default function CallView({ id, userId, userImage, userName }: Props) {
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

  return (
    <CallConnect
      meetingId={meeting.id}
      meetingName={meeting.name}
      userId={userId}
      userName={userName}
      userImage={userImage}
    />
  );
}
