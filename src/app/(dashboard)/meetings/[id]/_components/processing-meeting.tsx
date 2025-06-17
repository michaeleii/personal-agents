import { EmptyState } from "@/components/empty-state";
import { memo } from "react";

export const ProcessingMeeting = memo(function ProcessingMeeting() {
  return (
    <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg bg-white px-4 py-5">
      <EmptyState
        src="/processing.svg"
        title="Meeting is completed"
        description="A summary of the meeting will appear soon"
      />
    </div>
  );
});
