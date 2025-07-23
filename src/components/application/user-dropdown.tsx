"use client";

import { BadgeCheckIcon, ChevronDown, Home, LogOutIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import type { User } from "better-auth";
import { useRouter } from "next/navigation";
import { signOut } from "../../lib/auth-client";

export default function UserDropdown({ user }: { user: User }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 gap-2 px-2"
        >
          <Avatar className="size-6 rounded-lg">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="rounded-lg">
              {user.name.split(" ")[0]?.[0] ?? ""}
              {user.name.split(" ")[1]?.[0] ?? ""}
            </AvatarFallback>
          </Avatar>
          <div className="truncate">{user.name}</div>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="rounded-lg">
                {user.name.split(" ")[0]?.[0] ?? ""}
                {user.name.split(" ")[1]?.[0] ?? ""}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <BadgeCheckIcon />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/")}>
            <Home />
            Homepage
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600!"
          onClick={async () => {
            await signOut();
            router.refresh();
          }}
        >
          <LogOutIcon className="text-red-600!" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
