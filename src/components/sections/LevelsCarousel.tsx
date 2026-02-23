import { Trophy, Check, Lock, Gift, Star, Crown, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface Level {
  id: number;
  name: string;
  color: string;
  textColor: string;
  minRaces: number;
  maxRaces: number | null;
  renewalDiscount: number;
  renewalText: string;
  benefits: string[];
  icon: React.ComponentType<{ className?: string }>;
  isSpecial?: boolean;
}

interface LevelsCarouselProps {
  levels: Level[];
  currentLevelId: number;
}

const LEVEL_UP_BENEFIT = "Carrera gratis al subir de nivel";

export const LevelsCarousel = ({ levels, currentLevelId }: LevelsCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
    skipSnaps: false,
    containScroll: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  // Auto-focus on user's current level on mount
  useEffect(() => {
    if (!emblaApi) return;
    
    const currentLevelIndex = levels.findIndex((l) => l.id === currentLevelId);
    if (currentLevelIndex !== -1) {
      emblaApi.scrollTo(currentLevelIndex, false);
    }
    
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, currentLevelId, levels, onSelect]);

  // Level styles configuration
  const getLevelStyles = (levelId: number) => {
    const styles: Record<number, {
      bg: string;
      text: string;
      subText: string;
      checkBg: string;
      checkIcon: string;
      boxBg: string;
    }> = {
      1: {
        bg: "bg-white/10 backdrop-blur-sm border border-white/20",
        text: "text-white",
        subText: "text-white/80",
        checkBg: "bg-battlekart-orange",
        checkIcon: "text-white",
        boxBg: "bg-black/20",
      },
      2: {
        bg: "bg-gradient-to-br from-[#C0C0C0] via-[#A8A8A8] to-[#808080] shadow-[0_0_30px_rgba(192,192,192,0.4)]",
        text: "text-white",
        subText: "text-white/80",
        checkBg: "bg-white/30",
        checkIcon: "text-white",
        boxBg: "bg-white/20 border border-white/30",
      },
      3: {
        bg: "bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FF9800] shadow-[0_0_30px_rgba(255,215,0,0.5)]",
        text: "text-amber-900",
        subText: "text-amber-800",
        checkBg: "bg-amber-900",
        checkIcon: "text-yellow-300",
        boxBg: "bg-white/40 border border-yellow-600/30",
      },
      4: {
        bg: "bg-gradient-to-br from-[#E5E4E2] via-[#D4D4D4] to-[#A9A9A9] shadow-[0_0_30px_rgba(229,228,226,0.5)]",
        text: "text-gray-800",
        subText: "text-gray-600",
        checkBg: "bg-gray-700",
        checkIcon: "text-white",
        boxBg: "bg-white/50 border border-gray-400",
      },
      5: {
        bg: "bg-gradient-to-br from-[#2D2D2D] via-[#1a1a1a] to-[#000000] shadow-[0_0_40px_rgba(255,215,0,0.3)]",
        text: "text-white",
        subText: "text-white/80",
        checkBg: "bg-yellow-500",
        checkIcon: "text-black",
        boxBg: "bg-white/10",
      },
    };
    return styles[levelId] || styles[1];
  };

  return (
    <div className="relative py-16 md:py-20 overflow-hidden">
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y py-4">
          {levels.map((level, index) => {
            const isCurrentLevel = level.id === currentLevelId;
            const isLocked = level.id > currentLevelId;
            const isActive = index === selectedIndex;
            const LevelIcon = level.icon;
            const levelStyles = getLevelStyles(level.id);

            return (
              <div
                key={level.id}
                className={cn(
                  "flex-none px-2 sm:px-4 transition-all duration-300",
                  "w-[90%] sm:w-[70%] md:w-[45%] lg:w-[35%]"
                )}
              >
                <div
                  className={cn(
                    "relative h-full rounded-2xl p-6 transition-all duration-300",
                    levelStyles.bg,
                    isActive 
                      ? "opacity-100 scale-100 md:scale-105" 
                      : isLocked 
                        ? "opacity-60 scale-95" 
                        : "opacity-85 scale-95",
                    isCurrentLevel && "ring-4 ring-battlekart-orange"
                  )}
                >
                  {/* Badge */}
                  <div className={cn(
                    "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-display uppercase flex items-center gap-1",
                    isCurrentLevel 
                      ? "bg-battlekart-orange text-white" 
                      : level.id === 5 
                        ? "bg-yellow-500 text-black" 
                        : "bg-black/20 text-white"
                  )}>
                    {isLocked ? <Lock className="w-3 h-3" /> : <LevelIcon className="w-3 h-3" />}
                    {isCurrentLevel ? "TU NIVEL" : level.name.toUpperCase()}
                  </div>

                  {/* Level Name */}
                  <div className={cn("font-display text-4xl md:text-5xl mb-2", levelStyles.text)}>
                    {level.name}
                  </div>

                  {/* Races required */}
                  <p className={cn("font-body text-sm mb-4", levelStyles.subText)}>
                    {level.maxRaces 
                      ? `${level.minRaces} - ${level.maxRaces} carreras`
                      : `${level.minRaces}+ carreras`
                    }
                  </p>

                  {/* Benefit (solo carrera gratis por subir de nivel) */}
                  {level.id > 1 && (
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-start gap-2">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            levelStyles.checkBg
                          )}
                        >
                          <Check className={cn("w-2.5 h-2.5", levelStyles.checkIcon)} />
                        </div>
                        <span className={cn("font-body text-sm leading-tight", levelStyles.subText)}>
                          {LEVEL_UP_BENEFIT}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Renewal Box */}
                  <div className={cn("rounded-lg p-3 flex items-center justify-between", levelStyles.boxBg)}>
                    <div>
                      <p className={cn("font-body text-xs uppercase opacity-70", levelStyles.subText)}>
                        Renovación
                      </p>
                      <p className={cn(
                        "font-display text-lg",
                        level.isSpecial ? "text-yellow-400" : levelStyles.text
                      )}>
                        {level.renewalText}
                      </p>
                    </div>
                    {level.renewalDiscount > 0 && (
                      <div className={cn(
                        "font-display text-xs px-3 py-1 rounded-full",
                        level.isSpecial 
                          ? "bg-yellow-500 text-black animate-pulse" 
                          : "bg-green-500 text-white"
                      )}>
                        {level.isSpecial ? "⭐ GRATIS" : `${level.renewalDiscount}% OFF`}
                      </div>
                    )}
                  </div>

                  {/* Border glow for Black */}
                  {level.id === 5 && (
                    <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-yellow-400/30" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows - Desktop - Positioned outside overflow-hidden */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={cn(
          "hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-50",
          "w-12 h-12 items-center justify-center rounded-full",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:shadow-[0_0_25px_rgba(255,107,0,0.5)]",
          "transition-all duration-300",
          !canScrollPrev && "opacity-30 cursor-not-allowed hover:shadow-none"
        )}
        aria-label="Previous level"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      
      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={cn(
          "hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-50",
          "w-12 h-12 items-center justify-center rounded-full",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:shadow-[0_0_25px_rgba(255,107,0,0.5)]",
          "transition-all duration-300",
          !canScrollNext && "opacity-30 cursor-not-allowed hover:shadow-none"
        )}
        aria-label="Next level"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {levels.map((level, index) => (
          <button
            key={level.id}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              index === selectedIndex
                ? "bg-battlekart-orange w-8 shadow-[0_0_10px_rgba(255,107,0,0.6)]"
                : "bg-white/30 hover:bg-white/50"
            )}
            aria-label={`Go to ${level.name} level`}
          />
        ))}
      </div>
    </div>
  );
};
