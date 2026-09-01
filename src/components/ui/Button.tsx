import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "amazon" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50",
  amazon:
    "bg-amazon text-amazon-text hover:bg-amazon-hover border border-amazon-hover font-semibold",
  ghost: "text-brand-700 hover:bg-brand-50",
  outline: "border border-navy-200 text-navy-800 hover:bg-navy-50",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: CommonProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

interface ButtonLinkProps extends CommonProps {
  href: string;
  external?: boolean;
  rel?: string;
  target?: string;
  "aria-label"?: string;
}

export function ButtonLink({
  href,
  external,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (external) {
    return (
      <a
        href={href}
        className={cls}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
