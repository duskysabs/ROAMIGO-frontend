import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/require-staff";
import AccountingShell from "@/components/accounting/AccountingShell";
import "../staff/staff.css";
import "./accounting.css";
import "@/app/staff/polish.css";

export const metadata: Metadata = { title: "Accounting | ROAMIGO", robots: { index: false, follow: false } };
export default async function AccountingLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff("accounting");
  return <AccountingShell user={user}>{children}</AccountingShell>;
}
