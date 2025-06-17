import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import Link from "next/link";

interface Props {
  meetingName: string;
  onLeave: () => void;
}

export default function CallActive({ meetingName, onLeave }: Props) {
  return (
    <div className="flex h-full flex-col justify-between p-4 text-white">
      <div className="flex items-center gap-4 rounded-full bg-[#101213] p-4">
        <Link
          href="/"
          className="flex w-fit items-center justify-center rounded-full bg-white/10 p-2 px-4"
        >
          <span className="text-white">Personal Agents</span>
        </Link>
        <h4 className="text-base">{meetingName}</h4>
      </div>
      <SpeakerLayout />
      <div className="rounded-full bg-[#101213] px-4">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
}
