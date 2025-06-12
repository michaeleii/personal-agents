"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  id: string;
}

export default function MeetingView({ id }: Props) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id }));
  return <div>{JSON.stringify(data)}</div>;
}
