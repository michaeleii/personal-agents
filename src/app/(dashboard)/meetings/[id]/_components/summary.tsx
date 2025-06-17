import Link from "next/link";
import type { MeetingsGetOne } from "../../_server/types";
import GeneratedAvatar from "@/components/generated-avatar";
import { format, formatDistance } from "date-fns";
import { ClockFadingIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Markdown from "react-markdown";

interface Props {
  meeting: MeetingsGetOne;
}

export function Summary({ meeting }: Props) {
  return (
    <div className="rounded-lg border bg-white">
      <div className="col-span-5 flex flex-col gap-y-5 px-4 py-5">
        <h2 className="text-2xl font-medium capitalize">{meeting.name}</h2>
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
            <p>{format(new Date(meeting.startedAt), "PPP")}</p>
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
            formatDistance(
              new Date(meeting.endedAt),
              new Date(meeting.startedAt)
            )}
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
              p: (props) => <p className="mb-6 leading-relaxed" {...props} />,
              ul: (props) => (
                <ul className="mb-6 list-inside list-disc" {...props} />
              ),
              ol: (props) => (
                <ol className="mb-6 list-inside list-decimal" {...props} />
              ),
              li: (props) => <li className="mb-1" {...props} />,
              strong: (props) => (
                <strong className="font-semibold" {...props} />
              ),
              code: (props) => (
                <code className="rounded bg-gray-100 px-1 py-0.5" {...props} />
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
  );
}
