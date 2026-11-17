import { requireStaff } from "@/lib/auth/require-staff";
import BookingReviewsView from "@/components/staff/BookingReviewsView";
export default async function StaffBookings() {
  await requireStaff("booking");
  return <BookingReviewsView />;
}
