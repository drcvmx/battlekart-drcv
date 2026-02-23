import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const battleButtonVariants = cva(
  "inline-flex items-center justify-center gap-3 font-display uppercase text-lg rounded-full transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "gradient-hero text-white shadow-[0_4px_20px_rgba(255,51,0,0.3)] hover:shadow-[0_8px_30px_rgba(255,51,0,0.5)] btn-hover",
        secondary:
          "bg-white text-battlekart-red border-2 border-battlekart-red hover:bg-battlekart-red hover:text-white btn-hover",
        whatsapp:
          "bg-whatsapp text-white shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.5)] hover:scale-105",
        phone:
          "bg-white text-battlekart-red shadow-battlekart hover:scale-105",
        online:
          "gradient-purple text-white shadow-[0_4px_20px_rgba(102,126,234,0.3)] hover:shadow-[0_8px_30px_rgba(102,126,234,0.5)] hover:scale-105",
        ghost:
          "bg-transparent text-battlekart-red hover:bg-battlekart-red/10",
      },
      size: {
        default: "px-8 py-4 min-h-[52px]",
        sm: "px-4 py-2 text-sm min-h-[40px]",
        lg: "px-9 py-5 text-xl min-h-[60px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface BattleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof battleButtonVariants> {
  asChild?: boolean;
}

const BattleButton = React.forwardRef<HTMLButtonElement, BattleButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(battleButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
BattleButton.displayName = "BattleButton";

export { BattleButton, battleButtonVariants };
