import BookingDetails from "@/components/staff/BookingDetails";
export default async function StaffBookingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return <BookingDetails id={bookingId} />;
}
