"use client";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "success" | "outline";
type Size = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  full?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-aqua-500 text-white shadow-glow hover:bg-aqua-600 active:bg-aqua-700 disabled:bg-ink-200 disabled:text-ink-400 disabled:shadow-none",
  secondary: "bg-aqua-50 text-aqua-700 hover:bg-aqua-100 disabled:opacity-50",
  ghost: "bg-transparent text-ink-600 hover:bg-ink-100 disabled:opacity-50",
  danger: "bg-coral-50 text-coral-600 hover:bg-coral-100 disabled:opacity-50",
  dark: "bg-ink-900 text-white hover:bg-ink-800 disabled:bg-ink-300",
  success: "bg-mint-500 text-white hover:bg-mint-600 shadow-[0_10px_30px_-8px_rgba(20,184,144,.55)] disabled:bg-ink-200 disabled:shadow-none",
  outline: "border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 rounded-xl px-3 text-sm gap-1.5",
  md: "h-11 rounded-2xl px-4 text-[15px] gap-2",
  lg: "h-13 min-h-[52px] rounded-2xl px-5 text-base gap-2",
  xl: "min-h-[60px] rounded-[22px] px-6 text-[17px] gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, iconRight, full, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center font-bold transition active:scale-[.985] disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        full && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      {children}
      {iconRight}
    </button>
  );
});
