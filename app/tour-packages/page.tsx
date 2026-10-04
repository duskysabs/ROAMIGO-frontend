import type { Metadata } from "next";
import PackageCard from "@/components/tour-packages/PackageCard";
import PageHeader from "@/components/ui/page-header";
import { tourPackages } from "@/lib/tour-packages/data";

export const metadata: Metadata = {
  title: "Tour Packages | ROAMIGO",
  description:
    "Browse predefined Cebu tour packages with complete service details.",
};

export default function TourPackagesPage() {
  return (
    <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Cebu tour packages"
          title="Browse predefined Cebu itineraries"
          description="Each package includes a professional driver and a complete, fixed itinerary — just choose your date and passenger count."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tourPackages.map((tourPackage) => (
            <PackageCard key={tourPackage.slug} tourPackage={tourPackage} />
          ))}
        </div>
      </div>
    </main>
  );
}
