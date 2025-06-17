import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import MeetingView from "./view";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  prefetch(trpc.meetings.getOne.queryOptions({ id }));
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/sign-in");
  }
  return (
    <HydrateClient>
      <Suspense
        fallback={
          <LoadingState
            title="Loading Meeting"
            description="This may take a few seconds..."
          />
        }
      >
        <ErrorBoundary
          fallback={
            <ErrorState
              title="Failed to load meeting"
              description="Please try again later"
            />
          }
        >
          <MeetingView id={id} user={session.user} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
