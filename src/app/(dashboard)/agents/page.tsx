import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import AgentsView from "./view";
import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorState } from "@/components/error-state";
import AgentsListHeader from "./_components/agents-list-header";
import type { SearchParams } from "nuqs";
import { loadSearchParams } from "./_server/parsers";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const filters = await loadSearchParams(searchParams);
  prefetch(trpc.agents.getMany.queryOptions({ ...filters }));
  return (
    <>
      <AgentsListHeader />
      <HydrateClient>
        <Suspense
          fallback={
            <LoadingState
              title="Loading Agent"
              description="This may take a few seconds..."
            />
          }
        >
          <ErrorBoundary
            fallback={
              <ErrorState
                title="Failed to load agent"
                description="Please try again later"
              />
            }
          >
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </>
  );
}
