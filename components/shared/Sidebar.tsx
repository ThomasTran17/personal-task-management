"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, BarChart3 } from "lucide-react";

export default function Sidebar() {
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
    <div className="h-full flex flex-col p-6">
      <h1 className="text-2xl font-bold text-dark dark:text-bg mb-8 border-neubru border-b-neubru pb-4">
        Task Manager
      </h1>

      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 font-bold text-lg transition-all ${
                isActive
                  ? "bg-dark dark:bg-bg text-main dark:text-secondary shadow-neubru border-neubru border-neubru"
                  : "text-dark dark:text-bg hover:bg-secondary hover:shadow-neubruHover border-neubru border-neubru"
              }`}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-neubru border-t-neubru pt-4">
        <p className="text-sm text-dark dark:text-bg font-semibold">
          v1.0.0
        </p>
      </div>
    </div>
  );
}
