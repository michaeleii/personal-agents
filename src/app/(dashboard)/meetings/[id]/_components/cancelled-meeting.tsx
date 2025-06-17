import { EmptyState } from "@/components/empty-state";
import { memo } from "react";

export const CancelledMeeting = memo(function CancelledMeeting() {
  return (
    <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg bg-white px-4 py-5">
      <EmptyState
        src="/cancelled.svg"
        title="Meeting is cancelled"
        description="The meeting was cancelled"
      />
    </div>
  );
});
