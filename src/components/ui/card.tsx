import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Reusable Card container component styled in Cute & Minimal Pastel theme.
 * Enforces rounded-3xl corners, light border, and soft shadow across components.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#F3EFE9]",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card };
