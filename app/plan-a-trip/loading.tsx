import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

function FieldSkeleton() {
  return (
    <div>
      <div className="h-4 w-20 rounded-full bg-foreground/10" />
      <div className="mt-3 h-12 rounded-xl border border-border bg-background" />
    </div>
  );
}

export default function LoadingTripOptions() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-8 sm:px-8 sm:py-10">
        <header className="mx-auto mb-7 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Custom Trips</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Plan a Trip Around You</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Choose your schedule and destinations. Every service includes a professional driver.
          </p>
        </header>

        <div
          className="mx-auto max-w-3xl animate-pulse"
          role="status"
          aria-busy="true"
          aria-label="Loading trip options"
        >
          <span className="sr-only">Loading trip options...</span>

          <div className="mb-7 flex items-center" aria-hidden="true">
            {[0, 1, 2].map((step) => (
              <div key={step} className="flex min-w-0 flex-1 items-center last:flex-none">
                <div className={`h-8 w-8 shrink-0 rounded-full ${step === 0 ? "bg-primary/25" : "border border-border bg-background"}`} />
                <div className="ml-3 hidden h-4 w-20 rounded-full bg-foreground/10 sm:block" />
                {step < 2 && <div className="mx-4 h-px min-w-4 flex-1 bg-border" />}
              </div>
            ))}
          </div>

          <section className="rounded-3xl border border-primary/15 bg-background p-6 sm:p-8" aria-hidden="true">
            <div className="h-7 w-36 rounded-full bg-foreground/10" />
            <div className="mt-3 h-4 w-64 max-w-full rounded-full bg-foreground/5" />

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>

            <div className="mt-6 h-4 w-4/5 rounded-full bg-foreground/5" />
            <div className="mt-8 flex justify-end">
              <div className="h-12 w-full rounded-xl bg-primary/20 sm:w-52" />
            </div>
          </section>
        </div>
      </main>
      <Footer compact />
    </div>
  );
}
