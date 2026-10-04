import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookingWizard from "@/components/tour-packages/BookingWizard";
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

  return {
    title: tourPackage
      ? `Book ${tourPackage.title} | ROAMIGO`
      : "Tour Package Not Found | ROAMIGO",
  };
}

export default async function TourPackageBookPage({
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
    <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-8 sm:px-8 sm:py-10">
      <BookingWizard tourPackage={tourPackage} />
    </main>
  );
}
