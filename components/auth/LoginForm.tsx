"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

type LoginError = {
  message?: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as LoginError | null;
        setError(body?.message ?? "Unable to log in. Please try again.");
        return;
      }

      router.replace("/customer");
      router.refresh();
    } catch {
      setError("Unable to reach the login service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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
          className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-semibold text-foreground"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={1024}
          disabled={isSubmitting}
          className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="min-h-11 w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </Button>

    </form>
  );
}
