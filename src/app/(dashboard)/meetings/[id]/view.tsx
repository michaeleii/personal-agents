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
  ChevronRightIcon,
  MoreVerticalIcon,
  PencilIcon,
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
    completed: <div>Completed</div>,
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
            asChild
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
