import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import Sidebar from "@/components/admin/Sidebar";
import ToastProvider from "@/components/admin/Toast";
import { db } from "@/lib/db";
import { leads } from "@/db/schema";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — WYZREX Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const unreadLeads = await db.$count(leads, eq(leads.isRead, false));

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg">
        <Sidebar unreadLeads={unreadLeads} />
        <div className="flex-1 overflow-x-hidden p-8">{children}</div>
      </div>
    </ToastProvider>
  );
}
