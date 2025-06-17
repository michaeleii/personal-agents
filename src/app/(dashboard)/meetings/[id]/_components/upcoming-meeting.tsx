import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { BanIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

export const UpcomingMeeting = memo(function UpcomingMeeting({
  id,
}: {
  id: string;
}) {
  function handleCancelMeeting() {
    // Implementation of cancel meeting logic
  }
  return (
    <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg bg-white px-4 py-5">
      <EmptyState
        src="/upcoming.svg"
        title="Not started yet"
        description="Meeting will end once all participants leave"
      />
      <div className="flex w-full flex-col-reverse items-center gap-2 lg:flex-row lg:justify-center">
        <Button
          onClick={handleCancelMeeting}
          disabled={false}
          className="w-full lg:w-auto"
          variant="secondary"
        >
          <BanIcon />
          Cancel meeting
        </Button>
        <Button disabled={false} asChild className="w-full lg:w-auto">
          <Link href={`/call/${id}`}>
            <VideoIcon />
            Start meeting
          </Link>
        </Button>
      </div>
    </div>
  );
});
