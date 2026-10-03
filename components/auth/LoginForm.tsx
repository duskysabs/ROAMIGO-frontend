"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

type LoginResult = {
  message?: string;
  nextStep?: "APPLICATION" | "COMPLETE_PROFILE" | "CONFIRM_EMAIL";
};

export default function LoginForm({
  redirectTo = "/customer",
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
        body: JSON.stringify({ email, password }),
      });

      const body = (await response.json().catch(() => null)) as LoginResult | null;

      if (!response.ok) {
        setError(body?.message ?? "Unable to log in. Please try again.");
        return;
      }

      if (body?.nextStep === "COMPLETE_PROFILE") {
        router.replace(
          `/auth/complete-profile?next=${encodeURIComponent(redirectTo)}`,
        );
      } else {
        router.replace(redirectTo);
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
      <div>
        <label
          htmlFor="email"
          className="text-sm font-semibold text-foreground"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          disabled={isSubmitting}
          placeholder="customer@example.com"
          className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition placeholder:text-muted-foreground/75 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-warm disabled:opacity-70 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-semibold text-foreground"
        >
          Password
        </label>
        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={1024}
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-xl border border-border bg-background py-3 pl-4 pr-20 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-warm disabled:opacity-70 sm:text-sm"
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
        {isSubmitting ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
