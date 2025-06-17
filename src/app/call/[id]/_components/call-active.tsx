import type { MeetingsGetOne } from "@/app/(dashboard)/meetings/_server/types";
import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import Link from "next/link";

interface Props {
  meeting: MeetingsGetOne;
  onLeave: () => void;
}

export default function CallActive({ meeting, onLeave }: Props) {
  return (
    <div className="flex h-full flex-col justify-between p-4 text-white">
      <div className="flex items-center gap-4 rounded-full bg-[#101213] p-4">
        <Link
          href="/"
          className="flex w-fit items-center justify-center rounded-full bg-white/10 p-1"
        >
          <span className="text-white">Personal Agents</span>
        </Link>
        <h4 className="text-base">{meeting.name}</h4>
      </div>
      <SpeakerLayout />
      <div className="rounded-full bg-[#101213] px-4">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
}
