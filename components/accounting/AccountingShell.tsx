"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useMobileNavigation } from "@/components/staff/useMobileNavigation";
import LogoutButton from "@/components/auth/LogoutButton";
import type { SessionUser } from "@/lib/auth/types";
import { accountingNavigation } from "@/lib/accounting/data";
import { AccountingProvider } from "./AccountingProvider";
export function AccountingIcon({ index, size = 17 }: { index: number; size?: number }) {
  return <Image src={`/images/accounting/imgSvg${index === 0 ? "" : index}.svg`} alt="" width={size} height={size} />;
}
export default function AccountingShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const { open, setOpen, sidebarRef, mainRef, toggleRef } = useMobileNavigation();
  const name = user.displayName ?? user.email ?? "Staff";
  const title = accountingNavigation.find(([path]) => pathname === `/accounting${path ? `/${path}` : ""}`)?.[1] ?? "Help & User Guide";
  return <AccountingProvider><div className="staff-portal accounting-portal">
    <a className="staff-skip" href="#staff-content">Skip to content</a>
    <aside ref={sidebarRef} id="accounting-nav" className={`staff-sidebar ${open ? "is-open" : ""}`}>
      <button className="staff-nav-close" aria-label="Close accounting navigation" onClick={() => setOpen(false)}>×</button>
      <Link href="/accounting" className="staff-brand"><Image src="/images/accounting/imgPlanetjLogo1.png" width={54} height={54} alt="Planet J Rent A Car" /><span><strong>ROAMIGO</strong><small>Staff Portal</small></span></Link>
      <div className="staff-role"><small>Workspace</small><strong>Accounting</strong><small>Accounting operations access</small></div>
      <Link className="staff-workspace-switch" href="/staff">← Open Booking</Link>
      <nav aria-label="Accounting navigation">{accountingNavigation.map(([path, label, icon]) => { const href = `/accounting${path ? `/${path}` : ""}`; return <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}><AccountingIcon index={icon} />{label}</Link>; })}</nav>
      <div className="staff-sidebar-foot"><Link href="/accounting/help"><AccountingIcon index={13} />Help & User Guide</Link><div className="accounting-logout"><AccountingIcon index={14} /><LogoutButton /></div></div>
    </aside>
    {open ? <button className="staff-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} /> : null}
    <div ref={mainRef} className="staff-main"><header className="staff-topbar"><button ref={toggleRef} className="staff-menu-toggle" aria-label="Toggle accounting navigation" aria-expanded={open} aria-controls="accounting-nav" onClick={() => setOpen(!open)}>☰</button><span>ROAMIGO / <strong>{title}</strong></span><div className="staff-topbar-actions"><Link href="/accounting/notifications" aria-label="View accounting notifications"><AccountingIcon index={5} size={18} /></Link><div className="staff-user"><span className="staff-avatar">{name.slice(0, 2).toUpperCase()}</span><span><strong>{name}</strong><small>Staff · Accounting</small></span></div></div></header>
      <main id="staff-content" className="staff-content">{children}</main>
    </div>
  </div></AccountingProvider>;
}
