import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AgentsView from "./view";
import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorState } from "@/components/error-state";

export default async function Page() {
  const qc = getQueryClient();
  void qc.prefetchQuery(trpc.agents.getMany.queryOptions());
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Suspense
        fallback={
          <LoadingState
            title="Loading Agents"
            description="This may take a few seconds..."
          />
        }
      >
        <ErrorBoundary
          fallback={
            <ErrorState
              title="Failed to load agents"
              description="Please try again later"
            />
          }
        >
          <AgentsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}
