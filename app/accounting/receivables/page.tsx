import { requireStaff } from "@/lib/auth/require-staff";
import { ReceivablesView } from "@/components/accounting/AccountingViews";
export default async function Page() {
  await requireStaff("accounting");
  return <ReceivablesView />;
}
