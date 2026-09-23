import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* Buttons — vamosany: squared off (4px), 2px ink border, uppercase
   display label, 48px min height, 1px lift on hover. No pills,
   no gradients, no glass. */
type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary" | "tertiary" | "inverse";
  size?: "sm" | "md" | "lg";
  /** Stadium shape — used inside the floating navbar capsule. */
  pill?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<"button">, "children" | "className">;

const base =
  "label-button inline-flex items-center justify-center gap-2 border-2 transition-[background-color,transform,border-color] duration-(--duration-base) ease-(--ease-default) hover:-translate-y-px";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "border-ink bg-brand text-on-brand hover:bg-brand-hover",
  secondary: "border-ink bg-transparent text-ink hover:bg-surface-1",
  tertiary:
    "border-transparent text-ink hover:-translate-y-0 hover:underline hover:decoration-2 hover:underline-offset-4",
  inverse:
    "border-ink bg-inverse-canvas text-inverse-ink hover:bg-ink-muted hover:border-ink-muted",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "min-h-10 px-4 py-2 text-[0.8125rem]",
  md: "min-h-12 px-5 py-3",
  lg: "min-h-12 px-6 py-3",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  pill = false,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = `${base} ${pill ? "rounded-full" : "rounded-md"} ${variants[variant]} ${sizes[size]} ${className}`;

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

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  highlight = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** Signature yellow highlight. Deliberately rare — not every heading. */
  highlight?: boolean;
}) {
  return (
    <div
      data-heading-block
      className={`flex max-w-2xl flex-col gap-4 ${
        align === "center" ? "mx-auto items-center text-center" : "items-start"
      }`}
    >
      {eyebrow ? (
        <span data-heading-eyebrow className="eyebrow">
          {eyebrow}
        </span>
      ) : null}
      <h2 data-split-lines className="display-lg text-ink text-balance">
        {highlight ? (
          <span data-sweep className="highlight-heading">
            {title}
          </span>
        ) : (
          title
        )}
      </h2>
      {description ? (
        <p data-heading-lede className="body-lg text-ink-subtle text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function ArrowRight({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Brand mark — the v-pretzel-ny wordmark. `tone="light"` is the
    knock-out version for dark surfaces and photography. */
export function BrandLogo({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Image
      src={tone === "dark" ? "/logo-pretzel-dark.png" : "/logo-pretzel.png"}
      alt="Vamos a NY"
      width={1196}
      height={395}
      priority
      className={`h-7 w-auto ${className}`}
    />
  );
}
