import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingStepper from "@/components/tour-packages/BookingStepper";
import Button from "@/components/ui/button";
import { BackendRequestError } from "@/lib/api/backend";
import { formatCurrency } from "@/lib/bookings/display";
import { getTourPackage } from "@/lib/tour-packages/server";
import type { TourPackage } from "@/lib/tour-packages/types";

export const metadata: Metadata = {
  title: "Tour Package Details | ROAMIGO",
};

export default async function TourPackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let tourPackage: TourPackage;

  try {
    tourPackage = await getTourPackage(slug);
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) {
      notFound();
    }

    return (
      <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-background p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Package details are unavailable</h1>
          <p className="mt-2 text-muted-foreground">Please try again after the service is available.</p>
          <Button href="/tour-packages" variant="outline" className="mt-6">
            Back to Tour Packages
          </Button>
        </div>
      </main>
    );
  }

  const hours = Math.max(1, Math.round(tourPackage.estimatedDurationMinutes / 60));

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
            {tourPackage.name}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {tourPackage.description}
          </p>
        </header>

        <div className="mt-6">
          <BookingStepper currentIndex={0} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {tourPackage.gallery.map((image) => (
                <div key={image.path} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-warm">
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
              <h2 className="text-lg font-bold tracking-tight">Established Package Route</h2>
              <ol className="mt-5 space-y-4">
                {tourPackage.stops.map((stop) => (
                  <li key={stop.sequenceNumber} className="flex items-start gap-3">
                    <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary text-xs font-bold text-primary">
                      {stop.sequenceNumber}
                    </span>
                    <div className="pt-0.5">
                      <p className="text-sm font-medium text-foreground">{stop.locationName}</p>
                      {stop.activity && (
                        <p className="mt-1 text-sm text-muted-foreground">{stop.activity}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-5 rounded-lg border border-primary/20 bg-surface-warm px-4 py-3 text-sm text-foreground">
                The approved package route is fixed. Your schedule, group size, pickup notes, and vehicle preference are entered next.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-lg font-bold tracking-tight">Package Description</h2>
              <p className="mt-4 leading-7 text-muted-foreground">{tourPackage.description}</p>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Package at a Glance</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Tour duration", "About " + hours + " hours"],
                  ["Base package price", "From " + formatCurrency(tourPackage.basePrice)],
                  ["Package status", "Active"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-semibold text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Before You Continue</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Driver-included service</li>
                <li>Vehicle and driver availability is checked before submission</li>
                <li>Submitting a request does not confirm the booking</li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          <Button href="/tour-packages" variant="outline" size="lg" className="flex-1 justify-center">
            Back to Tour Packages
          </Button>
          <Button href={"/tour-packages/" + tourPackage.id + "/book"} size="lg" className="flex-1 justify-center">
            Customize and Request
          </Button>
        </div>
      </div>
    </main>
  );
}
