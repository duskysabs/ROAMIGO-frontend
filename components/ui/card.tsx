import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "@/lib/ui/class-names";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "sm" | "md" | "lg";
};

const PADDING_STYLES = {
  sm: "p-4",
  md: "p-6",
  lg: "p-7 sm:p-8",
} as const;

export default function Card({
  children,
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={classNames(
        "rounded-2xl border border-border bg-background",
        PADDING_STYLES[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
