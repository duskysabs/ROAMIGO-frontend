"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, FormField, Input, Textarea } from "@/components/ui";

type ProfileResponse = { message?: string };

export default function CompleteProfileForm({
  redirectTo = "/my-bookings",
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
        <FormField htmlFor="firstName" label="First name">
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={100}
            disabled={isSubmitting}
          />
        </FormField>
        <FormField htmlFor="lastName" label="Last name">
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            maxLength={100}
            disabled={isSubmitting}
          />
        </FormField>
      </div>

      <FormField htmlFor="birthDate" label="Birth date" optional>
        <Input
          id="birthDate"
          name="birthDate"
          type="date"
          autoComplete="bday"
          disabled={isSubmitting}
        />
      </FormField>

      <FormField htmlFor="homeAddress" label="Home address" optional>
        <Textarea
          id="homeAddress"
          name="homeAddress"
          autoComplete="street-address"
          rows={3}
          maxLength={255}
          disabled={isSubmitting}
          placeholder="Street, barangay, city, province"
        />
      </FormField>

      {error && <Alert variant="danger">{error}</Alert>}

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
