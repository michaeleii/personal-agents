"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";
import AgentForm from "./agent-form";
import { useAgentsFilters } from "../_hooks/use-agent-filters";
import { Input } from "@/components/ui/input";
import { DEFAULT_PAGE } from "@/constants";

export default function AgentsListHeader() {
  const [filters, setFilters] = useAgentsFilters();
  const [open, setOpen] = useState(false);

  function handleClearFilters() {
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });
  }
  return (
    <>
      <ResponsiveDialog
        title="New Agent"
        description="Create a new agent"
        open={open}
        onOpenChange={setOpen}
      >
        <AgentForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </ResponsiveDialog>
      <div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-medium">My Agents</h5>
          <Button onClick={() => setOpen(true)}>
            <PlusIcon />
            <span>New Agent</span>
          </Button>
        </div>

        <div className="flex items-center gap-x-2 p-1">
          <div className="relative">
            <Input
              placeholder="Filter by name"
              className="h-9 w-[200px] bg-white pl-7"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
          </div>
          {filters.search.length > 0 && (
            <Button onClick={handleClearFilters} variant="outline" size="sm">
              <XCircleIcon />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
