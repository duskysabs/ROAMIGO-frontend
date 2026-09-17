import Link from "next/link";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { siteConfig } from "@/config/site";

export default function Home() {
  const { home } = siteConfig;

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-r from-surface-warm to-background px-6 py-20 sm:px-10 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {siteConfig.brand.companyName}
              </p>
              <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                {home.heading.textBeforeHighlight}{" "}
                <span className="text-primary">
                  {home.heading.highlightedText}
                </span>{" "}
                {home.heading.textAfterHighlight}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                {home.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {home.actions.map((action, index) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={
                      index === 0
                        ? "rounded-md bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                        : "rounded-md border border-primary px-6 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-background"
                    }
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-primary/15 bg-background/70 p-10 shadow-sm">
              <span className="rounded-full border border-primary px-8 py-4 text-lg font-bold tracking-[0.2em] text-primary">
                {siteConfig.brand.systemName}
              </span>
            </div>
          </div>
        </section>

        <section className="px-6 py-14 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-foreground">
              Choose how you want to travel
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {home.travelOptions.map((option) => (
                <article
                  key={option.title}
                  className="rounded-lg border border-border bg-background p-8"
                >
                  <h3 className="text-xl font-bold text-foreground">
                    {option.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                  <Link
                    href={option.action.href}
                    className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    {option.action.label}
                  </Link>
                </article>
              ))}
            </div>

            <p className="mt-6 rounded-md border border-primary/15 bg-surface-warm px-4 py-3 text-center text-sm text-muted-foreground">
              {home.validationMessage}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {home.features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-lg border border-border bg-background p-5"
                >
                  <h3 className="text-sm font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
