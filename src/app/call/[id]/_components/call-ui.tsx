import type { MeetingsGetOne } from "@/app/(dashboard)/meetings/_server/types";
import { useCall } from "@stream-io/video-react-sdk";
import { useState } from "react";
import EndedCall from "./ended-call";
import Lobby from "./lobby";
import type { User } from "better-auth";
import CallActive from "./call-active";

interface Props {
  meeting: MeetingsGetOne;
  user: User;
}

type ShowState = "lobby" | "call" | "ended";

export default function CallUI({ meeting, user }: Props) {
  const call = useCall();
  const [show, setShow] = useState<ShowState>("lobby");

  async function handleJoin() {
    if (!call) return;
    await call.join();
    setShow("call");
  }

  const handleLeave = () => {
    if (!call) return;
    call.endCall();
    setShow("ended");
  };
  return (
    <>
      {show === "lobby" && <Lobby user={user} onJoin={handleJoin} />}
      {show === "call" && (
        <CallActive meeting={meeting} onLeave={handleLeave} />
      )}
      {show === "ended" && <EndedCall />}
    </>
  );
}
