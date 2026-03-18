"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-bg dark:bg-dark">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:w-64 border-neubru border-r-neubru bg-main dark:bg-secondary">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-neubru border-t-neubru bg-main dark:bg-secondary">
        <BottomNav />
      </nav>
    </div>
  );
}
