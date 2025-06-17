import type { MeetingsGetOne } from "@/app/(dashboard)/meetings/_server/types";
import type { User } from "better-auth";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useEffect, useState } from "react";
import {
  CallingState,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  type Call,
} from "@stream-io/video-react-sdk";
import { generateAvatarURI } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";
import CallUI from "./call-ui";

interface Props {
  meeting: MeetingsGetOne;
  user: User;
}

export default function CallConnect({ meeting, user }: Props) {
  const trpc = useTRPC();
  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateToken.mutationOptions()
  );
  const [client, setClient] = useState<StreamVideoClient>();
  useEffect(() => {
    const _client = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user: {
        id: user.id,
        name: user.name,
        image: user.image ?? generateAvatarURI("initials", user.name),
      },
      tokenProvider: generateToken,
    });
    setClient(_client);
    return () => {
      _client.disconnectUser();
      setClient(undefined);
    };
  }, [generateToken, user.id, user.name, user.image]);
  const [call, setCall] = useState<Call>();

  useEffect(() => {
    if (!client) return;
    const _call = client.call("default", meeting.id);
    _call.camera.disable();
    _call.microphone.disable();
    setCall(_call);

    return () => {
      if (_call.state.callingState !== CallingState.LEFT) {
        _call.leave();
        _call.endCall();
        setCall(undefined);
      }
    };
  }, [meeting.id, client]);

  if (!client || !call) {
    return (
      <div className="from-sidebar-accent to-sidebar flex h-screen items-center justify-center bg-radial">
        <LoaderIcon className="size-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme className="h-dvh">
        <StreamCall call={call}>
          <CallUI meeting={meeting} user={user} />
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}
