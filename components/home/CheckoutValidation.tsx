import { siteConfig } from "@/config/site";

export default function CheckoutValidation() {
  const { checkoutValidation } = siteConfig.home;

  return (
    <div className="mt-6 border-t border-border pt-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        {checkoutValidation.eyebrow}
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {checkoutValidation.items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <svg viewBox="0 0 20 20" fill="none" className="size-3.5">
                <path
                  d="m5.5 10 3 3 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
