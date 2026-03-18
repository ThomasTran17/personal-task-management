"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, BarChart3 } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  iconType: "kanban" | "stats";
}

interface BottomNavProps {
  items: NavItem[];
}

const getIcon = (iconType: string) => {
  switch (iconType) {
    case "kanban":
      return <KanbanSquare size={24} />;
    case "stats":
      return <BarChart3 size={24} />;
    default:
      return null;
  }
};

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg border-t-neubru border-t-neubru shadow-neubru">
      <div className="flex justify-around items-center h-20">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 py-2 font-semibold transition-all ${
                isActive
                  ? "bg-main text-dark shadow-neubru"
                  : "bg-white text-dark hover:bg-main"
              }`}
            >
              {getIcon(item.iconType)}
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
