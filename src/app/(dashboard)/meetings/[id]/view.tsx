"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import MeetingForm from "../_components/meeting-form";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  BanIcon,
  BookOpenTextIcon,
  ChevronRightIcon,
  ClockFadingIcon,
  FileTextIcon,
  FileVideoIcon,
  MoreVerticalIcon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { MeetingStatus } from "../_server/types";
import { EmptyState } from "@/components/empty-state";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "react-markdown";
import GeneratedAvatar from "@/components/generated-avatar";
import { format, formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Props {
  id: string;
}

export default function MeetingView({ id }: Props) {
  const trpc = useTRPC();
  const { data: meeting } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id })
  );
  const queryClient = useQueryClient();
  const router = useRouter();
  const deleteMeeting = useMutation(
    trpc.meetings.delete.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
        router.push("/meetings");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure?",
    `The following action will remove this meeting and all associated data`
  );
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    const ok = await confirmRemove();
    if (!ok) return;
    await deleteMeeting.mutateAsync({ id });
  }

  function handleCancelMeeting() {}
  const isCancelling = false;

  const statusCompMap: Record<MeetingStatus, React.ReactNode> = {
    active: (
      <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg bg-white px-4 py-5">
        <EmptyState
          src="/upcoming.svg"
          title="Meeting is active"
          description="Meeting will end once all participants leave"
        />
        <div className="flex w-full flex-col-reverse items-center gap-2 lg:flex-row lg:justify-center">
          <Button asChild className="w-full lg:w-auto">
            <Link href={`/call/${meeting.id}`}>
              <VideoIcon />
              Join meeting
            </Link>
          </Button>
        </div>
      </div>
    ),
    cancelled: (
      <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg bg-white px-4 py-5">
        <EmptyState
          src="/cancelled.svg"
          title="Meeting is cancelled"
          description="The meeting was cancelled"
        />
      </div>
    ),
    processing: (
      <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg bg-white px-4 py-5">
        <EmptyState
          src="/processing.svg"
          title="Meeting is completed"
          description="A summary of the meeting will appear soon"
        />
      </div>
    ),
    upcoming: (
      <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg bg-white px-4 py-5">
        <EmptyState
          src="/upcoming.svg"
          title="Not started yet"
          description="Meeting will end once all participants leave"
        />
        <div className="flex w-full flex-col-reverse items-center gap-2 lg:flex-row lg:justify-center">
          <Button
            onClick={handleCancelMeeting}
            disabled={isCancelling}
            className="w-full lg:w-auto"
            variant="secondary"
          >
            <BanIcon />
            Cancel meeting
          </Button>
          <Button disabled={isCancelling} asChild className="w-full lg:w-auto">
            <Link href={`/call/${meeting.id}`}>
              <VideoIcon />
              Start meeting
            </Link>
          </Button>
        </div>
      </div>
    ),
    completed: (
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
          <TabsContent value="recording">
            <div className="rounded-lg border bg-white px-4 py-5">
              {meeting.recordingUrl ? (
                <video
                  src={meeting.recordingUrl}
                  className="w-full rounded-lg"
                  controls
                />
              ) : (
                <div className="text-muted-foreground py-4 text-center">
                  No Recording available
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="summary">
            <div className="rounded-lg border bg-white">
              <div className="col-span-5 flex flex-col gap-y-5 px-4 py-5">
                <h2 className="text-2xl font-medium capitalize">
                  {meeting.name}
                </h2>
                <div className="flex items-center gap-x-2">
                  <Link
                    href={`/agents/${meeting.agent.id}`}
                    className="flex items-center gap-x-2 capitalize underline underline-offset-4"
                  >
                    <GeneratedAvatar
                      variant="glass"
                      seed={meeting.agent.name}
                      className="size-5"
                    />
                    {meeting.agent.name}
                  </Link>{" "}
                  {meeting.startedAt && (
                    <p>{format(meeting.startedAt, "PPP")}</p>
                  )}
                </div>
                <div className="flex items-center gap-x-2">
                  <SparklesIcon className="size-4" />
                  <p>General summary</p>
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-x-2 [&>svg]:size-4"
                >
                  <ClockFadingIcon className="text-blue-700" />
                  {meeting.startedAt &&
                    meeting.endedAt &&
                    formatDistance(meeting.endedAt, meeting.startedAt)}
                </Badge>
                <div>
                  <Markdown
                    components={{
                      h1: (props) => (
                        <h1 className="mb-6 text-2xl font-medium" {...props} />
                      ),
                      h2: (props) => (
                        <h2 className="mb-6 text-xl font-medium" {...props} />
                      ),
                      h3: (props) => (
                        <h3 className="mb-6 text-lg font-medium" {...props} />
                      ),
                      h4: (props) => (
                        <h4 className="mb-6 text-base font-medium" {...props} />
                      ),
                      p: (props) => (
                        <p className="mb-6 leading-relaxed" {...props} />
                      ),
                      ul: (props) => (
                        <ul className="mb-6 list-inside list-disc" {...props} />
                      ),
                      ol: (props) => (
                        <ol
                          className="mb-6 list-inside list-decimal"
                          {...props}
                        />
                      ),
                      li: (props) => <li className="mb-1" {...props} />,
                      strong: (props) => (
                        <strong className="font-semibold" {...props} />
                      ),
                      code: (props) => (
                        <code
                          className="rounded bg-gray-100 px-1 py-0.5"
                          {...props}
                        />
                      ),
                      blockquote: (props) => (
                        <blockquote
                          className="my-4 border-l-4 pl-4 italic"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {meeting.summary}
                  </Markdown>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    ),
  };

  return (
    <>
      <RemoveConfirmation />
      <ResponsiveDialog
        title="Update Meeting"
        description="Edit the meeting details"
        open={open}
        onOpenChange={setOpen}
      >
        <MeetingForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          initialValues={meeting}
        />
      </ResponsiveDialog>
      <div className="flex flex-1 flex-col gap-y-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="text-xl font-medium">
                  <Link href="/meetings">My Meetings</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-foreground [&>svg] text-xl font-medium">
                <ChevronRightIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="text-foreground text-xl font-medium capitalize"
                >
                  <Link href={`/meetings/${id}`}>{meeting.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <PencilIcon className="size-4 text-black" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2Icon className="text-destructive size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {statusCompMap[meeting.status]}
      </div>
    </>
  );
}
