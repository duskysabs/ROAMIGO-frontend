"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import StaffIcon from "@/components/staff/StaffIcon";
import { adminResources, resourceKeys } from "@/lib/admin/config";
export default function AdminNavigation({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const links = [{ href: "/admin", label: "Overview" }, ...resourceKeys.map(key => ({ href: "/admin/" + key, label: adminResources[key].title }))];
  const icons: Record<string, string> = { Overview: "dashboard", Staff: "customers", Vehicles: "fleet", Drivers: "customers", "Tour Packages": "bookings", Pricing: "reports" };
  return <nav aria-label="Administration navigation">{links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} onClick={onNavigate}><StaffIcon name={icons[link.label] ?? "dashboard"} />{link.label}</Link>)}</nav>;
}
