import { useCall } from "@stream-io/video-react-sdk";
import { useState } from "react";
import EndedCall from "./ended-call";
import Lobby from "./lobby";
import CallActive from "./call-active";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

interface Props {
  meetingId: string;
  meetingName: string;
  userName: string;
  userImage: string;
}

export default function CallUI({
  meetingId,
  meetingName,
  userImage,
  userName,
}: Props) {
  const trpc = useTRPC();
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
  const { mutateAsync: connectAIToCall } = useMutation(
    trpc.meetings.connectAIToCall.mutationOptions()
  );
  async function handleJoin() {
    if (!call) return;
    await call.join();
    await connectAIToCall({ meetingId });
    setShow("call");
  }

  const handleLeave = () => {
    if (!call) return;
    call.endCall();
    setShow("ended");
  };
  return show === "lobby" ? (
    <Lobby userName={userName} userImage={userImage} onJoin={handleJoin} />
  ) : show === "call" ? (
    <CallActive meetingName={meetingName} onLeave={handleLeave} />
  ) : (
    <EndedCall />
  );
}
