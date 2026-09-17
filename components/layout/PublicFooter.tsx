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
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-10 md:grid-cols-4">
        <div>
          <Image
            src={siteConfig.brand.logoPath}
            alt={siteConfig.brand.companyName}
            width={72}
            height={72}
          />
        </div>

        <div>
          <h2 className="text-sm font-bold">Contact and location</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {siteConfig.footer.location}
          </p>
          <Link
            href={siteConfig.footer.contactPage}
            className="mt-3 inline-block text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Contact Us
          </Link>
        </div>

        <div>
          <h2 className="text-sm font-bold">Business hours</h2>
          <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
            {siteConfig.footer.businessHours.map((schedule) => (
              <div key={schedule.days} className="flex justify-between gap-6">
                <dt>{schedule.days}</dt>
                <dd>{schedule.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="text-sm font-bold">Quick links</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-primary px-6 py-4 text-center text-xs text-primary-foreground">
        © {currentYear} {siteConfig.brand.companyName}. All rights reserved.
        {" | "}
        Powered by{" "}
        <span className="font-bold">{siteConfig.brand.systemName}</span>
      </div>
    </footer>
  );
}
