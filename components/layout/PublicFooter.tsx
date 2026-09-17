import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const quickLinks = siteConfig.navigation.filter(
    (item) => !item.requiresAuthentication,
  );

  return (
    <footer className="border-t border-border bg-surface-warm">
      <div className="mx-auto grid max-w-[90rem] gap-8 px-6 py-8 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.3fr_1.15fr_1.25fr_1.2fr] lg:gap-10 lg:py-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <Image
              src={siteConfig.brand.logoPath}
              alt={siteConfig.brand.companyName}
              width={64}
              height={64}
            />
            <div>
              <p className="text-sm font-bold tracking-wide text-primary">
                {siteConfig.brand.systemName}
              </p>
              <p className="text-xs text-muted-foreground">
                {siteConfig.brand.companyName}
              </p>
            </div>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            {siteConfig.footer.description}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground">Contact</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground lg:whitespace-nowrap">
            {siteConfig.footer.location}
          </p>
          <Link
            href={siteConfig.footer.contactPage}
            className="mt-2 inline-block text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Contact Us
          </Link>
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground">Business hours</h2>
          <dl className="mt-3 max-w-sm space-y-2.5 text-sm text-muted-foreground">
            {siteConfig.footer.businessHours.map((schedule) => (
              <div
                key={schedule.days}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4"
              >
                <dt className="leading-5 lg:whitespace-nowrap">
                  {schedule.days}
                </dt>
                <dd className="whitespace-nowrap text-right leading-5">
                  {schedule.hours}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground">Quick links</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-muted-foreground">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="whitespace-nowrap hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-primary px-6 py-3 text-center text-xs leading-5 text-primary-foreground">
        © {currentYear} {siteConfig.brand.companyName}. All rights reserved.
        {" | "}
        Powered by{" "}
        <span className="font-bold">{siteConfig.brand.systemName}</span>
      </div>
    </footer>
  );
}
