import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HeroSection() {
  const { home } = siteConfig;

  return (
    <section className="px-6 pb-10 pt-10 sm:px-10 sm:pt-14 lg:pb-16 lg:pt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="py-2 lg:py-8">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            {home.eyebrow}
          </p>
          <h1 className="mt-7 max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.055em] text-foreground sm:text-6xl xl:text-7xl">
            {home.heading.textBeforeHighlight}{" "}
            <span className="font-serif italic text-primary">{home.heading.highlightedText}</span>{" "}
            {home.heading.textAfterHighlight}
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground sm:text-lg">
            {home.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            {home.actions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${index === 0 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15 hover:bg-primary-hover" : "border border-primary/20 bg-white/60 text-primary hover:bg-white"}`}
              >
                {action.label}
                {index === 0 ? <span aria-hidden="true">↗</span> : null}
              </Link>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-primary/10 pt-5 text-xs font-medium text-muted-foreground">
            <span><span className="mr-2 text-primary" aria-hidden="true">✓</span>Professional driver included</span>
            <span><span className="mr-2 text-primary" aria-hidden="true">✓</span>Your trip, your pace</span>
          </div>
        </div>
        <div className="relative isolate pb-7 pl-0 sm:pl-5">
          <div className="relative aspect-[4/4.3] overflow-hidden rounded-[2rem] bg-surface-warm sm:aspect-[5/4] lg:aspect-[4/4.5]">
            <Image src={home.travelOptions[1].imagePath} alt={home.travelOptions[1].photoAlt} fill preload sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <div className="absolute left-7 top-7 rounded-full border border-white/40 bg-black/20 px-4 py-2 text-xs font-medium tracking-wide text-white backdrop-blur-md">Cebu, Philippines</div>
            <div className="absolute bottom-24 left-7 right-7 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">A little closer to paradise</p>
              <p className="mt-3 max-w-xs text-3xl font-medium leading-tight tracking-tight sm:text-4xl">More exploring.<br />Less planning.</p>
            </div>
          </div>
          <div className="absolute -bottom-0 left-3 right-3 flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-[0_12px_40px_-15px_#442c2533] sm:left-0 sm:right-auto sm:max-w-sm">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-warm text-xl text-primary" aria-hidden="true">↗</span>
            <div><p className="text-sm font-semibold">You make the memories.</p><p className="mt-1 text-xs text-muted-foreground">We’ll take care of the drive.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
