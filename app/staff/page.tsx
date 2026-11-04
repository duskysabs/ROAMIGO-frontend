import { requireStaff } from "@/lib/auth/require-staff";
import BookingsView from "@/components/staff/BookingsView";
export default async function StaffDashboard() {
  await requireStaff("booking");
 return <BookingsView dashboard />; }
