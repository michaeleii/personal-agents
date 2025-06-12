"use client";
import { format, formatDistance } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { SingleMeetingsGetMany } from "../_server/types";
import GeneratedAvatar from "@/components/generated-avatar";
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockArrowUpIcon,
  ClockFadingIcon,
  CornerDownRightIcon,
  LoaderIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MeetingStatus } from "@/constants";
import { cn } from "@/lib/utils";

const statusMap: Record<
  MeetingStatus,
  {
    icon: LucideIcon;
    color: string;
  }
> = {
  upcoming: {
    icon: ClockArrowUpIcon,
    color: "bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
  },
  active: {
    icon: LoaderIcon,
    color: "bg-blue-500/20 text-blue-800 border-blue-800/5",
  },
  completed: {
    icon: CircleCheckIcon,
    color: "bg-emerald-500/20 text-emerald-800 border-emerald-800/5",
  },
  processing: {
    icon: LoaderIcon,
    color: "bg-gray-300/20 text-gray-800 border-gray-800/5",
  },
  cancelled: {
    icon: CircleXIcon,
    color: "bg-rose-500/20 text-rose-800 border-rose-800/5",
  },
};

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
