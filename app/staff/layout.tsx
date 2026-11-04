import { requireStaff } from "@/lib/auth/require-staff";
import type { Metadata } from "next";
import StaffShell from "@/components/staff/StaffShell";
import "./staff.css";

import "@/app/staff/polish.css";

export const metadata: Metadata = { title: "Booking Staff | ROAMIGO", robots: { index: false, follow: false } };

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff("booking");
  return <StaffShell user={user}>{children}</StaffShell>;
}
