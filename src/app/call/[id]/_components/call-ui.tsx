import { useCall } from "@stream-io/video-react-sdk";
import { useState } from "react";
import EndedCall from "./ended-call";
import Lobby from "./lobby";
import CallActive from "./call-active";

interface Props {
  meetingName: string;
  userName: string;
  userImage: string;
}

export default function CallUI({ meetingName, userImage, userName }: Props) {
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

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
  return show === "lobby" ? (
    <Lobby userName={userName} userImage={userImage} onJoin={handleJoin} />
  ) : show === "call" ? (
    <CallActive meetingName={meetingName} onLeave={handleLeave} />
  ) : (
    <EndedCall />
  );
}
