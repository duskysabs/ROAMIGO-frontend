import { requireStaff } from "@/lib/auth/require-staff";
import FleetView from "@/components/staff/FleetView";
export default async function StaffFleet() {
  await requireStaff("booking");
 return <FleetView />; }
