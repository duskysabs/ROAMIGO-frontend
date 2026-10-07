import Link from "next/link";
import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getSessionState } from "@/lib/auth/session";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const redirectTo = safeRedirectPath((await searchParams).next);
  const session = await getSessionState();

  if (session.status === "authenticated") {
    redirect(redirectTo);
  }

  return (
    <section className="flex items-start bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-6 sm:py-12 md:min-h-[calc(100dvh-5rem)] md:items-center lg:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[1fr_28rem] md:items-center lg:gap-20">
        <div className="hidden md:block">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Customer portal
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
            Plan with confidence.
            <span className="block text-primary">Travel with ease.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
            Create your customer account to plan trips, review quotations, and follow every booking in one place.
          </p>
          <ul className="mt-8 grid max-w-lg gap-4 text-sm text-foreground">
            {["Save and manage your booking requests", "Review trip schedules and payment status", "Keep your Cebu travel details together"].map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-primary/15 bg-background p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary md:hidden">
            ROAMIGO
          </p>
          <div className="mb-6 flex items-center gap-3" aria-label="Signup progress">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
            <span className="h-px flex-1 bg-border" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs font-bold text-muted-foreground">2</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Step 1 of 2 · Account details</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-2xl">
            Create your account
          </h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground">
            Start with your login details. You will add your customer profile next.
          </p>

          <SignupForm redirectTo={redirectTo} />
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/auth/login?next=${encodeURIComponent(redirectTo)}`}
              className="font-semibold text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
