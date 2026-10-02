import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HeroSection() {
  const { home } = siteConfig;

  return (
    <section className="relative isolate min-h-[34rem] overflow-hidden lg:min-h-[38rem]">
      <Image
        src={home.heroPhoto.imagePath}
        alt={home.heroPhoto.alt}
        fill
        preload
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/50 to-black/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/35 via-transparent to-black/10"
      />

      <div className="mx-auto flex min-h-[34rem] max-w-7xl items-center px-6 py-16 sm:px-10 sm:py-20 lg:min-h-[38rem] lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/85">
            {home.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {home.heading.textBeforeHighlight}{" "}
            <span className="text-white">
              {home.heading.highlightedText}
            </span>{" "}
            {home.heading.textAfterHighlight}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            {home.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {home.actions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  index === 0
                    ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    : "inline-flex min-h-11 items-center justify-center rounded-lg border border-white/80 bg-black/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
