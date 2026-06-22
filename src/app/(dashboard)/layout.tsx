"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Menu,
  Bell,
  LayoutDashboard,
  Truck,
  Route,
  BookOpen,
  LogOut,
  Settings,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Sidebar } from "@/components/layout/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Fleet", href: "/fleet", icon: Truck },
  { title: "Trips", href: "/trips", icon: Route },
  { title: "Ledger", href: "/ledger", icon: BookOpen },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Command Center",
  "/fleet": "Fleet Registry",
  "/trips": "Trip Dispatch",
  "/ledger": "Financial Ledger",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
      }
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const userInitials = currentUser?.name
    ? currentUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "VG";

  const activeTitle =
    Object.entries(pageTitles).find(
      ([href]) => pathname === href || pathname?.startsWith(href + "/")
    )?.[1] || "Veltrix Group";

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans antialiased text-[#0B1F4D] flex">
      {/* Persistent desktop sidebar */}
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E5E7EB] h-16 flex items-center justify-between px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile-only menu trigger + brand mark */}
            <div className="md:hidden flex items-center gap-3">
              <Sheet>
                <SheetTrigger render={<Button variant="ghost" size="icon" className="h-10 w-10 text-[#0B1F4D]" />}>
                  <Menu className="w-5 h-5" />
                </SheetTrigger>
                <SheetContent side="left" className="bg-[#0B1F4D] text-white border-0 p-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <SheetHeader className="text-left">
                      <SheetTitle className="sr-only">Veltrix Group navigation</SheetTitle>
                      <Logo markSize={36} inverted />
                    </SheetHeader>
                    <div className="py-6 border-t border-slate-700 space-y-4">
                      <div className="flex items-center gap-3 px-2 py-2">
                        <Avatar className="w-10 h-10 border border-slate-700">
                          <AvatarFallback className="bg-emerald-500/15 text-emerald-400 font-bold">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-white">{currentUser?.name || "Veltrix User"}</p>
                          <p className="text-xs text-slate-400 capitalize">{currentUser?.role || "Operator"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-2 mb-2">Platform Nav</p>
                      {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-slate-400")} />
                            {item.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-t border-slate-700 pt-4 space-y-2">
                    <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-white/5 justify-start gap-3">
                      <Settings className="w-4 h-4" /> System Settings
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start gap-3">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <Link href="/dashboard" className="flex items-center gap-2">
                <LogoMark size={32} />
                <span className="font-heading text-md font-bold text-[#0B1F4D] tracking-tight">
                  VELTRIX <span className="text-[#1f8a4c]">GROUP</span>
                </span>
              </Link>
            </div>

            {/* Desktop page heading */}
            <div className="hidden md:block min-w-0">
              <h1 className="font-heading text-base font-bold text-[#0B1F4D] tracking-tight truncate">
                {activeTitle}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-[#0B1F4D] hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
            </Button>
            <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-[#1f8a4c]/15">
              <AvatarFallback className="bg-[#0B1F4D]/5 text-[#0B1F4D] text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-[#F4F7FA]">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 md:pb-10 max-w-[1400px] mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Floating Bottom Navigation — mobile only */}
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-[480px] bg-white border border-[#E5E7EB] rounded-2xl shadow-xl shadow-[#0B1F4D]/10">
          <div className="flex items-center justify-around py-2.5 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-1 min-w-[70px] group transition-all duration-200"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-br from-[#0B1F4D] to-[#15366f] text-white scale-110 shadow-lg shadow-[#0B1F4D]/25 ring-2 ring-[#3fae57]/40"
                        : "text-slate-400 group-hover:text-[#0B1F4D] hover:bg-slate-100"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold transition-colors duration-200",
                      isActive ? "text-[#0B1F4D]" : "text-slate-400 group-hover:text-[#0B1F4D]"
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
