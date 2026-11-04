"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TripDatePickerProps = {
  id: string;
  label: string;
  value: string;
  min?: string;
  describedBy?: string;
  invalid?: boolean;
  onChange: (value: string) => void;
};

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const date = parseDate(value);
  return date
    ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date)
    : "Select date";
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function TripDatePicker({
  id,
  label,
  value,
  min,
  describedBy,
  invalid,
  onChange,
}: TripDatePickerProps) {
  const today = useMemo(() => {
    const current = new Date();
    return new Date(current.getFullYear(), current.getMonth(), current.getDate());
  }, []);
  const minimumDate = parseDate(min ?? "") ?? today;
  const selectedDate = parseDate(value);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate ?? minimumDate));
  const container = useRef<HTMLDivElement>(null);

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

  const firstDayOffset = visibleMonth.getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstDayOffset + daysInMonth }, (_, index) =>
    index < firstDayOffset ? null : new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - firstDayOffset + 1),
  );
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(visibleMonth);
  const previousMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  const previousDisabled = previousMonth < startOfMonth(minimumDate);

  function selectDate(date: Date) {
    onChange(toDateValue(date));
    setOpen(false);
  }

  return (
    <div ref={container} className="relative">
      <label id={`${id}-label`} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</label>
      <button
        id={id}
        type="button"
        aria-labelledby={`${id}-label ${id}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex min-h-12 w-full items-center justify-between rounded-xl border border-border bg-background px-4 text-left text-base outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{formatDate(value)}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 3v3m10-3v3M4.5 9.5h15M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        </svg>
      </button>
      {open && (
        <div role="dialog" aria-label={`${label} calendar`} className="absolute left-0 z-30 mt-2 w-[19rem] rounded-xl border border-border bg-background p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <button type="button" aria-label="Previous month" disabled={previousDisabled}
              onClick={() => setVisibleMonth(previousMonth)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-foreground hover:bg-surface-warm disabled:cursor-not-allowed disabled:text-border">‹</button>
            <p className="text-sm font-semibold">{monthLabel}</p>
            <button type="button" aria-label="Next month"
              onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-foreground hover:bg-surface-warm">›</button>
          </div>
          <div className="mt-3 grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground">
            {weekDays.map((day) => <span key={day} className="py-2">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} />;
              const dateValue = toDateValue(date);
              const isSelected = dateValue === value;
              const isToday = dateValue === toDateValue(today);
              const isDisabled = date < minimumDate;
              return (
                <button key={dateValue} type="button" disabled={isDisabled} onClick={() => selectDate(date)}
                  aria-pressed={isSelected}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${isSelected ? "bg-primary font-semibold text-primary-foreground" : isToday ? "border border-primary font-semibold text-primary" : "hover:bg-surface-warm"} disabled:cursor-not-allowed disabled:text-border disabled:hover:bg-transparent`}>
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
            <button type="button" onClick={() => onChange("")} className="font-medium text-muted-foreground hover:text-primary">Clear</button>
            <button type="button" disabled={today < minimumDate} onClick={() => selectDate(today)} className="font-semibold text-primary hover:text-primary-hover disabled:text-border">Today</button>
          </div>
        </div>
      )}
    </div>
  );
}
