import { requireStaff } from "@/lib/auth/require-staff";
import { RefundsView } from "@/components/accounting/AccountingViews";
export default async function Page() {
  await requireStaff("accounting");
  return <RefundsView />;
}
