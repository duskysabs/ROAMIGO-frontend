"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, FormField, Input } from "@/components/ui";

type LoginResult = {
  message?: string;
  redirectTo?: string;
  nextStep?: "APPLICATION" | "COMPLETE_PROFILE" | "CONFIRM_EMAIL";
};

export default function LoginForm({
  redirectTo,
}: {
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next: redirectTo }),
      });

      const body = (await response.json().catch(() => null)) as LoginResult | null;

      if (!response.ok) {
        setError(body?.message ?? "Unable to log in. Please try again.");
        return;
      }
      if (body?.nextStep === "COMPLETE_PROFILE") {
        router.replace(
          `/auth/complete-profile?next=${encodeURIComponent(
            redirectTo ?? "/my-bookings",
          )}`,
        );
      } else {
        router.replace(body?.redirectTo ?? redirectTo ?? "/my-bookings");
      }
      router.refresh();
    } catch {
      setError("Unable to reach the login service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
      <FormField htmlFor="email" label="Email address">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={254}
          disabled={isSubmitting}
          placeholder="you@example.com"
        />
      </FormField>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-semibold text-foreground"
        >
          Password
        </label>
        <div className="relative mt-2">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={1024}
            disabled={isSubmitting}
            className="pr-20"
          />
          <button
            type="button"
            aria-controls="password"
            aria-pressed={showPassword}
            disabled={isSubmitting}
            onClick={() => setShowPassword((isVisible) => !isVisible)}
            className="absolute inset-y-0 right-0 flex min-w-16 items-center justify-center rounded-r-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 w-full px-5 py-3 text-base disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
