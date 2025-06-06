import { SidebarProvider } from "@/components/ui/sidebar";
import type React from "react";
import DashboardSidebar from "./_components/dashboard-sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <SidebarProvider>
      <DashboardSidebar user={session?.user} />
      <main className="bg-muted flex min-h-dvh w-dvw flex-col">{children}</main>
    </SidebarProvider>
  );
}
