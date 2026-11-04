import { requireStaff } from "@/lib/auth/require-staff";
import BookingsView from "@/components/staff/BookingsView";
export default async function StaffBookings() {
  await requireStaff("booking");
 return <BookingsView />; }
