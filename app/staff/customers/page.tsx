import CustomersView from "@/components/staff/CustomersView";
export default async function StaffCustomers({ searchParams }: { searchParams: Promise<{ customer?: string }> }) { return <CustomersView customerId={(await searchParams).customer} />; }
