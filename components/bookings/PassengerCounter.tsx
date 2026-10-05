type PassengerCounterProps = {
  value: number;
  error?: string;
  onChange: (value: number) => void;
};

export default function PassengerCounter({ value, error, onChange }: PassengerCounterProps) {
  return (
    <div>
      <p id="passengerCount-label" className="text-sm font-semibold text-foreground">Passengers</p>
      <div className="mt-2 inline-grid min-h-12 grid-cols-[3rem_5rem_3rem] overflow-hidden rounded-xl border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <button type="button" aria-label="Remove one passenger" disabled={value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex items-center justify-center border-r border-border text-xl font-semibold text-primary transition-colors hover:bg-surface-warm disabled:cursor-not-allowed disabled:text-border">
          −
        </button>
        <output id="passengerCount" aria-labelledby="passengerCount-label" aria-live="polite"
          className="flex items-center justify-center text-sm font-medium text-foreground">
          {value}
        </output>
        <button type="button" aria-label="Add one passenger" onClick={() => onChange(value + 1)}
          className="flex items-center justify-center border-l border-border text-xl font-semibold text-primary transition-colors hover:bg-surface-warm">
          +
        </button>
      </div>
      {error && <p id="passengerCount-error" className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}
