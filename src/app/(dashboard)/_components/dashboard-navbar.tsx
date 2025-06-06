"use client";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon } from "lucide-react";
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
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Find a meeting or agent" />
      <CommandList>
        <CommandItem>Test</CommandItem>
      </CommandList>
    </CommandDialog>
  );
}
