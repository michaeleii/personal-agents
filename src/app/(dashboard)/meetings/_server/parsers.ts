import { DEFAULT_PAGE } from "@/constants";
import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

import type { MeetingStatus } from "./types";

export const meetingsSearchParams = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum<MeetingStatus | "">([])
    .withDefault("")
    .withOptions({
      clearOnDefault: true,
    }),
  agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const loadSearchParams = createLoader(meetingsSearchParams);
