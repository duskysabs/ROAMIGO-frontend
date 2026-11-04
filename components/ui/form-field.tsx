import { cloneElement, type ReactElement } from "react";

type FieldControlProps = {
  id?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
};

export type FormFieldProps = {
  htmlFor: string;
  label: string;
  children: ReactElement<FieldControlProps>;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export default function FormField({
  htmlFor,
  label,
  children,
  hint,
  error,
  optional = false,
}: FormFieldProps) {
  const messageId = hint || error ? `${htmlFor}-message` : undefined;
  const control = cloneElement(children, {
    id: children.props.id ?? htmlFor,
    invalid: children.props.invalid || Boolean(error),
    "aria-describedby": children.props["aria-describedby"] ?? messageId,
  });

  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
        {label}
        {optional && (
          <span className="font-normal text-muted-foreground"> (optional)</span>
        )}
      </label>
      <div className="mt-2">{control}</div>
      {error ? (
        <p id={messageId} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-2 text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
