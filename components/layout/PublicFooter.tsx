import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function PublicFooter({ compact = false }: { compact?: boolean }) {
  const currentYear = new Date().getFullYear();
  const quickLinks = siteConfig.navigation.filter(
    (item) => !item.requiresAuthentication,
  );

  return (
    <footer className="border-t border-primary/10 bg-surface-warm">
      <div className={`mx-auto grid max-w-[90rem] gap-8 px-6 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.3fr_1.05fr_1.15fr_1.25fr] lg:gap-10 ${compact ? "py-5" : "py-7"}`}>
        <div className="max-w-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-background p-1 ring-1 ring-primary/10">
              <Image
                src={siteConfig.brand.logoPath}
                alt={siteConfig.brand.companyName}
                width={56}
                height={56}
              />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-primary">
                {siteConfig.brand.systemName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {siteConfig.brand.companyName}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {siteConfig.footer.description}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground">
            Contact
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {siteConfig.footer.location}
          </p>
          <Link
            href={siteConfig.footer.contactPage}
            className="mt-1 inline-flex min-h-9 items-center text-sm font-semibold text-primary underline-offset-4 hover:text-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Contact Us
          </Link>
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground">
            Business Hours
          </h2>
          <dl className="mt-3 max-w-[18rem] divide-y divide-primary/10 text-sm text-muted-foreground">
            {siteConfig.footer.businessHours.map((schedule) => (
              <div
                key={schedule.days}
                className="grid grid-cols-[minmax(0,8rem)_auto] items-start gap-5 py-2 first:pt-0 last:pb-0"
              >
                <dt className="leading-5">{schedule.days}</dt>
                <dd className="shrink-0 text-right leading-5">
                  {schedule.hours}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground">
            Quick Links
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-8 items-center hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary/10 bg-primary px-6 py-3 text-center text-xs leading-5 text-primary-foreground">
        © {currentYear} {siteConfig.brand.companyName}. All rights reserved.
        <span className="mx-2" aria-hidden="true">|</span>
        Powered by{" "}
        <span className="font-bold tracking-wide">
          {siteConfig.brand.systemName}
        </span>
      </div>
    </footer>
  );
}
