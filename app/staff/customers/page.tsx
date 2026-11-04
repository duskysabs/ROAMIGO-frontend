import { requireStaff } from "@/lib/auth/require-staff";
import CustomersView from "@/components/staff/CustomersView";
export default async function StaffCustomers({ searchParams }: { searchParams: Promise<{ customer?: string }> }) {
  await requireStaff("booking");
 return <CustomersView customerId={(await searchParams).customer} />; }
