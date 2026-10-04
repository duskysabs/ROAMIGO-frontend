const steps = [
  { label: "Package Details", description: "Route, schedule, and preferences." },
  { label: "Customize Trip Details", description: "Adjust your travel date, passengers, and pickup." },
  { label: "Review & Submit", description: "Review and submit booking." },
  { label: "Payment", description: "Complete your payment securely." },
] as const;

export default function BookingStepper({
  currentIndex,
}: {
  currentIndex: 0 | 1 | 2 | 3;
}) {
  return (
    <ol
      aria-label="Booking progress"
      className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 sm:flex-row sm:items-start sm:gap-4"
    >
      {steps.map((step, index) => (
        <li
          key={step.label}
          aria-current={index === currentIndex ? "step" : undefined}
          className="flex flex-1 items-start gap-3"
        >
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
              index <= currentIndex
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            {index < currentIndex ? "✓" : index + 1}
          </span>
          <div className="min-w-0">
            <p
              className={`text-sm font-semibold ${
                index <= currentIndex ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
