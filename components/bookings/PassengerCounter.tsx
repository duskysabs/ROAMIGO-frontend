"use client";

import { useState } from "react";

type PassengerCounterProps = {
  value: number;
  error?: string;
  onChange: (value: number) => void;
};

export default function PassengerCounter({ value, error, onChange }: PassengerCounterProps) {
  const [text, setText] = useState(String(value));
  // Tracks the last `value` we've synced `text` from, so an external change
  // (the +/- buttons, or a parent resetting the draft) is reflected without
  // an effect — done during render per React's "adjusting state when a prop
  // changes" guidance, not useEffect+setState (which causes an extra render).
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(String(value));
  }

  function commit(raw: string) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isSafeInteger(parsed) && parsed >= 1) {
      onChange(parsed);
    } else {
      setText(String(value));
    }
  }

  // Shown immediately while the field is blank (which is also where "0"
  // ends up, since leading zeros are stripped) — not just after the form
  // is submitted. Falls back to whatever the parent's own validation
  // passed in, e.g. an over-capacity error.
  const liveError = text.trim() === "" ? "At least 1 passenger." : undefined;
  const displayError = liveError ?? error;

  return (
    <div>
      <p id="passengerCount-label" className="text-sm font-semibold text-foreground">Passengers</p>
      <div
        className={`mt-2 inline-grid min-h-12 grid-cols-[3rem_5rem_3rem] overflow-hidden rounded-xl border bg-background focus-within:ring-2 ${
          displayError
            ? "border-danger focus-within:border-danger focus-within:ring-danger/20"
            : "border-border focus-within:border-primary focus-within:ring-primary/20"
        }`}
      >
        <button type="button" aria-label="Remove one passenger" disabled={value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex items-center justify-center border-r border-border text-xl font-semibold text-primary transition-colors hover:bg-surface-warm disabled:cursor-not-allowed disabled:text-border">
          −
        </button>
        <input
          id="passengerCount"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-labelledby="passengerCount-label"
          aria-invalid={Boolean(displayError)}
          aria-describedby={displayError ? "passengerCount-error" : undefined}
          value={text}
          onChange={(event) => {
            // Strip leading zeros too, not just non-digits — otherwise
            // typing "0" would sit in the field looking like an accepted
            // value even though it's never committed as one.
            const digits = event.target.value.replace(/[^0-9]/g, "").replace(/^0+/, "");
            setText(digits);
            // Apply live as soon as what's typed is a valid count, instead
            // of waiting for blur/Enter — typing "20" updates the assigned
            // vehicle and trip cost after the second keystroke, not before.
            const parsed = Number.parseInt(digits, 10);
            if (Number.isSafeInteger(parsed) && parsed >= 1) {
              onChange(parsed);
            }
          }}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(event.currentTarget.value);
            }
          }}
          className="w-full border-0 bg-transparent text-center text-sm font-medium text-foreground outline-none"
        />
        <button type="button" aria-label="Add one passenger" onClick={() => onChange(value + 1)}
          className="flex items-center justify-center border-l border-border text-xl font-semibold text-primary transition-colors hover:bg-surface-warm">
          +
        </button>
      </div>
      {displayError && (
        <p id="passengerCount-error" className="mt-2 text-sm text-red-800">
          {displayError}
        </p>
      )}
    </div>
  );
}
