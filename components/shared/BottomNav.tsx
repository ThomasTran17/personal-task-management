"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, BarChart3 } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/kanban",
      label: "Kanban",
      icon: LayoutGrid,
    },
    {
      href: "/stats",
      label: "Statistics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex justify-around h-20 items-center px-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded font-bold transition-all ${
              isActive
                ? "bg-dark dark:bg-bg text-main dark:text-secondary shadow-neubru border-neubru border-neubru"
                : "text-dark dark:text-bg hover:bg-secondary"
            }`}
          >
            <Icon size={24} />
            <span className="text-xs">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
