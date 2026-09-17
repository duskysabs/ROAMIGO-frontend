import { siteConfig } from "@/config/site";

export default function CheckoutValidation() {
  const { checkoutValidation } = siteConfig.home;

  return (
    <aside className="relative mt-8 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-surface-warm via-background to-background px-6 py-7 shadow-[0_18px_45px_-36px_rgba(179,56,44,0.65)] sm:px-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.7fr] lg:items-center lg:gap-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {checkoutValidation.eyebrow}
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">
            {checkoutValidation.title}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {checkoutValidation.description}
          </p>
        </div>

        <ol className="grid gap-5 sm:grid-cols-3 sm:gap-0">
          {checkoutValidation.steps.map((step, index) => (
            <li
              key={step}
              className="relative flex items-center gap-3 sm:flex-col sm:items-start sm:gap-3 sm:pr-6"
            >
              {index < checkoutValidation.steps.length - 1 && (
                <span
                  className="absolute left-[0.9375rem] top-8 h-[calc(100%+1.25rem)] w-px bg-primary/25 sm:left-8 sm:top-[0.9375rem] sm:h-px sm:w-[calc(100%-2rem)]"
                  aria-hidden="true"
                />
              )}

              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                {index + 1}
              </span>
              <span className="relative z-10 text-sm font-semibold leading-5 text-foreground sm:bg-background/80 sm:pr-2">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
