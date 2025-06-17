"use client";

import GeneratedAvatar from "@/components/generated-avatar";
import { Button } from "@/components/ui/button";
import {
  CommandResponsiveDialog,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { useSidebar } from "@/components/ui/sidebar";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export default function DashboardNavbar() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const { state, toggleSidebar, isMobile } = useSidebar();

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <DashboardCommand open={cmdOpen} setOpen={setCmdOpen} />
      <nav className="bg-background flex items-center gap-x-2 border-b px-4 py-3">
        <Button onClick={toggleSidebar} variant="outline" size="icon">
          {state === "collapsed" || isMobile ? (
            <PanelLeftIcon />
          ) : (
            <PanelLeftCloseIcon />
          )}
        </Button>
        <Button
          onClick={() => setCmdOpen((open) => !open)}
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-muted-foreground w-[240px] justify-start font-normal"
        >
          <SearchIcon />
          Search
          <kbd className="bg-muted text-muted-foreground pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium select-none">
            <span className="text-xs">&#8984; K</span>
          </kbd>
        </Button>
      </nav>
    </>
  );
}

interface DashboardCommandProps {
  open?: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

function DashboardCommand({ open, setOpen }: DashboardCommandProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const trpc = useTRPC();
  const meetings = useQuery(
    trpc.meetings.getMany.queryOptions({
      search,
      page: 100,
    })
  );
  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      search,
      page: 100,
    })
  );
  return (
    <CommandResponsiveDialog
      shouldFilter={false}
      open={open}
      onOpenChange={setOpen}
    >
      <CommandInput
        placeholder="Find a meeting or agent"
        value={search}
        onValueChange={(value) => setSearch(value)}
      />
      <CommandList>
        <CommandGroup heading="Meetings">
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              No meetings found
            </span>
          </CommandEmpty>
          {meetings?.data?.items.map((meeting) => (
            <CommandItem
              onSelect={() => {
                router.push(`/meetings/${meeting.id}`);
                setOpen(false);
              }}
              key={meeting.id}
            >
              {meeting.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Agents">
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              No agents found
            </span>
          </CommandEmpty>
          {agents?.data?.items.map((agent) => (
            <CommandItem
              onSelect={() => {
                router.push(`/agents/${agent.id}`);
                setOpen(false);
              }}
              key={agent.id}
            >
              <GeneratedAvatar
                seed={agent.name}
                variant="glass"
                className="size-5"
              />
              {agent.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandItem>Test</CommandItem>
      </CommandList>
    </CommandResponsiveDialog>
  );
}
