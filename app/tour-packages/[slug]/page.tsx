import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
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
      <div className="mx-auto max-w-4xl">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-surface-warm">
          <Image
            src={tourPackage.heroImage.path}
            alt={tourPackage.heroImage.alt}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
        </div>
        <header className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Cebu tour package
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {tourPackage.title}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            {tourPackage.description}
          </p>
        </header>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <section>
            <h2 className="text-lg font-bold tracking-tight">Itinerary</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {tourPackage.itinerary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="text-lg font-bold tracking-tight">
              What&apos;s included
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {tourPackage.inclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-primary/15 bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {tourPackage.duration} · up to {tourPackage.maxPassengers}{" "}
              passengers
            </p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {formatCurrency(tourPackage.pricePerPerson)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / person
              </span>
            </p>
          </div>
          <Button href={`/tour-packages/${tourPackage.slug}/book`} size="lg">
            Book this package
          </Button>
        </div>
      </div>
    </main>
  );
}
