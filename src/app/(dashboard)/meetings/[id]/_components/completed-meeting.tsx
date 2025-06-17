import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MeetingsGetOne } from "../../_server/types";
import { memo } from "react";
import {
  BookOpenTextIcon,
  FileTextIcon,
  FileVideoIcon,
  SparklesIcon,
} from "lucide-react";
import type { User } from "better-auth";
import { Transcript } from "./transcript";
import { Summary } from "./summary";
import Recording from "./recording";
import AIChat from "./ai-chat";

export const CompletedMeeting = memo(function CompletedMeeting({
  meeting,
  user,
}: {
  meeting: MeetingsGetOne;
  user: User;
}) {
  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue="summary">
        <div className="rounded-lg border bg-white px-3">
          <ScrollArea>
            <TabsList className="bg-background h-13 justify-start rounded-none p-0">
              <TabsTrigger
                value="summary"
                className="text-muted-foreground bg-background data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground hover:text-accent-foreground h-full rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                <BookOpenTextIcon />
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="transcript"
                className="text-muted-foreground bg-background data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground hover:text-accent-foreground h-full rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                <FileTextIcon />
                Transcript
              </TabsTrigger>
              <TabsTrigger
                value="recording"
                className="text-muted-foreground bg-background data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground hover:text-accent-foreground h-full rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                <FileVideoIcon />
                Recording
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="text-muted-foreground bg-background data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground hover:text-accent-foreground h-full rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                <SparklesIcon />
                Ask AI
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <TabsContent value="transcript">
          <Transcript meetingId={meeting.id} />
        </TabsContent>
        <TabsContent value="recording">
          <Recording recordingUrl={meeting.recordingUrl} />
        </TabsContent>
        <TabsContent value="summary">
          <Summary meeting={meeting} />
        </TabsContent>
        <TabsContent value="chat">
          <AIChat meeting={meeting} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
});
