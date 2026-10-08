import { redirect } from "next/navigation";
import CompleteProfileForm from "@/components/auth/CompleteProfileForm";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getAccessToken } from "@/lib/auth/session";

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const redirectTo = safeRedirectPath((await searchParams).next);
  const accessToken = await getAccessToken();

  if (!accessToken) {
    const resumePath = `/auth/complete-profile?next=${encodeURIComponent(redirectTo)}`;
    redirect(`/auth/login?next=${encodeURIComponent(resumePath)}`);
  }

  return (
    <section className="flex items-start bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-6 sm:py-12 md:min-h-[calc(100dvh-5rem)] md:items-center lg:px-10">
      <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-2 md:items-center lg:gap-16">
        <div className="hidden md:block">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Customer Portal
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
            Almost Ready.
            <span className="block text-primary">Tell Us About You.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
            Complete your customer details so Planet J can manage your booking
            requests.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md bg-transparent py-2 sm:rounded-3xl sm:border sm:border-primary/15 sm:bg-background sm:p-7 lg:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary md:hidden">
            ROAMIGO
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:mt-0 md:text-2xl">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground">
            Add your customer details to finish setting up your account.
          </p>

          <CompleteProfileForm redirectTo={redirectTo} />
        </div>
      </div>
    </section>
  );
}
