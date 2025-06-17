"use client";
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { User } from "better-auth";
import { LogInIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  CallControls,
  SpeakerLayout,
  StreamTheme,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import type { Call, StreamVideoParticipant } from "@stream-io/video-react-sdk";
import {
  CallingState,
  StreamCall,
  StreamVideo,
} from "@stream-io/video-react-sdk";
import Link from "next/link";
import {
  DefaultVideoPlaceholder,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  useCallStateHooks,
  VideoPreview,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { generateAvatarURI } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  user: User;
}

type LobbyState = "lobby" | "call" | "ended";

export default function CallView({ id, user }: Props) {
  const trpc = useTRPC();
  const { data: meeting } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id })
  );

  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateToken.mutationOptions({})
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

  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

  async function handleJoin() {
    if (!call) return;
    await call.join();
    setShow("call");
  }
  function handleLeave() {
    if (!call) return;
    call.endCall();
    setShow("ended");
  }

  function Lobby() {
    const { useCameraState, useMicrophoneState } = useCallStateHooks();
    const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();
    const { hasBrowserPermission: hasCameraPermission } = useCameraState();

    const hasMediaPermissions = hasMicPermission && hasCameraPermission;
    function DisabledVideoPreview() {
      return (
        <DefaultVideoPlaceholder
          participant={
            {
              name: user.name,
              image: user.image ?? generateAvatarURI("initials", user.name),
            } as StreamVideoParticipant
          }
        />
      );
    }

    function AllowMediaPermissions() {
      return (
        <p className="text-sm">
          Please grant your browser a permission to access your camera and
          microphone.
        </p>
      );
    }
    return (
      <div className="from-sidebar-accent to-sidebar flex h-dvh flex-col items-center justify-center bg-radial">
        <div className="flex flex-1 items-center justify-center px-8 py-4">
          <div className="bg-background flex flex-col items-center justify-center gap-y-6 rounded-lg p-10 shadow-sm">
            <div className="flex flex-col gap-y-2 text-center">
              <h6 className="text-lg font-medium">Ready to join?</h6>
              <p className="text-sm">Set up your call before joining</p>
            </div>
            <VideoPreview
              DisabledVideoPreview={
                hasMediaPermissions
                  ? DisabledVideoPreview
                  : AllowMediaPermissions
              }
            />
            <div className="flex gap-x-2">
              <ToggleAudioPreviewButton />
              <ToggleVideoPreviewButton />
            </div>
            <div className="flex w-full justify-between gap-x-2">
              <Button asChild variant="ghost">
                <Link href="/meetings">Cancel</Link>
              </Button>
              <Button onClick={handleJoin}>
                <LogInIcon />
                Join Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showMap: Record<LobbyState, React.ReactNode> = {
    lobby: <Lobby />,
    call: (
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
          <CallControls onLeave={handleLeave} />
        </div>
      </div>
    ),
    ended: (
      <div className="from-sidebar-accent to-sidebar flex h-full flex-col items-center justify-center bg-radial">
        <div className="flex flex-1 items-center justify-center px-8 py-4">
          <div className="bg-background flex flex-col items-center justify-center gap-y-6 rounded-lg p-10 shadow-sm">
            <div className="flex flex-col gap-y-2 text-center">
              <h6 className="text-lg font-medium">You have ended the call</h6>
              <p className="text-sm">Summary will appear in a few minutes.</p>
            </div>
            <Button asChild>
              <Link href="/meetings">Back to meetings</Link>
            </Button>
          </div>
        </div>
      </div>
    ),
  };

  if (!client || !call) {
    return (
      <div className="from-sidebar-accent to-sidebar flex h-screen items-center justify-center bg-radial">
        <LoaderIcon className="size-6 animate-spin text-white" />
      </div>
    );
  }

  if (meeting.status === "completed") {
    return (
      <div className="flex h-dvh items-center justify-center">
        <ErrorState
          title="Meeting has ended"
          description="You can no longer join this meeting"
        />
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <StreamCall call={call}>{showMap[show]}</StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}
