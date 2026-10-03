"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

type ProfileResponse = { message?: string };

export default function CompleteProfileForm({
  redirectTo = "/customer",
}: {
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: String(formData.get("firstName") ?? "").trim(),
          lastName: String(formData.get("lastName") ?? "").trim(),
          birthDate: String(formData.get("birthDate") ?? ""),
          homeAddress: String(formData.get("homeAddress") ?? "").trim(),
        }),
      });
      const body = (await response.json().catch(() =>
        null,
      )) as ProfileResponse | null;

      if (response.status === 401) {
        const resumePath = `/auth/complete-profile?next=${encodeURIComponent(redirectTo)}`;
        router.replace(
          `/auth/login?next=${encodeURIComponent(resumePath)}`,
        );
        router.refresh();
        return;
      }

      if (!response.ok) {
        setError(body?.message ?? "Unable to complete your profile.");
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Unable to reach the profile service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="text-sm font-semibold text-foreground"
          >
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={100}
            disabled={isSubmitting}
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-surface-warm disabled:opacity-70 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="text-sm font-semibold text-foreground"
          >
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            maxLength={100}
            disabled={isSubmitting}
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-surface-warm disabled:opacity-70 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="birthDate"
          className="text-sm font-semibold text-foreground"
        >
          Birth date{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="birthDate"
          name="birthDate"
          type="date"
          autoComplete="bday"
          disabled={isSubmitting}
          className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-surface-warm disabled:opacity-70 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="homeAddress"
          className="text-sm font-semibold text-foreground"
        >
          Home address{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="homeAddress"
          name="homeAddress"
          autoComplete="street-address"
          rows={3}
          maxLength={255}
          disabled={isSubmitting}
          placeholder="Street, barangay, city, province"
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none placeholder:text-muted-foreground/75 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-surface-warm disabled:opacity-70 sm:text-sm"
        />
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 w-full px-5 py-3 text-base disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
      >
        {isSubmitting ? "Saving profile..." : "Complete profile"}
      </Button>
    </form>
  );
}
