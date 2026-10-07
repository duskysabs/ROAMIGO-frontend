import Image from "next/image";
import Link from "next/link";
import CheckoutValidation from "@/components/home/CheckoutValidation";
import { siteConfig } from "@/config/site";

export default function TravelOptionsSection() {
  const { home } = siteConfig;

  return (
    <section className="px-6 pb-14 pt-8 sm:px-10 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-12">
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
          {home.travelOptions.map((option) => (
            <article
              key={option.title}
              className="group overflow-hidden rounded-2xl border border-border bg-background transition-[border-color,transform] hover:-translate-y-1 hover:border-primary/30"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-warm">
                <Image
                  src={option.imagePath}
                  alt={option.photoAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex min-h-52 flex-col p-7 sm:p-8">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
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
              </div>
            </article>
          ))}
        </div>

        <article className="mt-6 grid overflow-hidden rounded-2xl border border-border bg-background lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-72 overflow-hidden lg:min-h-80">
            <Image
              src={home.fleet.imagePath}
              alt={home.fleet.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-[center_55%]"
            />
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {home.fleet.eyebrow}
            </p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {home.fleet.title}
            </h3>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              {home.fleet.description}
            </p>
            <CheckoutValidation />
          </div>
        </article>
      </div>
    </section>
  );
}
