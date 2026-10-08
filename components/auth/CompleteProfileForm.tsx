"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import TripDatePicker from "@/components/bookings/TripDatePicker";
import { Alert, Button, FormField, Input, Textarea } from "@/components/ui";
import { isValidPhoneNumber } from "@/lib/auth/profile";

type ProfileResponse = { message?: string };

type PhilippinePhoneInputProps = {
  id?: string;
  value: string;
  disabled?: boolean;
  invalid?: boolean;
  "aria-describedby"?: string;
  onChange: (value: string) => void;
};

function PhilippinePhoneInput({
  id,
  value,
  disabled,
  invalid,
  "aria-describedby": describedBy,
  onChange,
}: PhilippinePhoneInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    let digits = event.target.value.replace(/\D/g, "");

    if (digits.length > 10 && digits.startsWith("63")) {
      digits = digits.slice(2);
    } else if (digits.length > 10 && digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    onChange(digits.slice(0, 10));
  }

  return (
    <div
      className={`flex min-h-12 w-full items-center rounded-xl border bg-background transition focus-within:ring-2 disabled:cursor-not-allowed ${invalid ? "border-danger focus-within:border-danger focus-within:ring-danger/20" : "border-border focus-within:border-primary focus-within:ring-primary/20"}`}
    >
      <span className="border-r border-border px-4 text-sm font-semibold text-foreground">
        +63
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={value}
        required
        maxLength={10}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={handleChange}
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground/75 disabled:cursor-not-allowed disabled:bg-surface-warm disabled:text-muted-foreground sm:text-sm"
      />
    </div>
  );
}

function dateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CompleteProfileForm({
  redirectTo = "/my-bookings",
}: {
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const today = new Date();
  const initialBirthMonth = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    1,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const phoneNumber = `+63${phoneDigits}`;

    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Enter the complete 10-digit phone number after +63.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: String(formData.get("firstName") ?? "").trim(),
          lastName: String(formData.get("lastName") ?? "").trim(),
          phoneNumber,
          birthDate,
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
    <form className="mt-6 space-y-4 sm:space-y-5" onSubmit={handleSubmit} noValidate>
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

      <FormField
        htmlFor="phoneNumber"
        label="Phone number"
      >
        <PhilippinePhoneInput
          id="phoneNumber"
          value={phoneDigits}
          disabled={isSubmitting}
          onChange={setPhoneDigits}
        />
      </FormField>

      <FormField htmlFor="birthDate" label="Birth date" optional>
        <TripDatePicker
          id="birthDate"
          label="Birth date"
          value={birthDate}
          min="1900-01-01"
          max={dateValue(today)}
          initialMonth={dateValue(initialBirthMonth)}
          showLabel={false}
          showYearSelect
          disabled={isSubmitting}
          onChange={setBirthDate}
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
