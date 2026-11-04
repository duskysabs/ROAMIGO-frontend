import { requireStaff } from "@/lib/auth/require-staff";
import CalendarView from "@/components/staff/CalendarView";
export default async function StaffCalendar() {
  await requireStaff("booking");
 return <CalendarView />; }
