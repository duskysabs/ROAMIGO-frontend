import { siteConfig } from "@/config/site";

export default function FeatureHighlights() {
  return (
    <section className="border-y border-border bg-surface-warm/45 px-6 py-12 sm:px-10 sm:py-14">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3 md:gap-0">
        {siteConfig.home.features.map((feature, index) => (
          <article
            key={feature.title}
            className="md:px-8 md:first:pl-0 md:last:pr-0 md:not-first:border-l md:not-first:border-primary/15"
          >
            <p className="text-xs font-bold text-primary">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-3 text-lg font-bold text-foreground">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
