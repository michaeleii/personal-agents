import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import MeetingsView from "./view";
import { ErrorState } from "@/components/error-state";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingState } from "@/components/loading-state";
import { Suspense } from "react";
import MeetingsListHeader from "./_components/meetings-list-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs";
import { loadSearchParams } from "./_server/parsers";
interface Props {
  searchParams: Promise<SearchParams>;
}
export default async function Page({ searchParams }: Props) {
  const filters = await loadSearchParams(searchParams);
  prefetch(trpc.meetings.getMany.queryOptions(filters));
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }
  return (
    <>
      <MeetingsListHeader />
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
    </>
  );
}
