import { useTRPC } from "@/trpc/client";
import type { AgentsGetOne, AgentsInsert } from "../_server/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsInsertSchema } from "../_server/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import GeneratedAvatar from "@/components/generated-avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { agentVoices } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef } from "react";

interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: AgentsGetOne;
}
export default function AgentForm({
  initialValues,
  onCancel,
  onSuccess,
}: AgentFormProps) {
  const isEdit = !!initialValues?.id;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
  const updateAgent = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
        if (isEdit) {
          queryClient.invalidateQueries(
            trpc.agents.getOne.queryOptions({ id: initialValues.id })
          );
        }
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm<AgentsInsert>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      instructions: initialValues?.instructions ?? "",
      voice: initialValues?.voice ?? "alloy",
    },
  });
  const isPending = createAgent.isPending || updateAgent.isPending;

  function onSubmit(values: AgentsInsert) {
    if (isEdit) {
      updateAgent.mutate({ ...values, id: initialValues.id });
    } else {
      createAgent.mutate(values);
    }
  }

  const agentVoice = form.watch("voice");

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = `/voices/${agentVoice}-preview.wav`;
  }, [agentVoice]);
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <GeneratedAvatar
          seed={form.watch("name")}
          variant="glass"
          className="size-16 border"
        />
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="eg. Math tutor" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="instructions"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="You are a helpful math assistant that can help answer math questions and help with assignments."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="voice"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voice</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Choose your agent's voice" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {agentVoices.map((voice) => (
                    <SelectItem
                      className="capitalize"
                      key={voice}
                      value={voice}
                    >
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {agentVoice && (
          <audio ref={audioRef} controls>
            <source
              src={`/voices/${agentVoice}-preview.wav`}
              type="audio/wav"
            />
            Your browser does not support the audio element.
          </audio>
        )}
        <div className="flex justify-between gap-x-2">
          {onCancel && (
            <Button
              variant="ghost"
              disabled={isPending}
              type="button"
              onClick={() => onCancel()}
            >
              Cancel
            </Button>
          )}
          <Button disabled={isPending} type="submit">
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
