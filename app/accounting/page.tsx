import { requireStaff } from "@/lib/auth/require-staff";
import { AccountingDashboard } from "@/components/accounting/AccountingViews";
export default async function Page() {
  await requireStaff("accounting");
  return <AccountingDashboard />;
}
