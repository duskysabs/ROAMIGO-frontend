import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/auth/LogoutButton";
import { requireAdmin } from "@/lib/auth/require-admin";
import AdminNavigation from "@/components/admin/AdminNavigation";
export const metadata: Metadata = { title: "Administration | ROAMIGO", robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <div className="min-h-screen bg-surface-warm text-foreground">
    <a href="#admin-content" className="sr-only focus:not-sr-only focus:p-4">Skip to content</a>
    <header className="border-b border-border bg-background"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
      <Link href="/admin" className="flex items-center gap-3"><Image src="/images/planet-j-logo.png" alt="Planet J Rent A Car" width={48} height={48} /><span><strong className="block tracking-widest text-primary">ROAMIGO</strong><span className="text-sm text-muted-foreground">Administration</span></span></Link>
      <div className="flex flex-wrap items-center gap-4 text-sm"><span>{user.displayName ?? user.email}</span><Link className="font-semibold text-primary" href="/staff">Booking</Link><Link className="font-semibold text-primary" href="/accounting">Accounting</Link><LogoutButton /></div>
    </div></header>
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:py-8">
      <AdminNavigation />
      <main id="admin-content" className="min-w-0 space-y-6">{children}</main>
    </div>
  </div>;
}
