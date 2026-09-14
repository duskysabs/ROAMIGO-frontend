import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/"},
  { label: "Plan a Trip", href: "/plan-a-trip"},
  { label: "Tour Packages", href: "/tour-packages"},
  { label: "My Bookings", href: "/my-bookings"},
  { label: "Feedback", href: "/feedback"},
  { label: "Contact Us", href: "/contact"},
];

type NavbarProps = {
  isAuthenticated?: boolean;
  customerName?: string;
  activeHref?: string;
};

export default function Navbar({ 
  isAuthenticated = false,
  customerName = "Customer",
  activeHref = "/",
}: NavbarProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center pl-6 pr-0 sm:pl-10 sm:pr-1">
        <Link href="/" className="flex items-center gap-2" aria-label="ROAMIGO">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-warm text-sm font-semibold text-primary">
            PJ
          </div>
        </Link>

        <nav className="hidden items-center justify-center gap-8 text-sm font-medium md:flex md:ml-32">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === activeHref;
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "text-primary"
                    : "text-foreground/80 transition-colors hover:text-foreground"
                }
                >
                  {link.label}
                </Link>
            );
    })}
          </nav>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button 
                type="button"
                aria-label="Wishlist"
                className="text-foreground/70 transition-colors hover:text-foreground">
                  {/* Will add a bell icon here */}
                  🔔
                </button>
              <span className="h-6 w-px bg-border" aria-hidden />
              <span className="text-sm font-semibold text-foreground"> Hi, {customerName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="rounded-lg border border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-warm">
                  Log in
                </Link>

              <Link
                href="/auth/signup"
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">
                  Sign up
                </Link>
            </div>
          )}
      </div>
    </header>
  );
}