import { Button } from "@/components/ui/button";
import { generateAvatarURI } from "@/lib/utils";
import {
  DefaultVideoPlaceholder,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  useCallStateHooks,
  VideoPreview,
  type StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import type { User } from "better-auth";
import { LogInIcon } from "lucide-react";
import Link from "next/link";
interface Props {
  user: User;
  onJoin?: () => void;
}
export default function Lobby({ user, onJoin }: Props) {
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
              hasMediaPermissions ? DisabledVideoPreview : AllowMediaPermissions
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
            <Button onClick={onJoin}>
              <LogInIcon />
              Join Call
            </Button>
          </div>
        </div>
      </div>
    </div>
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
