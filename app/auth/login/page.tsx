import {
  isStaffWorkspacePath,
  loginDestination,
} from "@/lib/auth/roles";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getSessionState } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = (await searchParams).next;
  const redirectTo = safeRedirectPath(Array.isArray(next) ? next[0] : next);
  const isStaffLogin = isStaffWorkspacePath(redirectTo);
  const session = await getSessionState();

  if (session.status === "authenticated") {
    redirect(loginDestination(session.user.role, redirectTo));
  }

  return (
    <section className="flex items-start bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-6 sm:py-12 md:min-h-[calc(100dvh-5rem)] md:items-center lg:px-10">
      <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-2 md:items-center lg:gap-16">
        <div className="hidden md:block">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
            {isStaffLogin ? "Staff portal" : "Customer portal"}
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
            {isStaffLogin ? "Welcome to operations." : "Welcome Back."}
            <span className="block text-primary">
              {isStaffLogin
                ? "Keep every trip moving."
                : "Let's get you on the road."}
            </span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
            {isStaffLogin
              ? "Review booking requests, fleet availability, payments, and assignments from one workspace."
              : "Manage your booking requests, payments, and upcoming trips in one place."}
          </p>
        </div>

        <div className="mx-auto w-full max-w-md bg-transparent py-2 sm:rounded-3xl sm:border sm:border-primary/15 sm:bg-background sm:p-7 lg:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary md:hidden">
            {isStaffLogin ? "Staff portal" : "ROAMIGO"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:mt-0 md:text-2xl">
            <span className="md:hidden">
              {isStaffLogin ? "Staff sign in" : "Welcome Back"}
            </span>
            <span className="hidden md:inline">
              {isStaffLogin ? "Staff sign in" : "Log In to ROAMIGO"}
            </span>
          </h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground">
            {isStaffLogin
              ? "Use your assigned Planet J staff account to open the operations workspace."
              : "Enter your account details to open your assigned workspace."}
          </p>

          <LoginForm redirectTo={redirectTo} />
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isStaffLogin ? (
              <>
                <span className="block">
                  Staff access is assigned by an administrator.
                </span>
                <Link
                  href="/"
                  className="mt-2 inline-block font-semibold text-primary hover:underline"
                >
                  Return to customer site
                </Link>
              </>
            ) : (
              <>
                New to ROAMIGO?{" "}
                <Link
                  href={`/auth/signup?next=${encodeURIComponent(redirectTo)}`}
                  className="font-semibold text-primary hover:underline"
                >
                  Create an account
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
