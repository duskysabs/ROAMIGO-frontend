import Link from "next/link";

const QUICK_LINKS: [{ label: string; href: string }, { label: string; href: string }] [] = [
  [
    { label: "Home", href: "/" },
    { label: "Feedback", href: "/feedback" },
  ],
  [
    { label: "Plan a trip", href: "/plan-a-trip" },
    { label: "Contact Us", href: "/contact" },
  ],
  [
    { label: "Tour Packages", href: "/tour-packages" },
    { label: "About Us", href: "/about" },
  ],
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-warm">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:px-10 md:grid-cols-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-primary">
           {/* Add Logo here */}
           PJ
        </div>
          <div>
            <h3 className="text-sm font-semibold underline underline-offset-4">
              Contact Us
            </h3>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>+63 912 345 6789</p>
              <p>Hotline/Viber/WhatsApp</p>
              <p>info@planetjrentacar.com</p>
              <p>Lapu-Lapu City, Cebu, Philippines</p>
            </div>
            </div>   

            <div>
              <h3 className="text-sm font-semibold underline underline-offset-4">
                Business Hours
              </h3>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>Sunday - Friday Open 24 Hours</p>
                <p>Saturday Closed</p>
                <p>Advanced booking is recommended for guaranteed availability.</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold underline underline-offset-4">
                Quick Links
              </h3>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {QUICK_LINKS.map((row) =>(
                  <li key={row[0].href} className="flex gap-4">
                    {row.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="hover:text-foreground"
                        >
                          › {link.label}
                        </Link>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
      </div>

      <div className="bg-primary px-6 py-4 text-center text-xs text-primary-foreground sm:px-10">
        © 2026 Planet J Rent A Car. All rights reserved. &nbsp;|&nbsp; Powered
        by <span className="font-bold">ROAMIGO</span>
      </div>
        </footer>
  )
}

