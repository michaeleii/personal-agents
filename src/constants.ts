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

export type MeetingStatus = (typeof meetingStatus)[number];
