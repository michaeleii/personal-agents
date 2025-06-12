"use client";
import { DataTable } from "@/components/data-table";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "./_components/columns";
import { useRouter } from "next/navigation";
import type { SingleMeetingsGetMany } from "./_server/types";
import { EmptyState } from "@/components/empty-state";

export default function MeetingsView() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));
  const router = useRouter();

  function handleRowClick(row: SingleMeetingsGetMany) {
    router.push(`/meetings/${row.id}`);
  }
  return (
    <div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
      <DataTable
        data={data.items}
        columns={columns}
        onRowClick={handleRowClick}
      />
      {data.items.length === 0 && (
        <EmptyState
          title="Create your first meeting"
          description="Schedule a meeting to connect with others. Each meeting lets you collaborate, share ideas, and interact with participants in real time."
        />
      )}
    </div>
  );
}
