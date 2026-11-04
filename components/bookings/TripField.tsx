import type { ReactNode } from "react";

export const tripInputClass = "mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-warm disabled:text-muted-foreground sm:text-sm";

export default function TripField({ id, label, error, children }: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}
