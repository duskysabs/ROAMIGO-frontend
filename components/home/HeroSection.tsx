import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HeroSection() {
  const { home } = siteConfig;

  return (
    <section className="overflow-hidden bg-gradient-to-br from-surface-warm via-background to-background px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {siteConfig.brand.companyName}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {home.heading.textBeforeHighlight}{" "}
            <span className="text-primary">
              {home.heading.highlightedText}
            </span>{" "}
            {home.heading.textAfterHighlight}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {home.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {home.actions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  index === 0
                    ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    : "inline-flex min-h-11 items-center justify-center rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <aside className="relative rounded-3xl border border-primary/15 bg-background p-7 shadow-[0_24px_70px_-36px_rgba(179,56,44,0.45)] sm:p-9">
          <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-primary" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {siteConfig.brand.systemName}
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {home.serviceSummary.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {home.serviceSummary.description}
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {home.serviceSummary.items.map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl bg-surface-warm px-4 py-3 text-sm font-semibold text-foreground"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
