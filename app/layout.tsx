import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/shared/Sidebar";
import { BottomNav } from "@/components/shared/BottomNav";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Task Management",
  description: "A neubrutalism-style task management application",
};

const navItems = [
  {
    href: "/",
    label: "List",
    iconType: "kanban" as const,
  },
  {
    href: "/stats",
    label: "Stats",
    iconType: "stats" as const,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen">
          <Sidebar items={navItems} />
          <main className="flex-1 overflow-auto pb-24 lg:pb-0">
            <div className="p-6">{children}</div>
          </main>
          <BottomNav items={navItems} />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
