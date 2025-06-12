import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import MeetingsView from "./view";
import { ErrorState } from "@/components/error-state";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingState } from "@/components/loading-state";
import { Suspense } from "react";

export default function Page() {
  prefetch(trpc.meetings.getMany.queryOptions({}));
  return (
    <HydrateClient>
      <Suspense
        fallback={
          <LoadingState
            title="Loading Meetings"
            description="This may take a few seconds..."
          />
        }
      >
        <ErrorBoundary
          fallback={
            <ErrorState
              title="Failed to load meetings"
              description="Please try again later"
            />
          }
        >
          <MeetingsView />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
