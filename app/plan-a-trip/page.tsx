import type { Metadata } from "next";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import CustomTripForm from "@/components/bookings/CustomTripForm";

export const metadata: Metadata = {
  title: "Plan a Custom Trip | ROAMIGO",
  description: "Plan your schedule, route, and stops for a driver-included custom trip.",
};

export default function PlanTripPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-8 sm:px-8 sm:py-10">
        <header className="mx-auto mb-7 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Custom trips</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Plan a trip around you</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Choose your schedule and destinations. Every service includes a professional driver.</p>
        </header>
        <CustomTripForm />
      </main>
      <Footer compact />
    </div>
  );
}
