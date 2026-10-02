export default function MyBookingsLoading() {
  return (
    <main className="flex-1 bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl animate-pulse" aria-label="Loading bookings">
        <div className="h-4 w-32 rounded bg-primary/10" />
        <div className="mt-4 h-10 w-64 rounded bg-foreground/10" />
        <div className="mt-3 h-5 max-w-xl rounded bg-foreground/5" />
        <div className="mt-10 space-y-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-52 rounded-2xl border border-border bg-background"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
