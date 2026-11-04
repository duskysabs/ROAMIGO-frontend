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
      <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-2 md:items-center lg:gap-16">
        <div className="hidden md:block">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Customer Portal
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
            Start Your Journey.
            <span className="block text-primary">We&apos;ll Handle the Road.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
            Create an account to plan trips and manage your bookings in one
            place.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md bg-transparent py-2 sm:rounded-3xl sm:border sm:border-primary/15 sm:bg-background sm:p-7 lg:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary md:hidden">
            ROAMIGO
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:mt-0 md:text-2xl">
            Create Your Account
          </h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground">
            Enter your login details to get started.
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
