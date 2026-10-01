import { redirect } from "next/navigation";
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
    <section className="bg-surface-warm px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-4xl rounded-xl border border-border bg-background p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Customer account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Welcome, {accountLabel}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Your session is active. Booking management will be added in the next
          customer feature.
        </p>

        <LogoutButton className="mt-8 inline-flex min-h-10 items-center rounded-lg border border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-warm disabled:cursor-not-allowed disabled:opacity-60" />
      </div>
    </section>
  );
}
