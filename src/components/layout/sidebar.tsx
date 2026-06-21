"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Route,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  Building2,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Financial cockpit & analytics",
  },
  {
    title: "Fleet",
    href: "/fleet",
    icon: Truck,
    description: "Trucks & drivers registry",
  },
  {
    title: "Trips",
    href: "/trips",
    icon: Route,
    description: "Trip dispatch & management",
  },
  {
    title: "Ledger",
    href: "/ledger",
    icon: BookOpen,
    description: "Financial ledger & records",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)] h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-[var(--sidebar-border)] relative z-30",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-16 px-4 gap-3",
            collapsed && "justify-center"
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-500/25">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-heading text-base font-bold text-white tracking-tight">
                Veltrix Group
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Logistics Platform
              </p>
            </div>
          )}
        </div>

        <Separator className="bg-[var(--sidebar-border)] mx-3" />

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname?.startsWith(item.href + "/");
            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-white shadow-lg shadow-sky-500/10"
                    : "text-slate-400 hover:text-white hover:bg-[var(--sidebar-accent)]/60",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-sky-400"
                      : "text-slate-500 group-hover:text-sky-400"
                  )}
                />
                {!collapsed && (
                  <div className="overflow-hidden">
                    <span>{item.title}</span>
                    {isActive && (
                      <p className="text-[10px] text-slate-400 font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger render={linkContent} />
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        <Separator className="bg-[var(--sidebar-border)] mx-3" />

        {/* User Section */}
        <div className={cn("p-3", collapsed && "flex flex-col items-center")}>
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-sky-500/20 text-sky-400 text-xs font-bold">
                  VG
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  Admin User
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  admin@veltrix.in
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="text-slate-500 hover:text-slate-300 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-sky-500/20 text-sky-400 text-xs font-bold">
                  VG
                </AvatarFallback>
              </Avatar>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      onClick={handleLogout}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-800/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  }
                />
                <TooltipContent side="right">Log Out</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--sidebar)] border border-[var(--sidebar-border)] flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg z-40"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  );
}
