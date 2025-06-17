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
  ChevronRightIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { MeetingStatus } from "../_server/types";
import { ActiveMeeting } from "./_components/active-meeting";
import { CancelledMeeting } from "./_components/cancelled-meeting";
import { ProcessingMeeting } from "./_components/processing-meeting";
import { UpcomingMeeting } from "./_components/upcoming-meeting";
import { CompletedMeeting } from "./_components/completed-meeting";
import type { User } from "better-auth";

interface Props {
  id: string;
  user: User;
}

export default function MeetingView({ id, user }: Props) {
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

  const handleDelete = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    await deleteMeeting.mutateAsync({ id });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };
  const handleFormSuccess = () => {
    setOpen(false);
  };
  const handleFormCancel = () => {
    setOpen(false);
  };

  const statusCompMap = useMemo(() => {
    const mapping: Record<MeetingStatus, React.ReactNode> = {
      active: <ActiveMeeting id={meeting.id} />,
      cancelled: <CancelledMeeting />,
      processing: <ProcessingMeeting />,
      upcoming: <UpcomingMeeting id={meeting.id} />,
      completed: <CompletedMeeting meeting={meeting} user={user} />,
    };
    return mapping;
  }, [meeting, user]);

  return (
    <>
      <RemoveConfirmation />
      <ResponsiveDialog
        title="Update Meeting"
        description="Edit the meeting details"
        open={open}
        onOpenChange={handleOpenChange}
      >
        <MeetingForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
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
                  <Link href={`/meetings/${meeting.id}`}>{meeting.name}</Link>
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
              <DropdownMenuItem
                disabled={deleteMeeting.isPending}
                onClick={() => setOpen(true)}
              >
                <PencilIcon className="size-4 text-black" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={deleteMeeting.isPending}
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
