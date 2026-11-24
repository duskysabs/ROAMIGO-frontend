"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth/types";
import { adminResources, isAdminResource } from "@/lib/admin/config";
import { useMobileNavigation } from "@/components/staff/useMobileNavigation";
import LogoutButton from "@/components/auth/LogoutButton";
import AdminNavigation from "./AdminNavigation";

export default function AdminShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const { open, setOpen, sidebarRef, mainRef, toggleRef } = useMobileNavigation();
  const resource = pathname.split("/")[2] ?? "";
  const title = isAdminResource(resource) ? adminResources[resource].title : "Overview";
  const name = user.displayName ?? user.email ?? "Administrator";
  return <div className="staff-portal admin-portal">
    <a className="staff-skip" href="#admin-content">Skip to content</a>
    <aside ref={sidebarRef} id="admin-navigation" className={`staff-sidebar ${open ? "is-open" : ""}`}>
      <button className="staff-nav-close" aria-label="Close administration navigation" onClick={() => setOpen(false)}>×</button>
      <Link href="/admin" className="staff-brand" onClick={() => setOpen(false)}><Image src="/images/staff/dashboard-imgPlanetjLogo1.png" alt="Planet J Rent A Car" width={54} height={54} /><span><strong>ROAMIGO</strong><small>Admin Portal</small></span></Link>
      <div className="staff-role"><small>Workspace</small><strong>Administration</strong><small>People, fleet and booking settings</small></div>
      <Link className="staff-workspace-switch" href="/staff">Open Booking</Link>
      <Link className="staff-workspace-switch" href="/accounting">Open Accounting</Link>
      <AdminNavigation onNavigate={() => setOpen(false)} />
      <div className="staff-sidebar-foot"><div className="staff-signout"><LogoutButton /></div></div>
    </aside>
    {open && <button className="staff-backdrop" aria-label="Close administration navigation" onClick={() => setOpen(false)} />}
    <div ref={mainRef} className="staff-main"><header className="staff-topbar"><button ref={toggleRef} className="staff-menu-toggle" aria-label="Toggle administration navigation" aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen(!open)}>☰</button><span>ROAMIGO / <strong>{title}</strong></span><div className="staff-topbar-actions"><div className="staff-user"><span className="staff-avatar">{name.slice(0, 2).toUpperCase()}</span><span><strong>{name}</strong><small>Admin · Administration</small></span></div></div></header>
      <main id="admin-content" className="staff-content space-y-5">{children}</main>
    </div>
  </div>;
}
