import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BookingWizard from "@/components/tour-packages/BookingWizard";
import Button from "@/components/ui/button";
import { BackendRequestError } from "@/lib/api/backend";
import { getSessionState } from "@/lib/auth/session";
import { getTourPackage, getVehicleTypes } from "@/lib/tour-packages/server";
import type { TourPackage, VehicleType } from "@/lib/tour-packages/types";

export const metadata: Metadata = {
  title: "Request a Tour Package | ROAMIGO",
};

export default async function TourPackageBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSessionState();
  const requestPath = "/tour-packages/" + slug + "/book";

  if (session.status === "unauthenticated") {
    redirect("/auth/login?next=" + encodeURIComponent(requestPath));
  }

  if (session.status === "unavailable") {
    return (
      <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-background p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Account service unavailable</h1>
          <p className="mt-2 text-muted-foreground">We could not verify your account. Please try again.</p>
          <Button href={requestPath} variant="outline" className="mt-6">Try again</Button>
        </div>
      </main>
    );
  }

  let tourPackage: TourPackage | null = null;
  let vehicleTypes: VehicleType[] = [];
  let loadingFailed = false;

  try {
    [tourPackage, vehicleTypes] = await Promise.all([
      getTourPackage(slug),
      getVehicleTypes(),
    ]);
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) {
      notFound();
    }
    loadingFailed = true;
  }

  if (loadingFailed || !tourPackage) {
    return (
      <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-background p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Booking options are unavailable</h1>
          <p className="mt-2 text-muted-foreground">Please try again after the service is available.</p>
          <Button href={"/tour-packages/" + slug} variant="outline" className="mt-6">Back to Package</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-8 sm:px-8 sm:py-10">
      <BookingWizard tourPackage={tourPackage} vehicleTypes={vehicleTypes} />
    </main>
  );
}
