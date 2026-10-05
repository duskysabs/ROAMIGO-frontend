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
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-primary/15 bg-background p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
          One last step
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Complete your profile
        </h1>
        <p className="mt-2 text-base leading-7 text-muted-foreground">
          Tell us who will be managing the bookings on this account.
        </p>

        <CompleteProfileForm redirectTo={redirectTo} />
      </div>
    </section>
  );
}
