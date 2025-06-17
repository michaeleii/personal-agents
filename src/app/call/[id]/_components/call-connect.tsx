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
import { LoaderIcon } from "lucide-react";
import CallUI from "./call-ui";

interface Props {
  meetingId: string;
  meetingName: string;
  userId: string;
  userName: string;
  userImage: string;
}

export default function CallConnect({
  meetingId,
  meetingName,
  userId,
  userName,
  userImage,
}: Props) {
  const trpc = useTRPC();
  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateToken.mutationOptions()
  );
  const [client, setClient] = useState<StreamVideoClient>();
  useEffect(() => {
    const _client = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user: {
        id: userId,
        name: userName,
        image: userImage,
      },
      tokenProvider: generateToken,
    });
    setClient(_client);
    return () => {
      _client.disconnectUser();
      setClient(undefined);
    };
  }, [generateToken, userId, userName, userImage]);
  const [call, setCall] = useState<Call>();

  useEffect(() => {
    if (!client) return;
    const _call = client.call("default", meetingId);
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
  }, [meetingId, client]);

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
          <CallUI
            meetingName={meetingName}
            userImage={userImage}
            userName={userName}
          />
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}
