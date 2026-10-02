import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HeroSection() {
  const { home } = siteConfig;

  return (
    <section className="px-6 py-16 sm:px-10 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {home.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-7xl">
            {home.heading.textBeforeHighlight}{" "}
            {home.heading.highlightedText}{" "}
            {home.heading.textAfterHighlight}
          </h1>
        </div>

        <div className="lg:border-l lg:border-primary/20 lg:pb-1 lg:pl-10">
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {home.description}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            {home.actions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  index === 0
                    ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    : "inline-flex min-h-11 items-center justify-center rounded-lg border border-primary/70 bg-background px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
