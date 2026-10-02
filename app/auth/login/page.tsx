import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getSessionState } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getSessionState();

  if (session.status === "authenticated") {
    redirect("/customer");
  }

  return (
    <section className="flex items-start bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-6 sm:py-12 md:min-h-[calc(100dvh-5rem)] md:items-center lg:px-10">
      <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-2 md:items-center lg:gap-16">
        <div className="hidden md:block">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Customer portal
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
            Welcome back.
            <span className="block text-primary">
              Let&apos;s get you on the road.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
            Manage your booking requests, payments, and upcoming trips in one
            place.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md bg-transparent py-2 sm:rounded-3xl sm:border sm:border-primary/15 sm:bg-background sm:p-7 lg:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary md:hidden">
            ROAMIGO
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:mt-0 md:text-2xl">
            <span className="md:hidden">Welcome back</span>
            <span className="hidden md:inline">Log in to ROAMIGO</span>
          </h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground">
            Enter your account details to manage your trips.
          </p>

          <LoginForm />
        </div>
      </div>
    </section>
  );
}
