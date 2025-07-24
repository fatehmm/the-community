"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/explore",
      label: "Explore",
      icon: MessageSquare,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <>
      {/* Mobile Navigation (xs and sm) */}
      <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/20 bg-white/10 backdrop-blur-md md:hidden">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex h-auto flex-col items-center space-y-1 px-3 py-2",
                      isActive
                        ? "text-primary"
                        : "hover:text-primary text-gray-400",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar Navigation (md and up) */}
      <nav className="fixed top-0 left-0 z-40 hidden h-full w-64 flex-col border-r border-white/20 bg-white/10 backdrop-blur-md md:flex">
        <div className="flex h-full flex-col">
          {/* Logo/Brand Section */}
          <div className="border-b border-white/20 p-6">
            <h1 className="text-foreground font-tobias text-xl font-medium">
              The Community
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-auto w-full justify-start space-x-3 px-4 py-3",
                        isActive
                          ? "text-primary bg-white/20"
                          : "text-foreground hover:bg-white/10",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Section (optional for user info, settings, etc.) */}
          {/* <div className="border-t border-white/20 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <User className="text-foreground h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-foreground text-sm font-medium">User</p>
                <p className="text-xs text-gray-400">@username</p>
              </div>
            </div>
          </div> */}
        </div>
      </nav>
    </>
  );
}
