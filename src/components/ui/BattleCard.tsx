import * as React from "react";
import { cn } from "@/lib/utils";

interface BattleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "video" | "level" | "coupon";
  hoverable?: boolean;
}

const BattleCard = React.forwardRef<HTMLDivElement, BattleCardProps>(
  ({ className, variant = "default", hoverable = true, children, ...props }, ref) => {
    const variants = {
      default: "bg-card rounded-2xl shadow-battlekart overflow-hidden p-4",
      video: "bg-card rounded-2xl shadow-battlekart overflow-hidden group",
      level: "rounded-3xl p-8 shadow-battlekart-lg overflow-hidden",
      coupon: "bg-card rounded-2xl p-6 border-2 border-dashed border-battlekart-orange shadow-battlekart overflow-hidden relative",
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          hoverable && "hover-lift cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BattleCard.displayName = "BattleCard";

interface VideoOverlayProps {
  title: string;
  duration: string;
}

const VideoOverlay = ({ title, duration }: VideoOverlayProps) => (
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <h3 className="font-display text-white text-lg">{title}</h3>
    </div>
    <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-white text-sm font-body">
      {duration}
    </div>
  </div>
);

interface PlayButtonProps {
  className?: string;
}

const PlayButton = ({ className }: PlayButtonProps) => (
  <div
    className={cn(
      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
      "w-20 h-20 rounded-full bg-battlekart-red",
      "flex items-center justify-center",
      "shadow-glow-red",
      "opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300",
      className
    )}
  >
    <svg
      className="w-8 h-8 text-white ml-1"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  </div>
);

export { BattleCard, VideoOverlay, PlayButton };
