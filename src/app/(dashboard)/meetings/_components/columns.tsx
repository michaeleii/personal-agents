"use client";
import { format, formatDistance } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { SingleMeetingsGetMany } from "../_server/types";
import GeneratedAvatar from "@/components/generated-avatar";
import { ClockFadingIcon, CornerDownRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusMap } from "@/constants";

export const columns: ColumnDef<SingleMeetingsGetMany>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <span className="font-semibold capitalize">{row.original.name}</span>
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-1">
            <CornerDownRightIcon className="text-muted-foreground size-3" />
            <span className="text-muted-foreground max-w-[200px] truncate text-sm capitalize">
              {row.original.agent.name}
            </span>
          </div>
          <GeneratedAvatar
            variant="glass"
            seed={row.original.agent.name}
            className="size-4"
          />
          <span className="text-muted-foreground text-sm">
            {row.original.startedAt
              ? format(row.original.startedAt, "MMM d")
              : ""}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const Icon = statusMap[row.original.status].icon;
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-muted-foreground capitalize [&>svg]:size-4",
            statusMap[row.original.status].color
          )}
        >
          <Icon
            className={cn(
              row.original.status === "processing" && "animate-spin"
            )}
          />
          <span>{row.original.status}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex items-center gap-x-2 capitalize [&>svg]:size-4"
      >
        <ClockFadingIcon className="text-blue-700" />
        <span>
          {row.original.endedAt && row.original.startedAt
            ? formatDistance(row.original.endedAt, row.original.startedAt)
            : "No duration"}
        </span>
      </Badge>
    ),
  },
];
