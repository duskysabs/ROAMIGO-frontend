import Link from "next/link";

export default function TourPackageNotFound() {
  return (
    <main className="flex flex-1 items-center bg-gradient-to-br from-surface-warm via-background to-background px-4 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-primary/15 bg-background p-7 text-center sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
          Package not found
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          We could not find that tour package
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          It may have been renamed, or it is no longer offered.
        </p>
        <Link
          href="/tour-packages"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Browse tour packages
        </Link>
      </div>
    </main>
  );
}
