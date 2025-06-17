import {
  CircleCheckIcon,
  CircleXIcon,
  ClockArrowUpIcon,
  LoaderIcon,
  VideoIcon,
  type LucideIcon,
} from "lucide-react";
import type { MeetingStatus } from "./app/(dashboard)/meetings/_server/types";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;

export const meetingStatus = [
  "upcoming",
  "active",
  "completed",
  "processing",
  "cancelled",
] as const;

export const agentVoices = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "sage",
  "shimmer",
  "verse",
] as const;

export const statusMap: Record<
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
    icon: VideoIcon,
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
