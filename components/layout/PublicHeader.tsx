"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";

type PublicHeaderProps = {
  isAuthenticated?: boolean;
  customerName?: string;
};

export default function PublicHeader({
  isAuthenticated = false,
  customerName,
}: PublicHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = siteConfig.navigation.filter(
    (item) => !item.requiresAuthentication || isAuthenticated,
  );

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-6 sm:px-10">
        <Link
          href="/"
          onClick={closeMenu}
          aria-label={`${siteConfig.brand.companyName} home`}
        >
          <Image
            src={siteConfig.brand.logoPath}
            alt={siteConfig.brand.companyName}
            width={64}
            height={64}
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-7 text-sm font-medium md:flex"
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
                    ? "text-primary"
                    : "text-foreground/80 transition-colors hover:text-primary"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <span className="text-sm font-semibold">
              {customerName ?? "Customer"}
            </span>
          ) : (
            <>
              <Link
                href={siteConfig.authentication.login.href}
                className="rounded-md border border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-warm"
              >
                {siteConfig.authentication.login.label}
              </Link>
              <Link
                href={siteConfig.authentication.signup.href}
                className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                {siteConfig.authentication.signup.label}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          Menu
        </button>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-border px-6 py-4 md:hidden"
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

          {!isAuthenticated && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <Link
                href={siteConfig.authentication.login.href}
                onClick={closeMenu}
                className="rounded-md border border-primary px-4 py-2 text-center text-sm font-semibold text-primary"
              >
                {siteConfig.authentication.login.label}
              </Link>
              <Link
                href={siteConfig.authentication.signup.href}
                onClick={closeMenu}
                className="rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
              >
                {siteConfig.authentication.signup.label}
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
