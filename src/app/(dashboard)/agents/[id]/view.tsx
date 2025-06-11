"use client";
import GeneratedAvatar from "@/components/generated-avatar";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  ChevronRightIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AgentForm from "../_components/agent-form";
import { useState } from "react";

interface Props {
  id: string;
}

export function AgentIdView({ id }: Props) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: agent } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id })
  );
  const [open, setOpen] = useState(false);
  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure?",
    `The following action will remove ${agent.meetingCount} associated meetings`
  );

  const deleteAgent = useMutation(
    trpc.agents.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );
        router.push("/agents");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  async function handleDelete() {
    const ok = await confirmRemove();
    if (!ok) return;
    await deleteAgent.mutateAsync({ id });
  }

  return (
    <>
      <RemoveConfirmation />
      <ResponsiveDialog
        title="Update Agent"
        description="Edit the agent details"
        open={open}
        onOpenChange={setOpen}
      >
        <AgentForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          initialValues={agent}
        />
      </ResponsiveDialog>
      <div className="flex flex-1 flex-col gap-y-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="text-xl font-medium">
                  <Link href="/agents">My Agents</Link>
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
                  <Link href={`/agents${id}`}>{agent.name}</Link>
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
                seed={agent.name}
                className="size-10"
              />
              <h2 className="text-2xl font-medium capitalize">{agent.name}</h2>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-x-2 [&>svg]:size-4"
            >
              <VideoIcon className="text-blue-700" />
              {agent.meetingCount}{" "}
              {agent.meetingCount === 1 ? "meeting" : "meetings"}
            </Badge>
            <div className="flex flex-col gap-y-4">
              <p className="text-lg font-medium">Instructions</p>
              <p className="text-neutral-800">{agent.instructions}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
