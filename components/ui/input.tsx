import { forwardRef, type InputHTMLAttributes } from "react";
import { classNames } from "@/lib/ui/class-names";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={classNames(
        "min-h-12 w-full rounded-xl border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground/75 focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-warm disabled:text-muted-foreground sm:text-sm",
        invalid
          ? "border-danger focus:border-danger focus:ring-danger/20"
          : "border-border focus:border-primary focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
});

export default Input;
