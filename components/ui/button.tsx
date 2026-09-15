import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
    outline: "border border-primary text-primary hover:bg-surface-warm",
};

type ButtonProps = {
    variant?: ButtonVariant;
    href?: string;
    className?: string;
    children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button ({
    variant = "primary",
    href,
    className="",
    children,
    ...props
}: ButtonProps) {
    const classes = `inline-flex items-center justify-center rounded-lg font-semibold transition-colors ${VARIANT_STYLES[variant]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}
