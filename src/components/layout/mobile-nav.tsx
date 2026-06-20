"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Truck, Route, BookOpen } from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Fleet", href: "/fleet", icon: Truck },
  { title: "Trips", href: "/trips", icon: Route },
  { title: "Ledger", href: "/ledger", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a192f] border-t border-[#1e3a5f]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg transition-all duration-200 min-w-[60px] relative",
                isActive
                  ? "text-sky-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isActive && "bg-sky-400/10"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.title}</span>
              {isActive && (
                <div className="absolute bottom-0 w-4 h-0.5 rounded-full bg-sky-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
