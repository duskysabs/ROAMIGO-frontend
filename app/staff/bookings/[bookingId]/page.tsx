import { requireStaff } from "@/lib/auth/require-staff";
import BookingDetails from "@/components/staff/BookingDetails";
export default async function StaffBookingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  await requireStaff("booking");

  const { bookingId } = await params;
  return <BookingDetails id={bookingId} />;
}
