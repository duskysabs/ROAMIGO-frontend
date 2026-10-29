import type { Metadata } from "next";
import StaffShell from "@/components/staff/StaffShell";
import "./staff.css";

export const metadata: Metadata = { title: "Booking Staff | ROAMIGO", robots: { index: false, follow: false } };

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <StaffShell>{children}</StaffShell>;
}
