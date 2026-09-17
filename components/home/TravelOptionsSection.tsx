import Link from "next/link";
import CheckoutValidation from "@/components/home/CheckoutValidation";
import { siteConfig } from "@/config/site";

export default function TravelOptionsSection() {
  const { home } = siteConfig;

  return (
    <section className="px-6 py-14 sm:px-10 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Trip options
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            Choose how you want to travel
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Start with a flexible custom trip or select a prepared Cebu tour
            package.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {home.travelOptions.map((option, index) => (
            <article
              key={option.title}
              className="flex min-h-64 flex-col rounded-2xl border border-border bg-background p-7 transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg sm:p-8"
            >
              <span className="text-xs font-bold tracking-[0.18em] text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
                {option.title}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                {option.description}
              </p>
              <Link
                href={option.action.href}
                className="mt-auto inline-flex min-h-11 items-center self-start pt-6 text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {option.action.label}
                <span className="ml-2" aria-hidden="true">
                  →
                </span>
              </Link>
            </article>
          ))}
        </div>

        <CheckoutValidation />
      </div>
    </section>
  );
}
