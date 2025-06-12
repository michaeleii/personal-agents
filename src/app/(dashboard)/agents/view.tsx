"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";
import { EmptyState } from "@/components/empty-state";
import { useAgentsFilters } from "./_hooks/use-agent-filters";
import { DataPagination } from "@/components/data-pagination";
import type { SingleAgentsGetMany } from "./_server/types";
import { useRouter } from "next/navigation";

export default function AgentsView() {
  const router = useRouter();
  const trpc = useTRPC();
  const [filters, setFilters] = useAgentsFilters();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions(filters));

  function handleRowClick(row: SingleAgentsGetMany) {
    router.push(`/agents/${row.id}`);
  }
  return (
    <div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
      <DataTable
        columns={columns}
        data={data.items}
        header={false}
        onRowClick={handleRowClick}
      />
      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
      {data.items.length === 0 && (
        <EmptyState
          title="Create your first agent"
          description="Create an agent to join your meetings. Each agent will follow your instructions and can interact with participants during the call."
        />
      )}
    </div>
  );
}
