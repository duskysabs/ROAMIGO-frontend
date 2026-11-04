import { forwardRef, type TextareaHTMLAttributes } from "react";
import { classNames } from "@/lib/ui/class-names";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid = false, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={classNames(
          "w-full rounded-xl border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground/75 focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-warm disabled:text-muted-foreground sm:text-sm",
          invalid
            ? "border-danger focus:border-danger focus:ring-danger/20"
            : "border-border focus:border-primary focus:ring-primary/20",
          className,
        )}
        {...props}
      />
    );
  },
);

export default Textarea;
