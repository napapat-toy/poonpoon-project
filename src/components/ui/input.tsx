import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

/**
 * Reusable input component styled in Cute & Minimal Pastel theme.
 * Supports icons on the left and standard React ref forwarding.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-text-muted">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "w-full bg-[#FDFBF7] border border-[#EAE4DB] rounded-2xl py-2.5 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-pastel focus:border-transparent transition-all disabled:opacity-50",
            icon ? "pl-10" : "px-4",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
