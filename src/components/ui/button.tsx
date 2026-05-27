import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "income" | "expense" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  isPending?: boolean;
}

/**
 * Reusable button component styled in Cute & Minimal Pastel theme.
 * Supports automated loading spinner when isPending is true, alongside standard double-submit protection.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isPending,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold transition-all duration-300 rounded-2xl shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      primary:
        "bg-primary-pastel text-white hover:bg-opacity-95 border border-transparent shadow-[0_4px_12px_rgba(212,163,115,0.2)]",
      income:
        "bg-pastel-green border border-[#C8E6C9] hover:bg-[#D8ECD9] text-[#1B5E20]",
      expense:
        "bg-pastel-pink border border-[#F8BBD0] hover:bg-[#F8CCD0] text-[#880E4F]",
      outline:
        "bg-white border border-[#EAE4DB] text-text-muted hover:bg-[#FDFBF7] hover:text-text-dark",
      ghost:
        "bg-transparent text-text-muted hover:bg-[#F7F5F0] hover:text-text-dark shadow-none",
    };

    const sizes = {
      default: "py-3 px-6 text-sm",
      sm: "py-2 px-4 text-xs rounded-xl",
      lg: "py-3.5 px-8 text-base",
    };

    return (
      <button
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isPending}
        {...props}
      >
        {isPending && (
          <div className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
