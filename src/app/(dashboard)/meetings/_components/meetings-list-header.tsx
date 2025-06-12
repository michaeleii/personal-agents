"use client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import MeetingForm from "./meeting-form";

export default function MeetingsListHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ResponsiveDialog
        title="New Meeting"
        description="Create a new meeting"
        open={open}
        onOpenChange={setOpen}
      >
        <MeetingForm
          onSuccess={() => {
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </ResponsiveDialog>
      <div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-medium">My Meetings</h5>
          <Button onClick={() => setOpen(true)}>
            <PlusIcon />
            <span>New Meeting</span>
          </Button>
        </div>
        <div className="flex items-center gap-x-2 p-1"></div>
      </div>
    </>
  );
}
