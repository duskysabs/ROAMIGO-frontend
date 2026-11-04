"use client";

import type { SessionUser } from "@/lib/auth/types";
import LogoutButton from "@/components/auth/LogoutButton";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { staffNavigation } from "@/lib/staff/data";
import { useMobileNavigation } from "./useMobileNavigation";
import StaffIcon from "./StaffIcon";
import { StaffProvider, useStaff } from "./StaffProvider";

function Shell({ children, user }: { children: ReactNode; user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { query, setQuery, message, announce } = useStaff();
  const { open: menuOpen, setOpen: setMenuOpen, sidebarRef, mainRef, toggleRef } = useMobileNavigation();
  return <div className="staff-portal booking-portal">
    <a className="staff-skip" href="#staff-content">Skip to content</a>
    <aside ref={sidebarRef} id="staff-navigation" className={`staff-sidebar ${menuOpen ? "is-open" : ""}`}>
      <button className="staff-nav-close" aria-label="Close booking navigation" onClick={() => setMenuOpen(false)}>×</button>
      <Link href="/staff" className="staff-brand" onClick={() => setMenuOpen(false)}>
        <Image src="/images/staff/dashboard-imgPlanetjLogo1.png" alt="Planet J Rent A Car" width={54} height={54} />
        <span><strong>ROAMIGO</strong><small>Staff Portal</small></span>
      </Link>
      <div className="staff-role"><small>Workspace</small><strong>Booking</strong><small>Booking operations access</small></div>
      <Link href="/accounting" className="staff-workspace-switch">Open Accounting →</Link><p className="staff-nav-label">Booking operations</p><nav aria-label="Staff navigation">{staffNavigation.map(item => <Link key={item.href} href={item.href} aria-current={(item.href === "/staff" ? pathname === item.href : pathname.startsWith(item.href)) ? "page" : undefined} onClick={() => { setMenuOpen(false); setQuery(""); }}><StaffIcon name={item.href.split("/")[2] ?? "dashboard"} />{item.label}</Link>)}</nav>
      <div className="staff-sidebar-foot"><Link href="/staff/help"><Image src="/images/staff/dashboard-imgSvg.svg" width={17} height={17} alt="" />Help & User Guide</Link><div className="staff-signout"><Image src="/images/staff/dashboard-imgSvg1.svg" width={17} height={17} alt="" /><LogoutButton /></div></div>
    </aside>
    {menuOpen ? <button className="staff-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /> : null}
    <div ref={mainRef} className="staff-main"><header className="staff-topbar">
      <button ref={toggleRef} className="staff-menu-toggle" aria-label="Toggle staff navigation" aria-expanded={menuOpen} aria-controls="staff-navigation" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <form role="search" onSubmit={e => { e.preventDefault(); router.push("/staff/bookings"); }}><StaffIcon name="search" /><input aria-label="Search bookings" placeholder="Search bookings, customers, routes…" value={query} onChange={e => setQuery(e.target.value)} /></form>
      <div className="staff-topbar-actions"><Link className="staff-notification-link" href="/staff/notifications" aria-label="View notifications"><StaffIcon name="notifications" /></Link><div className="staff-user"><span className="staff-avatar">{(user.displayName ?? user.email ?? "Staff").slice(0, 2).toUpperCase()}</span><span><strong>{user.displayName ?? user.email ?? "Booking Staff"}</strong><small>Staff · Booking</small></span></div></div>
    </header>
    <main id="staff-content" className="staff-content">{children}</main>
    </div>
    <div className="staff-toast" role="status" aria-live="polite">{message ? <><span>{message}</span><button aria-label="Dismiss message" onClick={() => announce("")}>×</button></> : null}</div>
  </div>;
}

export default function StaffShell({ children, user }: { children: ReactNode; user: SessionUser }) {
  return <StaffProvider><Shell user={user}>{children}</Shell></StaffProvider>;
}
