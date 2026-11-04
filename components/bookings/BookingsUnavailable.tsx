import Link from "next/link";

export default function BookingsUnavailable({
  title = "We Could Not Load Your Bookings",
  description = "The booking service may be temporarily unavailable. Please try again in a moment.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/15 bg-background p-6 sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
        Bookings Unavailable
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
        {description}
      </p>
      <Link
        href="/my-bookings"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Try again
      </Link>
    </div>
  );
}
