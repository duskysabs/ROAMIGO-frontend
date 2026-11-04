import { requireStaff } from "@/lib/auth/require-staff";
import Link from "next/link";
import { PageHeading, Panel } from "@/components/staff/StaffUI";
export default async function StaffHelp() {
  await requireStaff("booking");

  return <><PageHeading title="Help & User Guide" description="Getting started with the Booking Staff portal." /><div className="staff-help"><Panel title="Review a booking"><p>Open <Link href="/staff/bookings">Bookings</Link>, filter the list, and choose View. Review the customer, requested route, and schedule. Select an available vehicle with enough passenger seats.</p></Panel><Panel title="Approve or adjust a quotation"><p>From a booking under review, accept the suggested price or enter an adjusted amount. Add a decision reason to move the booking to For Payment. Cancel Booking requires a reason and confirmation.</p></Panel><Panel title="Create a booking"><p>Select Add Booking from the booking list. Choose the booking type, customer, locations, schedule, passenger count, and available vehicle. The form checks passenger capacity and overlapping assignments.</p></Panel><Panel title="Explore schedules and reports"><p>Use Calendar to switch between week and month views. Fleet Availability shows vehicle details and readiness. Customer Records links booking history to each customer. Booking Reports exports CSV files.</p></Panel><Panel title="Switch workspaces"><p>Use Open Accounting to review payments, receivables, refunds, and customer accounts with your staff account.</p></Panel></div></>;
}
