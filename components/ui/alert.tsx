import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "@/lib/ui/class-names";

export type AlertVariant = "info" | "success" | "warning" | "danger";

const VARIANT_STYLES: Record<AlertVariant, string> = {
  info: "border-primary/20 bg-surface-warm text-foreground",
  success: "border-success-border bg-success-surface text-success",
  warning: "border-warning-border bg-warning-surface text-warning",
  danger: "border-danger-border bg-danger-surface text-danger",
};

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
};

export default function Alert({
  variant = "info",
  title,
  children,
  className,
  ...props
}: AlertProps) {
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={classNames(
        "rounded-xl border px-4 py-3 text-sm leading-6",
        VARIANT_STYLES[variant],
        className,
      )}
      {...props}
    >
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}
