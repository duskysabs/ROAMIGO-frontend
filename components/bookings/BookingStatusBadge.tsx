import { humanizeBookingValue } from "@/lib/bookings/display";

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  DISPATCHED: "bg-blue-50 text-blue-800 ring-blue-200",
  IN_PROGRESS: "bg-blue-50 text-blue-800 ring-blue-200",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
  CANCELLED: "bg-slate-100 text-slate-700 ring-slate-200",
  REJECTED: "bg-red-50 text-red-800 ring-red-200",
  EXPIRED: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function BookingStatusBadge({ status }: { status: string }) {
  const styles =
    statusStyles[status] ?? "bg-amber-50 text-amber-900 ring-amber-200";

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${styles}`}
    >
      {humanizeBookingValue(status)}
    </span>
  );
}
