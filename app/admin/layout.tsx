import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import AdminShell from "@/components/admin/AdminShell";
import "../staff/staff.css";
import "../staff/polish.css";
import "./admin.css";

export const metadata: Metadata = { title: "Administration | ROAMIGO", robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <AdminShell user={user}>{children}</AdminShell>;
}
