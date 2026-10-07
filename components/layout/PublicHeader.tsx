"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import { siteConfig } from "@/config/site";

type PublicHeaderProps = {
  isAuthenticated?: boolean;
  customerName?: string;
  customerEmail?: string;
};

export default function PublicHeader({
  isAuthenticated = false,
  customerName,
  customerEmail,
}: PublicHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = siteConfig.navigation.filter(
    (item) => !item.requiresAuthentication || isAuthenticated,
  );
  const accountLabel = customerName ?? "My account";
  const accountInitials = accountLabel
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-6 sm:px-10">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          aria-label={`${siteConfig.brand.companyName} home`}
        >
          <Image
            src={siteConfig.brand.logoPath}
            alt={siteConfig.brand.companyName}
            width={64}
            height={64}
            priority
          />
          <span className="hidden sm:block">
            <span className="block text-sm font-bold tracking-wide text-primary">
              {siteConfig.brand.systemName}
            </span>
            <span className="block text-xs text-muted-foreground">
              {siteConfig.brand.companyName}
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-6 text-sm font-medium lg:flex"
          aria-label="Main navigation"
        >
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "border-b-2 border-primary py-2 text-primary"
                    : "border-b-2 border-transparent py-2 text-foreground/75 transition-colors hover:text-primary"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <details className="group relative">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-primary/15 bg-surface-warm/60 py-1.5 pr-3 pl-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                  <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{accountInitials}</span>
                  <span className="max-w-32 truncate">{accountLabel}</span>
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" /></svg>
                </summary>
                <div className="absolute right-0 z-50 mt-3 w-72 rounded-2xl border border-border bg-background p-3 shadow-lg">
                  <div className="px-2 py-2">
                    <p className="truncate font-semibold text-foreground">{accountLabel}</p>
                    {customerEmail && <p className="mt-1 truncate text-xs text-muted-foreground">{customerEmail}</p>}
                  </div>
                  <div className="my-2 border-t border-border" />
                  <LogoutButton className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-warm disabled:cursor-not-allowed disabled:opacity-60" />
                </div>
              </details>
            </>
          ) : (
            <>
              <Link
                href={siteConfig.authentication.signup.href}
                className="inline-flex min-h-10 items-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {siteConfig.authentication.signup.label}
              </Link>
              <Link
                href={siteConfig.authentication.login.href}
                className="inline-flex min-h-10 items-center rounded-lg px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {siteConfig.authentication.login.label}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-border px-6 py-4 sm:px-10 lg:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={`block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-surface-warm text-primary"
                        : "hover:bg-surface-warm"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {isAuthenticated ? (
            <div className="mt-4 grid gap-3 border-t border-border pt-4">
              <div className="flex min-h-11 items-center gap-3 rounded-xl border border-primary/15 bg-surface-warm/60 p-2 pr-4 text-left text-sm font-semibold text-foreground">
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{accountInitials}</span>
                <span className="min-w-0">
                  <span className="block truncate">{accountLabel}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">{customerEmail ?? "Customer account"}</span>
                </span>
              </div>
              <LogoutButton
                onLoggedOut={closeMenu}
                className="rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 border-t border-border pt-4">
              <Link
                href={siteConfig.authentication.signup.href}
                onClick={closeMenu}
                className="block rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
              >
                {siteConfig.authentication.signup.label}
              </Link>
              <Link
                href={siteConfig.authentication.login.href}
                onClick={closeMenu}
                className="block rounded-md border border-primary px-4 py-2 text-center text-sm font-semibold text-primary"
              >
                {siteConfig.authentication.login.label}
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
