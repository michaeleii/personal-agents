"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, XCircleIcon } from "lucide-react";
import { useMemo, useState } from "react";
import MeetingForm from "./meeting-form";
import { Input } from "@/components/ui/input";
import { useQueryStates } from "nuqs";
import { meetingsSearchParams } from "../_server/parsers";
import { DEFAULT_PAGE, statusMap } from "@/constants";
import type { MeetingStatus } from "../_server/types";
import { CommandSelect } from "@/components/command-select";
import { meetingStatus } from "@/constants";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import GeneratedAvatar from "@/components/generated-avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const options = meetingStatus.map((status) => {
  const Icon = statusMap[status].icon;
  return {
    id: status,
    value: status,
    children: (
      <div className={"flex items-center gap-x-2 rounded-lg p-2 capitalize"}>
        <Icon />
        <span>{status}</span>
      </div>
    ),
  };
});

export default function MeetingsListHeader() {
  const [filters, setFilters] = useQueryStates(meetingsSearchParams);
  const [search, setSearch] = useState("");
  const trpc = useTRPC();
  const agents = useQuery(
    trpc.agents.getMany.queryOptions({ pageSize: 100, search })
  );
  const [open, setOpen] = useState(false);
  function handleClearFilters() {
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
      status: "",
      agentId: "",
    });
  }

  const isFilterModified =
    !!filters.search || !!filters.agentId || !!filters.status;

  const commandSelectOptions = useMemo(
    () =>
      (agents?.data?.items ?? []).map((agent) => ({
        id: agent.id,
        value: agent.id,
        children: (
          <div className="flex items-center gap-x-2">
            <GeneratedAvatar
              seed={agent.name}
              variant="glass"
              className="size-6 border"
            />
            <span>{agent.name}</span>
          </div>
        ),
      })),
    [agents?.data?.items]
  );
  return (
    <>
      <ResponsiveDialog
        title="New Meeting"
        description="Create a new meeting"
        open={open}
        onOpenChange={setOpen}
      >
        <MeetingForm
          onSuccess={() => {
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </ResponsiveDialog>
      <div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-medium">My Meetings</h5>
          <Button onClick={() => setOpen(true)}>
            <PlusIcon />
            <span>New Meeting</span>
          </Button>
        </div>
        <ScrollArea>
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
            <CommandSelect
              options={options}
              onSelect={(value) =>
                setFilters({ status: value as MeetingStatus })
              }
              value={filters.status}
            />
            <CommandSelect
              className="h-9"
              placeholder="Filter by agent"
              options={commandSelectOptions}
              onSelect={(value) => setFilters({ agentId: value })}
              onSearch={setSearch}
              value={filters.agentId ?? ""}
            />
            {isFilterModified && (
              <Button onClick={handleClearFilters} variant="outline" size="sm">
                <XCircleIcon />
                <span>Clear</span>
              </Button>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
}
