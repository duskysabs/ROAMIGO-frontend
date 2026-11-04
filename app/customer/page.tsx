import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { getSessionState } from "@/lib/auth/session";

export default async function CustomerPage() {
  const session = await getSessionState();

  if (session.status === "unauthenticated") {
    redirect("/auth/login");
  }

  if (session.status === "unavailable") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 sm:px-10">
        <div className="rounded-xl border border-border bg-background p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Session check unavailable
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            We could not verify your account
          </h1>
          <p className="mt-3 text-muted-foreground">
            Make sure the ROAMIGO backend is running, then refresh this page.
          </p>
        </div>
      </section>
    );
  }

  const accountLabel =
    session.user.displayName ?? session.user.email ?? "Customer";

  return (
    <section className="bg-gradient-to-br from-surface-warm via-background to-background px-6 py-12 sm:px-10 sm:py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-primary/15 bg-background p-7 sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Customer account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Welcome, {accountLabel}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Manage your trips, review booking details, or start planning your next
          Cebu journey.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/my-bookings"
            className="rounded-2xl border border-primary/15 bg-surface-warm/60 p-5 transition-colors hover:border-primary/30 hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <p className="text-lg font-bold text-foreground">My bookings</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              View your upcoming trips, routes, status, and payment details.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-primary">
              View bookings <span aria-hidden="true" className="ml-2">→</span>
            </span>
          </Link>
          <Link
            href="/plan-a-trip"
            className="rounded-2xl border border-border p-5 transition-colors hover:border-primary/30 hover:bg-surface-warm/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <p className="text-lg font-bold text-foreground">Plan a trip</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Choose your schedule, stops, group size, and trip notes.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-primary">
              Start planning <span aria-hidden="true" className="ml-2">→</span>
            </span>
          </Link>
        </div>

        <LogoutButton className="mt-8 inline-flex min-h-10 items-center rounded-lg border border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-warm disabled:cursor-not-allowed disabled:opacity-60" />
      </div>
    </section>
  );
}
