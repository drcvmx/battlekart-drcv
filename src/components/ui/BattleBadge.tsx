import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-display uppercase text-xs px-3 py-1.5 rounded-full",
  {
    variants: {
      variant: {
        nuevo: "bg-battlekart-red text-white",
        exclusivo: "gradient-oro text-white",
        flash: "bg-fuchsia-500 text-white animate-neon-pulse",
        cumple: "bg-pink-500 text-white",
        amigos: "bg-blue-500 text-white",
        black: "gradient-black text-white",
        platino: "gradient-platino text-gray-800",
        oro: "gradient-oro text-white",
        plata: "bg-nivel-plata text-gray-800",
        basico: "bg-nivel-basico text-white",
        level: "bg-black/20 backdrop-blur-md text-white px-4 py-2",
        default: "bg-gray-100 text-gray-700",
        usado: "bg-gray-200 text-gray-500",
        success: "bg-green-100 text-green-700",
        warning: "bg-orange-100 text-orange-700",
      },
    },
    defaultVariants: {
      variant: "nuevo",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
