"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import AgentForm from "./agent-form";

export default function AgentsListHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ResponsiveDialog
        title="New Agent"
        description="Create a new agent"
        open={open}
        onOpenChange={setOpen}
      >
        <AgentForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </ResponsiveDialog>
      <div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-medium">My Agents</h5>
          <Button onClick={() => setOpen(true)}>
            <PlusIcon />
            <span>New Agent</span>
          </Button>
        </div>
      </div>
    </>
  );
}
