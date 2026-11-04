import type { Metadata } from "next";
import PackageCard from "@/components/tour-packages/PackageCard";
import PageHeader from "@/components/ui/page-header";
import { getTourPackages } from "@/lib/tour-packages/server";
import type { TourPackage } from "@/lib/tour-packages/types";

export const metadata: Metadata = {
  title: "Tour Packages | ROAMIGO",
  description:
    "Browse predefined Cebu tour packages with complete service details.",
};

export default async function TourPackagesPage() {
  let tourPackages: TourPackage[] = [];
  let isUnavailable = false;

  try {
    tourPackages = await getTourPackages();
  } catch {
    isUnavailable = true;
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Cebu Tour Packages"
          title="Browse Predefined Cebu Itineraries"
          description="Browse active fixed-route packages maintained by Planet J. Choose a package to review its approved route, duration, and base price."
        />
        {isUnavailable ? (
          <div className="mt-8 rounded-2xl border border-border bg-background p-8 text-center">
            <h2 className="text-xl font-bold text-foreground">Tour Packages Are Unavailable</h2>
            <p className="mt-2 text-sm text-muted-foreground">Please try again after the service is available.</p>
          </div>
        ) : tourPackages.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-background p-8 text-center">
            <h2 className="text-xl font-bold text-foreground">No Active Packages Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Planet J has not published any tour packages.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tourPackages.map((tourPackage) => (
              <PackageCard key={tourPackage.id} tourPackage={tourPackage} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
