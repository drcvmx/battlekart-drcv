import { useState, useCallback, useEffect } from "react";
import { Copy, Check, Trophy, Gift, Star, Crown, Ticket, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { BattleCard } from "@/components/ui/BattleCard";
import { Badge } from "@/components/ui/BattleBadge";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";

interface Coupon {
  id: number;
  badge: string;
  badgeVariant: "nuevo" | "exclusivo" | "flash" | "cumple" | "amigos" | "black";
  discount: string;
  description: string;
  code: string;
  validUntil?: string;
  note?: string;
  icon?: React.ReactNode;
}

// Cupones realistas que el sistema puede generar
const coupons: Coupon[] = [
  {
    id: 1,
    badge: "🎉 SUBIR DE NIVEL",
    badgeVariant: "nuevo",
    discount: "1 Carrera Gratis",
    description: "Premio por alcanzar un nuevo nivel",
    code: "XXXXXX",
    note: "Código único generado automáticamente",
    icon: <Trophy className="w-4 h-4" />,
  },
  {
    id: 2,
    badge: "🎁 CANJEAR PUNTOS",
    badgeVariant: "exclusivo",
    discount: "1 Carrera Gratis",
    description: "Canjea 10 carreras acumuladas",
    code: "XXXXXX",
    note: "Usa tus puntos en el dashboard",
    icon: <Star className="w-4 h-4" />,
  },
  {
    id: 3,
    badge: "EXCLUSIVO ORO",
    badgeVariant: "flash",
    discount: "2x1 Especial",
    description: "Promoción exclusiva para nivel Oro",
    code: "XXXXXX",
    note: "Solo miembros nivel Oro y superior",
    icon: <Crown className="w-4 h-4" />,
  },
  {
    id: 4,
    badge: "🎂 CUMPLEAÑOS",
    badgeVariant: "cumple",
    discount: "Carrera Gratis",
    description: "Celebra con nosotros tu día especial",
    code: "XXXXXX",
    note: "Próximamente",
    icon: <Gift className="w-4 h-4" />,
  },
];

// Recompensas de puntos que el sistema ofrece
const pointsRewards = [
  {
    points: 10,
    reward: "1 Carrera Gratis",
    description: "Acumula 10 carreras y obtén 1 gratis",
    icon: <Ticket className="w-6 h-6" />,
  },
  {
    points: 25,
    reward: "Descuento Membresía",
    description: "15% de descuento en tu membresía",
    icon: <Star className="w-6 h-6" />,
  },
  {
    points: 50,
    reward: "Experiencia VIP",
    description: "Acceso a eventos exclusivos",
    icon: <Crown className="w-6 h-6" />,
  },
];

const CouponCard = ({ coupon }: { coupon: Coupon }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isBlack = coupon.badgeVariant === "black";

  return (
    <BattleCard
      variant="coupon"
      className={cn(
        "animate-fade-in-up h-full",
        isBlack && "gradient-black border-transparent"
      )}
    >
      {/* Badge */}
      <Badge variant={coupon.badgeVariant} className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[10px] sm:text-xs max-w-[calc(100%-1rem)] truncate">
        {coupon.icon && <span className="hidden sm:inline">{coupon.icon}</span>}
        <span className={cn("truncate", coupon.icon && "sm:ml-1")}>{coupon.badge}</span>
      </Badge>

      {/* Discount */}
      <div
        className={cn(
          "font-display text-3xl md:text-4xl mb-2",
          isBlack ? "text-white" : "text-battlekart-red"
        )}
      >
        {coupon.discount}
      </div>

      {/* Description */}
      <p
        className={cn(
          "font-body text-sm mb-4",
          isBlack ? "text-white/80" : "text-muted-foreground"
        )}
      >
        {coupon.description}
      </p>

      {/* Code */}
      <div
        className={cn(
          "rounded-lg p-3 mb-3 flex items-center justify-between",
          isBlack ? "bg-white/10" : "bg-muted border border-dashed border-border"
        )}
      >
        <code
          className={cn(
            "font-body font-bold text-lg tracking-wider",
            isBlack ? "text-white" : "text-foreground"
          )}
        >
          {coupon.code}
        </code>
        <button
          onClick={handleCopy}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            copied
              ? "bg-green-500 text-white"
              : isBlack
              ? "bg-white/20 text-white hover:bg-white/30"
              : "bg-battlekart-orange text-white hover:bg-battlekart-red"
          )}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Validity or note */}
      {coupon.validUntil && (
        <p
          className={cn(
            "font-body text-xs",
            isBlack ? "text-white/60" : "text-muted-foreground"
          )}
        >
          Válido hasta: {coupon.validUntil}
        </p>
      )}
      {coupon.note && (
        <p
          className={cn(
            "font-body text-xs mt-1",
            isBlack ? "text-white/60" : "text-muted-foreground"
          )}
        >
          {coupon.note}
        </p>
      )}
    </BattleCard>
  );
};

// Mobile/Tablet Carousel Component
const CouponsCarousel = () => {
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

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y py-4 items-stretch">
          {coupons.map((coupon, index) => (
            <div
              key={coupon.id}
              className={cn(
                "flex-none px-2 transition-all duration-300",
                "w-[85%] sm:w-[70%]"
              )}
            >
              <div
                className={cn(
                  "transition-all duration-300 h-full",
                  index === selectedIndex
                    ? "opacity-100 scale-100"
                    : "opacity-85 scale-95"
                )}
              >
                <CouponCard coupon={coupon} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 z-50",
          "w-10 h-10 flex items-center justify-center rounded-full",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "shadow-[0_0_15px_rgba(255,107,0,0.3)]",
          "transition-all duration-300",
          !canScrollPrev && "opacity-30 cursor-not-allowed"
        )}
        aria-label="Previous coupon"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>
      
      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 z-50",
          "w-10 h-10 flex items-center justify-center rounded-full",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "shadow-[0_0_15px_rgba(255,107,0,0.3)]",
          "transition-all duration-300",
          !canScrollNext && "opacity-30 cursor-not-allowed"
        )}
        aria-label="Next coupon"
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {coupons.map((coupon, index) => (
          <button
            key={coupon.id}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              index === selectedIndex
                ? "bg-battlekart-orange w-8 shadow-[0_0_10px_rgba(255,107,0,0.6)]"
                : "bg-foreground/30 hover:bg-foreground/50"
            )}
            aria-label={`Go to coupon ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Points Rewards Carousel for mobile/tablet
const PointsRewardsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
    skipSnaps: false,
    containScroll: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  return (
    <div className="relative md:hidden">
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y py-2 items-stretch">
          {pointsRewards.map((reward, index) => (
            <div
              key={index}
              className={cn(
                "flex-none px-2 transition-all duration-300",
                "w-[75%] sm:w-[60%]"
              )}
            >
              <div
                className={cn(
                  "transition-all duration-300 h-full",
                  index === selectedIndex
                    ? "opacity-100 scale-100"
                    : "opacity-85 scale-95"
                )}
              >
                <BattleCard 
                  variant="coupon" 
                  className="text-center h-full"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-battlekart-orange to-battlekart-red flex items-center justify-center mx-auto mb-3 text-white">
                    {reward.icon}
                  </div>
                  <div className="font-display text-xl text-battlekart-orange mb-1">
                    {reward.points} pts
                  </div>
                  <h4 className="font-display text-base text-foreground mb-1">
                    {reward.reward}
                  </h4>
                  <p className="font-body text-xs text-muted-foreground">
                    {reward.description}
                  </p>
                </BattleCard>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 z-50",
          "w-9 h-9 flex items-center justify-center rounded-full",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "shadow-[0_0_15px_rgba(255,107,0,0.3)]",
          "transition-all duration-300",
          !canScrollPrev && "opacity-30 cursor-not-allowed"
        )}
        aria-label="Previous reward"
      >
        <ChevronLeft className="w-4 h-4 text-foreground" />
      </button>
      
      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 z-50",
          "w-9 h-9 flex items-center justify-center rounded-full",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "shadow-[0_0_15px_rgba(255,107,0,0.3)]",
          "transition-all duration-300",
          !canScrollNext && "opacity-30 cursor-not-allowed"
        )}
        aria-label="Next reward"
      >
        <ChevronRight className="w-4 h-4 text-foreground" />
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {pointsRewards.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === selectedIndex
                ? "bg-battlekart-orange w-6 shadow-[0_0_10px_rgba(255,107,0,0.6)]"
                : "bg-foreground/30 hover:bg-foreground/50"
            )}
            aria-label={`Go to reward ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const Coupons = () => {
  return (
    <section 
      id="coupons" 
      className="py-12 md:py-20 px-4 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/images/bg-yellow.png')" }}
    >
      <div className="container mx-auto">
        {/* Header */}
        <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-10">
          🎟️ Cupones y Recompensas
        </h2>

        {/* Mobile/Tablet: Carousel */}
        <div className="md:hidden">
          <CouponsCarousel />
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {coupons.map((coupon, index) => (
            <div
              key={coupon.id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CouponCard coupon={coupon} />
            </div>
          ))}
        </div>

        {/* Points Section */}
        <div className="mt-16">
          <div className="text-center mb-6 md:mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-battlekart-orange/20 mb-3 md:mb-4">
              <Target className="w-6 h-6 md:w-8 md:h-8 text-battlekart-orange" />
            </div>
            <h3 className="font-display text-xl md:text-3xl text-foreground mb-2">
              🏆 Sistema de Puntos
            </h3>
            <p className="font-body text-sm md:text-base text-muted-foreground max-w-md mx-auto px-4">
              Cada carrera suma puntos. ¡Canjéalos por recompensas!
            </p>
          </div>

          {/* How it works - Mobile: Horizontal compact | Desktop: Grid */}
          {/* Mobile Version */}
          <div className="flex md:hidden justify-center items-stretch gap-2 mb-6 px-2">
            {[
              { num: "1", color: "bg-battlekart-orange/20", textColor: "text-battlekart-orange", title: "Corre", desc: "1 carrera = 1 pt" },
              { num: "2", color: "bg-gradient-to-br from-battlekart-yellow/30 to-battlekart-orange/20", textColor: "text-battlekart-yellow drop-shadow-[0_0_4px_rgba(255,200,0,0.8)]", title: "Acumula", desc: "Nunca expiran" },
              { num: "3", color: "bg-battlekart-red/20", textColor: "text-battlekart-red", title: "Canjea", desc: "Tu recompensa" },
            ].map((step, i) => (
              <div 
                key={i}
                className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 text-center"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2",
                  step.color
                )}>
                  <span className={cn("font-display text-sm", step.textColor)}>{step.num}</span>
                </div>
                <h4 className="font-display text-sm text-foreground">{step.title}</h4>
                <p className="font-body text-[10px] text-muted-foreground leading-tight mt-1">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop Version */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            <BattleCard variant="default" className="text-center">
              <div className="w-12 h-12 rounded-full bg-battlekart-orange/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-display text-xl text-battlekart-orange">1</span>
              </div>
              <h4 className="font-display text-lg text-foreground mb-1">Corre</h4>
              <p className="font-body text-sm text-muted-foreground">
                Cada carrera = 1 punto
              </p>
            </BattleCard>

            <BattleCard variant="default" className="text-center">
              <div className="w-12 h-12 rounded-full bg-battlekart-yellow/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-display text-xl text-battlekart-yellow">2</span>
              </div>
              <h4 className="font-display text-lg text-foreground mb-1">Acumula</h4>
              <p className="font-body text-sm text-muted-foreground">
                Tus puntos nunca expiran
              </p>
            </BattleCard>

            <BattleCard variant="default" className="text-center">
              <div className="w-12 h-12 rounded-full bg-battlekart-red/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-display text-xl text-battlekart-red">3</span>
              </div>
              <h4 className="font-display text-lg text-foreground mb-1">Canjea</h4>
              <p className="font-body text-sm text-muted-foreground">
                Elige tu recompensa favorita
              </p>
            </BattleCard>
          </div>

          {/* Rewards - Mobile: Carousel | Desktop: Grid */}
          {/* Mobile Carousel */}
          <PointsRewardsCarousel />

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pointsRewards.map((reward, index) => (
              <BattleCard 
                key={index} 
                variant="coupon" 
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-battlekart-orange to-battlekart-red flex items-center justify-center mx-auto mb-4 text-white">
                  {reward.icon}
                </div>
                <div className="font-display text-2xl text-battlekart-orange mb-1">
                  {reward.points} pts
                </div>
                <h4 className="font-display text-lg text-foreground mb-2">
                  {reward.reward}
                </h4>
                <p className="font-body text-sm text-muted-foreground">
                  {reward.description}
                </p>
              </BattleCard>
            ))}
          </div>
        </div>

        {/* CTA Card */}
        <div className="mt-12 p-8 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-center max-w-xl mx-auto">
          <div className="text-3xl mb-2">💎</div>
          <h3 className="font-display text-xl text-foreground mb-2">
            Sube de nivel
          </h3>
          <p className="font-body text-muted-foreground text-sm">
            Al subir de nivel obtienes una carrera gratis.
          </p>
        </div>
      </div>
    </section>
  );
};

export { Coupons };
