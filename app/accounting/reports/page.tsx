import { requireStaff } from "@/lib/auth/require-staff";
import { AccountingReportsView } from "@/components/accounting/AccountingViews";
export default async function Page() {
  await requireStaff("accounting");
  return <AccountingReportsView />;
}
