"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, FormField, Input } from "@/components/ui";

type SignupResult = {
  message?: string;
  nextStep?: "APPLICATION" | "COMPLETE_PROFILE" | "CONFIRM_EMAIL";
};

export default function SignupForm({
  redirectTo = "/my-bookings",
}: {
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
    null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(
      formData.get("passwordConfirmation") ?? "",
    );

    if (password !== passwordConfirmation) {
      setError("The passwords do not match.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Use a password between 8 and 128 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json().catch(() =>
        null,
      )) as SignupResult | null;

      if (!response.ok) {
        setError(body?.message ?? "Unable to create your account.");
        return;
      }

      if (body?.nextStep === "CONFIRM_EMAIL") {
        setConfirmationEmail(email);
        return;
      }

      if (body?.nextStep === "COMPLETE_PROFILE") {
        router.replace(
          `/auth/complete-profile?next=${encodeURIComponent(redirectTo)}`,
        );
        router.refresh();
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Unable to reach the signup service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmationEmail) {
    return (
      <Alert className="mt-6 p-5" variant="success">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <span aria-hidden="true" className="text-lg font-bold">
            ✓
          </span>
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Check your email
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We sent a confirmation link to <strong>{confirmationEmail}</strong>.
          Confirm your address, then return to log in and finish your profile.
        </p>
        <Link
          href={`/auth/login?next=${encodeURIComponent(redirectTo)}`}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Continue to login
        </Link>
      </Alert>
    );
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
      <FormField htmlFor="signup-email" label="Email address">
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={254}
          disabled={isSubmitting}
          placeholder="customer@example.com"
        />
      </FormField>

      <div>
        <label
          htmlFor="signup-password"
          className="text-sm font-semibold text-foreground"
        >
          Password
        </label>
        <div className="relative mt-2">
          <Input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            disabled={isSubmitting}
            aria-describedby="password-requirements"
            className="pr-20"
          />
          <button
            type="button"
            aria-controls="signup-password signup-password-confirmation"
            aria-pressed={showPassword}
            disabled={isSubmitting}
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-0 flex min-w-16 items-center justify-center rounded-r-xl px-3 text-sm font-semibold text-primary hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary disabled:opacity-60"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <p
          id="password-requirements"
          className="mt-2 text-xs text-muted-foreground"
        >
          Use at least 8 characters.
        </p>
      </div>

      <div>
        <label
          htmlFor="signup-password-confirmation"
          className="text-sm font-semibold text-foreground"
        >
          Confirm password
        </label>
        <Input
          id="signup-password-confirmation"
          name="passwordConfirmation"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          disabled={isSubmitting}
          className="mt-2"
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="border-t border-border pt-5">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full px-5 py-3 text-base disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          {isSubmitting ? "Creating account..." : "Create account and continue"}
        </Button>
        <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Your profile details are completed in the next step.</p>
      </div>
    </form>
  );
}
