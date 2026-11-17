import { requireStaff } from "@/lib/auth/require-staff";
import BookingReviewDetails from "@/components/staff/BookingReviewDetails";
export default async function StaffBookingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  await requireStaff("booking");

  const { bookingId } = await params;
  return <BookingReviewDetails id={bookingId} />;
}
