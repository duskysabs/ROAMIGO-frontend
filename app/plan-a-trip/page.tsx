import type { Metadata } from "next";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import CustomTripForm from "@/components/bookings/CustomTripForm";
import { getVehicleTypes } from "@/lib/tour-packages/server";
import type { VehicleTypeOption } from "@/lib/bookings/types";
import Alert from "@/components/ui/alert";
import Button from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Plan a Custom Trip | ROAMIGO",
  description: "Plan your schedule, route, and stops for a driver-included custom trip.",
};

export default async function PlanTripPage() {
  let vehicleTypes: VehicleTypeOption[] = [];
  let unavailable = false;
  try {
    vehicleTypes = await getVehicleTypes();
  } catch {
    unavailable = true;
  }
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-8 sm:px-8 sm:py-10">
        <header className="mx-auto mb-7 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Custom Trips</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Plan a Trip Around You</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Choose your schedule and destinations. Every service includes a professional driver.</p>
        </header>
        {unavailable || vehicleTypes.length === 0 ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <Alert variant="warning" title={unavailable ? "Booking Options Are Unavailable" : "No Vehicle Categories Available"}>
              Please try again when booking options are available.
            </Alert>
            <Button href="/plan-a-trip" variant="outline">Try again</Button>
          </div>
        ) : <CustomTripForm vehicleTypes={vehicleTypes} />}
      </main>
      <Footer compact />
    </div>
  );
}
