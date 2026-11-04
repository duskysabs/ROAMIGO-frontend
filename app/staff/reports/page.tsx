import { requireStaff } from "@/lib/auth/require-staff";
import ReportsView from "@/components/staff/ReportsView";
export default async function StaffReports() {
  await requireStaff("booking");
 return <ReportsView />; }
