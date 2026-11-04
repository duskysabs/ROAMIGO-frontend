import { requireStaff } from "@/lib/auth/require-staff";
import { PageHeading, Panel } from "@/components/staff/StaffUI";
export default async function Page() {
  await requireStaff("accounting");
  return <><PageHeading title="Help & User Guide" description="Accounting workspace for authenticated staff." /><div className="staff-help"><Panel title="Separate workspaces, one staff account"><p>Booking handles requests, quotations, schedules, and fleet availability. Accounting handles payments, receivables, refunds, customer accounts, and financial exports. Use Open Booking to switch sections. Both sections are available through your staff account.</p></Panel><Panel title="Review payments and refunds"><p>Open a payment awaiting review and enter verification notes. Manual entries start in Needs Review. Refund requests move to Processing before Refunded; each decision requires notes.</p></Panel><Panel title="Reports and exports"><p>Open Accounting Reports to generate collection, receivable, refund, and revenue reports. Use search and filters to find the records you need.</p></Panel></div></>;
}
