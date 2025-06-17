import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

export const ActiveMeeting = memo(function ActiveMeeting({
  id,
}: {
  id: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg bg-white px-4 py-5">
      <EmptyState
        src="/upcoming.svg"
        title="Meeting is active"
        description="Meeting will end once all participants leave"
      />
      <div className="flex w-full flex-col-reverse items-center gap-2 lg:flex-row lg:justify-center">
        <Button asChild className="w-full lg:w-auto">
          <Link href={`/call/${id}`}>
            <VideoIcon />
            Join meeting
          </Link>
        </Button>
      </div>
    </div>
  );
});
