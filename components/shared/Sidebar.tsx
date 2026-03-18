"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, BarChart3, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  iconType: "kanban" | "stats";
}

interface SidebarProps {
  items: NavItem[];
}

const ICON_MAP = {
  kanban: KanbanSquare,
  stats: BarChart3,
} as const;

const getIcon = (iconType: "kanban" | "stats") => {
  const Icon = ICON_MAP[iconType];
  return Icon ? <Icon size={20} /> : null;
};

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const navItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        isActive: pathname === item.href,
      })),
    [items, pathname]
  );

  const NavLink = ({ item }: { item: typeof navItems[0] }) => (
    <Link
      href={item.href}
      onClick={closeMobile}
      className={cn(
        "flex items-center justify-center font-semibold transition-all border-2 border-border rounded-base",
        isCollapsed ? "px-3 py-3" : "px-4 py-3 justify-start gap-3",
        item.isActive
          ? "bg-main text-main-foreground shadow-shadow"
          : "bg-secondary-background text-foreground hover:bg-main hover:text-main-foreground hover:shadow-shadow"
      )}
    >
      <div className="flex-shrink-0">{getIcon(item.iconType)}</div>
      <span className={cn("transition-all duration-300", isCollapsed ? "hidden" : "block")}>
        {item.label}
      </span>
    </Link>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-background border-r-2 border-border sticky top-0 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-6 border-b-2 border-border transition-all duration-300",
            isCollapsed && "flex-col gap-4"
          )}
        >
          <h1
            className={cn(
              "text-2xl font-bold text-foreground transition-all duration-300",
              isCollapsed && "hidden"
            )}
          >
            Tasks
          </h1>
          <Button
            onClick={toggleCollapse}
            variant="neutral"
            size="icon"
            className="h-10 w-10"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "p-4 border-t-2 border-border bg-secondary-background transition-all duration-300",
            isCollapsed && "flex flex-col items-center"
          )}
        >
          <p
            className={cn(
              "text-sm font-semibold text-foreground transition-all duration-300",
              isCollapsed && "hidden"
            )}
          >
            © 2026 Task Manager
          </p>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsMobileOpen(true)}
          variant="default"
          size="icon"
          className="h-10 w-10"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b-2 border-border p-6">
            <SheetTitle>Tasks</SheetTitle>
          </SheetHeader>

          {/* Mobile Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Mobile Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-border bg-secondary-background">
            <p className="text-sm font-semibold text-foreground">
              © 2026 Task Manager
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
