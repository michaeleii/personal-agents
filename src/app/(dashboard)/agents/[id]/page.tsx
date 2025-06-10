import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { AgentIdView } from "./view";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

interface Props {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.agents.getOne.queryOptions({ id }));

  return (
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
          <AgentIdView id={id} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
