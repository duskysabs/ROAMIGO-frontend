import { requireStaff } from "@/lib/auth/require-staff";
import { PaymentsView } from "@/components/accounting/AccountingViews";
export default async function Page() {
  await requireStaff("accounting");
  return <PaymentsView />;
}
