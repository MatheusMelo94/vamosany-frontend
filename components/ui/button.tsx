import Link from "next/link";
import type { JSX, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Buttons — design system (DDR-0011): full pills with a 2px ink border,
   Montserrat 700, 48px min height, 2px lift on hover in 0.15s. */
type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary" | "tertiary" | "inverse";
  size?: "sm" | "md" | "lg";
  /** Stadium shape — used inside the floating navbar capsule. */
  pill?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<"button">, "children" | "className">;

// arbitrary: transition-[...] lista so as propriedades animadas (cor, transform, borda), nunca `all`
const base =
  "label-button inline-flex items-center justify-center gap-2 border-2 transition-[background-color,transform,border-color] duration-150 ease-(--ease-default) hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "border-ink bg-brand text-on-brand hover:bg-brand-hover",
  secondary: "border-ink bg-transparent text-ink hover:bg-surface-1",
  tertiary:
    "border-transparent text-ink hover:-translate-y-0 hover:underline hover:decoration-2 hover:underline-offset-4",
  inverse:
    "border-ink bg-inverse-canvas text-inverse-ink hover:bg-ink-muted hover:border-ink-muted",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "min-h-10 px-4 py-2 text-label-sm",
  md: "min-h-12 px-6 py-3.5",
  lg: "min-h-12 px-6 py-3.5",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  pill = false,
  children,
  className = "",
  ...rest
}: ButtonProps): JSX.Element {
  const classes = cn(
    base,
    pill ? "rounded-full" : "rounded-md",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
