"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminResources, resourceKeys } from "@/lib/admin/config";
export default function AdminNavigation() {
  const pathname = usePathname();
  const links = [{ href: "/admin", label: "Overview" }, ...resourceKeys.map(key => ({ href: "/admin/" + key, label: adminResources[key].title }))];
  return <nav aria-label="Administration" className="flex flex-wrap gap-2 self-start rounded-2xl border border-border bg-background p-3 lg:sticky lg:top-6 lg:flex-col">
    {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={"rounded-lg px-3 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-primary " + (pathname === link.href ? "bg-surface-warm text-primary" : "hover:bg-surface-warm")}>{link.label}</Link>)}
  </nav>;
}
