import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showGlow?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max, className, showGlow = true }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
      <div
        ref={ref}
        className={cn(
          "w-full h-3 bg-white/20 rounded-full overflow-hidden",
          className
        )}
      >
        <div
          className={cn(
            "h-full bg-white rounded-full transition-all duration-500 ease-out",
            showGlow && "shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
