"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import MeetingForm from "../_components/meeting-form";
import GeneratedAvatar from "@/components/generated-avatar";
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
import { useState } from "react";
import Link from "next/link";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
        <div className="rounded-lg border bg-white">
          <div className="col-span-5 flex flex-col gap-y-5 px-4 py-5">
            <div className="flex items-center gap-x-3">
              <GeneratedAvatar
                variant="glass"
                seed={meeting.name}
                className="size-10"
              />
              <h2 className="text-2xl font-medium capitalize">
                {meeting.agent.name}
              </h2>
            </div>
            <div className="flex flex-col gap-y-4">
              <p className="text-lg font-medium">Instructions</p>
              <p className="text-neutral-800">{meeting.agent.instructions}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
