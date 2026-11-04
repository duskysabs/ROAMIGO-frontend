import type { ReactNode } from "react";
import Card from "@/components/ui/card";

export type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Card padding="lg" className="text-center">
      {icon && (
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-warm text-primary">
          {icon}
        </div>
      )}
      <h2 className={icon ? "mt-4 text-xl font-bold" : "text-xl font-bold"}>
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md leading-7 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}
