"use client";
import GeneratedAvatar from "@/components/generated-avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { deleteUser, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { User } from "better-auth";

import {
  BotIcon,
  ChevronDownIcon,
  CreditCardIcon,
  LogOutIcon,
  StarIcon,
  VideoIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: `/${string}`;
}

const primarySection: MenuItem[] = [
  {
    icon: VideoIcon,
    label: "Meetings",
    href: "/meetings",
  },
  {
    icon: BotIcon,
    label: "Agents",
    href: "/agents",
  },
];

const secondarySection: MenuItem[] = [
  {
    icon: StarIcon,
    label: "Upgrade",
    href: "/upgrade",
  },
];

type UserWithAnonymous = User & {
  isAnonymous?: boolean | null;
};

export default function DashboardSidebar({
  user,
}: {
  user?: UserWithAnonymous;
}) {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader className="text-sidebar-accent-foreground">
        <Link href="/" className="flex items-center gap-2 px-2 pt-2">
          <span className="text-2xl font-bold tracking-tight">
            Personal Agents
          </span>
        </Link>
      </SidebarHeader>
      <div className="px-4 py-2">
        <Separator className="text-[#5D6B68] opacity-10" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {primarySection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "from-sidebar-accent via-sidebar/50 to-sidebar/50 h-10 border border-transparent from-5% via-30% hover:border-[#5D6B68]/10 hover:bg-linear-to-r/oklch data-[active=true]:border-[#5D6B68]/10 data-[active=true]:bg-linear-to-r/oklch"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-4 py-2">
          <Separator className="text-[#5D6B68] opacity-10" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondarySection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "from-sidebar-accent via-sidebar/50 to-sidebar/50 h-10 border border-transparent from-5% via-30% hover:border-[#5D6B68]/10 hover:bg-linear-to-r/oklch data-[active=true]:border-[#5D6B68]/10 data-[active=true]:bg-linear-to-r/oklch"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {user && (
        <SidebarFooter>
          <DashboardUserButton user={user} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

function DashboardUserButton({ user }: { user: UserWithAnonymous }) {
  const router = useRouter();
  const isMobile = useIsMobile();

  async function onLogout() {
    if (user.isAnonymous) {
      await deleteUser({
        callbackURL: "/sign-in",
        fetchOptions: {
          onSuccess: () => {
            router.refresh();
          },
        },
      });
    }
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
        },
      },
    });
  }

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger className="flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg p-3 hover:bg-white/10">
          {user.image ? (
            <Avatar>
              <AvatarImage src={user.image} />
            </Avatar>
          ) : (
            <GeneratedAvatar
              seed={user.name}
              variant="initials"
              className="mr-2 size-9"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden text-left">
            <p className="truncate text-sm">{user.name}</p>
            {!user.isAnonymous && (
              <p className="truncate text-xs">{user.email}</p>
            )}
          </div>
          <ChevronDownIcon className="size-4 shrink-0" />
        </DrawerTrigger>
        <DrawerContent className="border-border/10 text-sidebar-foreground bg-[#132621]">
          <DrawerHeader>
            <div className="flex flex-col gap-1">
              <DrawerTitle className="text-sidebar-muted-foreground truncate font-medium">
                {user.name}
              </DrawerTitle>
              {!user.isAnonymous && (
                <DrawerDescription className="truncate text-sm font-normal">
                  {user.email}
                </DrawerDescription>
              )}
            </div>
          </DrawerHeader>
          <DrawerFooter>
            <Button className="border-border/10 text-sidebar-muted-foreground hover:text-sidebar-accent-foreground border bg-white/5 hover:bg-white/10">
              <CreditCardIcon className="text-sidebar-muted-foreground size-4" />
              Billing
            </Button>
            <Button
              className="border-border/10 text-sidebar-muted-foreground hover:text-sidebar-accent-foreground border bg-white/5 hover:bg-white/10"
              onClick={onLogout}
            >
              <LogOutIcon className="text-sidebar-muted-foreground size-4" />
              Log Out
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg p-3 hover:bg-white/10">
        {user.image ? (
          <Avatar>
            <AvatarImage src={user.image} />
          </Avatar>
        ) : (
          <GeneratedAvatar
            seed={user.name}
            variant="initials"
            className="mr-2 size-9"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden text-left">
          <p className="truncate text-sm">{user.name}</p>
          {!user.isAnonymous && (
            <p className="truncate text-xs">{user.email}</p>
          )}
        </div>
        <ChevronDownIcon className="size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-border/10 text-sidebar-foreground w-[15rem] bg-[#132621]"
      >
        <DropdownMenuLabel className="text-sidebar-foreground">
          <div className="flex flex-col gap-1">
            <span className="truncate font-medium">{user.name}</span>
            {!user.isAnonymous && (
              <span className="text-sidebar-muted-foreground truncate text-sm font-normal">
                {user.email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-sidebar-border/10" />
        <DropdownMenuItem className="text-sidebar-muted-foreground focus:text-sidebar-accent-foreground focus:bg-white/10">
          <CreditCardIcon className="text-sidebar-muted-foreground size-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-sidebar-muted-foreground focus:text-sidebar-accent-foreground focus:bg-white/10"
          onClick={onLogout}
        >
          <LogOutIcon className="text-sidebar-muted-foreground size-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
