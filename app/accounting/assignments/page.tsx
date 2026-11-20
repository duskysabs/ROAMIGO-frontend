import { requireStaff } from "@/lib/auth/require-staff";
import AccountingOperations from "@/components/accounting/AccountingOperations";
export default async function Page() {
  await requireStaff("accounting");
  return <AccountingOperations resource="assignments" />;
}
