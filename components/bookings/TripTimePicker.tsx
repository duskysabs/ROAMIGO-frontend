"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TripTimePickerProps = {
  id: string;
  label: string;
  value: string;
  describedBy?: string;
  invalid?: boolean;
  onChange: (value: string) => void;
};

function formatTime(value: string) {
  if (!value) return "Select time";
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export default function TripTimePicker({ id, label, value, describedBy, invalid, onChange }: TripTimePickerProps) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const options = useMemo(() => Array.from({ length: 48 }, (_, index) => {
    const hours = Math.floor(index / 2);
    const minutes = index % 2 ? 30 : 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }), []);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={container} className="relative">
      <label id={`${id}-label`} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time</label>
      <button id={id} type="button" aria-labelledby={`${id}-label ${id}`} aria-haspopup="listbox" aria-expanded={open}
        aria-describedby={describedBy} aria-invalid={invalid} onClick={() => setOpen((current) => !current)}
        className="mt-2 flex min-h-12 w-full items-center justify-between rounded-xl border border-border bg-background px-4 text-left text-base outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm">
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{formatTime(value)}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
          <div role="listbox" aria-label={`${label} time`} className="max-h-64 overflow-y-auto p-2">
            {options.map((option) => (
              <button key={option} type="button" role="option" aria-selected={option === value}
                onClick={() => { onChange(option); setOpen(false); }}
                className={`flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm transition-colors ${option === value ? "bg-primary font-semibold text-primary-foreground" : "hover:bg-surface-warm"}`}>
                {formatTime(option)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
