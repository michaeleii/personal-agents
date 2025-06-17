import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Channel as StreamChannel } from "stream-chat";
import {
  useCreateChatClient,
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";

import "stream-chat-react/dist/css/v2/index.css";
import type { MeetingsGetOne } from "../../_server/types";
import type { User } from "better-auth";
import { generateAvatarURI } from "@/lib/utils";

interface Props {
  meeting: MeetingsGetOne;
  user: User;
}

export default function AIChat({ meeting, user }: Props) {
  const trpc = useTRPC();
  const { mutateAsync: generateChatToken } = useMutation(
    trpc.meetings.generateChatToken.mutationOptions()
  );

  const [channel, setChannel] = useState<StreamChannel>();
  const client = useCreateChatClient({
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    tokenOrProvider: generateChatToken,
    userData: {
      id: user.id,
      name: user.name,
      image: user.image ?? generateAvatarURI("initials", user.name),
    },
  });

  useEffect(() => {
    if (!client) return;

    const channel = client.channel("messaging", meeting.id, {
      members: [user.id],
    });

    setChannel(channel);
  }, [client, user, meeting]);

  if (!client) {
    return (
      <LoadingState
        title="Loading Chat"
        description="This may take a few seconds"
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <Chat client={client}>
        <Channel channel={channel}>
          <Window>
            <div className="max-h-[calc(100vh-23rem)] flex-1 overflow-y-auto border-b">
              <MessageList />
            </div>
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}
