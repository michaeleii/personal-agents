import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import AgentsView from "./view";
import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorState } from "@/components/error-state";
import AgentsListHeader from "./_components/agents-list-header";

export default async function Page() {
  prefetch(trpc.agents.getMany.queryOptions());
  return (
    <>
      <AgentsListHeader />
      <HydrateClient>
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
      </HydrateClient>
    </>
  );
}
