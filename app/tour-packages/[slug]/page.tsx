import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingStepper from "@/components/tour-packages/BookingStepper";
import Button from "@/components/ui/button";
import { formatCurrency } from "@/lib/bookings/display";
import { getTourPackage, tourPackages } from "@/lib/tour-packages/data";

export function generateStaticParams() {
  return tourPackages.map((tourPackage) => ({ slug: tourPackage.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tourPackage = getTourPackage(slug);

  if (!tourPackage) {
    return { title: "Tour Package Not Found | ROAMIGO" };
  }

  return {
    title: `${tourPackage.title} | ROAMIGO`,
    description: tourPackage.shortDescription,
  };
}

export default async function TourPackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tourPackage = getTourPackage(slug);

  if (!tourPackage) {
    notFound();
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link href="/tour-packages" className="font-semibold text-primary hover:text-primary-hover">
            Tour Packages
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-muted-foreground">Package Details</span>
        </nav>
        <header className="mt-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {tourPackage.title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {tourPackage.shortDescription}
          </p>
        </header>

        <div className="mt-6">
          <BookingStepper currentIndex={0} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {tourPackage.gallery.map((image) => (
                <div
                  key={image.path}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-warm"
                >
                  <Image
                    src={image.path}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover object-center"
                  />
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-bold tracking-tight">
                Established Package Route
              </h2>
              <ol className="mt-5 space-y-4">
                {tourPackage.routeStops.map((stop, index) => (
                  <li key={stop} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary text-xs font-bold text-primary"
                    >
                      {index + 1}
                    </span>
                    <span className="pt-0.5 text-sm text-foreground">{stop}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 rounded-lg border border-primary/20 bg-surface-warm px-4 py-3 text-sm text-foreground">
                The package route is fixed. Trip details and vehicle preference
                are entered in the next step.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-bold tracking-tight">
                Package Description and Inclusions
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {tourPackage.description}
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                {tourPackage.inclusions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                Package at a Glance
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Tour duration", tourPackage.duration],
                  ["Base package price", `${formatCurrency(tourPackage.pricePerPerson)} / person`],
                  ["Package status", "Approved"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-semibold text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                Before You Continue
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Driver-included service</li>
                <li>Established route and inclusions preserved</li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button href="/tour-packages" variant="outline" size="lg">
            ← Back to Tour Packages
          </Button>
          <Button href={`/tour-packages/${tourPackage.slug}/book`} size="lg">
            Enter Trip Details & Choose Vehicle →
          </Button>
        </div>
      </div>
    </main>
  );
}
