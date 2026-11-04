import { requireStaff } from "@/lib/auth/require-staff";
import NotificationsView from "@/components/staff/NotificationsView";
export default async function StaffNotifications() {
  await requireStaff("booking");
 return <NotificationsView />; }
