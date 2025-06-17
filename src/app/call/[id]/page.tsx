import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CallView from "./call-view";
import { generateAvatarURI } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: Props) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;
  prefetch(trpc.meetings.getOne.queryOptions({ id }));

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
          <CallView
            id={id}
            userId={session.user.id}
            userImage={
              session.user.image ??
              generateAvatarURI("initials", session.user.name)
            }
            userName={session.user.name}
          />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
