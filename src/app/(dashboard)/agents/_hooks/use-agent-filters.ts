import { useQueryStates } from "nuqs";

import { agentsSearchParams } from "../_server/parsers";

export function useAgentsFilters() {
  return useQueryStates(agentsSearchParams);
}
