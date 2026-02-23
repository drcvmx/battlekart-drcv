import { Check } from "lucide-react";
import { BattleButton } from "@/components/ui/BattleButton";
import { BattleCard } from "@/components/ui/BattleCard";

import logoFull from "@/assets/logo-battlekart-full.png";
import heroKartImage from "@/assets/hero-kart.png";
import floatingRocket from "@/assets/floating-rocket.png";
import floatingNitro from "@/assets/floating-nitro.png";
import { useParallax } from "@/hooks/useParallax";

// Custom benefit icons
import benefitRace from "@/assets/icons/benefit-race.png";
import benefitWheel from "@/assets/icons/benefit-wheel.png";
import benefitSnake from "@/assets/icons/benefit-snake.png";
import benefitGhost from "@/assets/icons/benefit-ghost.png";
import benefitPaint from "@/assets/icons/benefit-paint.png";
import benefitSnow from "@/assets/icons/benefit-snow.png";

const membershipBenefits = [
  {
    image: benefitRace,
    title: "Lunes a Viernes",
    description: "Carrera a solo $200 MXN",
  },
  {
    image: benefitWheel,
    title: "Sábado y Domingo",
    description: "Carrera a solo $300 MXN",
  },
  {
    image: benefitSnake,
    title: "Sin Límite de Uso",
    description: "Corre todas las veces que quieras durante el año",
  },
  {
    image: benefitGhost,
    title: "Tarjeta de Lealtad",
    description: "Accede al sistema de niveles y acumula beneficios",
  },
];

const Home = () => {
  const { containerRef, getTransform, isInView } = useParallax();

  // Parallax speeds: 
  // - Trees (floatingNitro): 0.3x (slow)
  // - Rocket: 0.5x (medium)
  // - Kart: 1x (normal)
  // - Video Banner Card: sticky effect with 1.2x (fast, like "boxes")
  
  // Use a standard Tailwind duration to avoid ambiguous arbitrary-value warnings during build.
  const parallaxTransition = "transition-transform duration-700 ease-out";

  return (
    <section 
      ref={containerRef}
      id="home" 
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Floating Decorative Assets with Parallax */}
      {/* Rocket - Medium speed (0.5x) */}
      <img
        src={floatingRocket}
        alt=""
        aria-hidden="true"
        className={`absolute bottom-20 left-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 lg:top-24 lg:right-[8%] lg:bottom-auto lg:left-auto z-50 pointer-events-none animate-levitate ${parallaxTransition}`}
        style={{ 
          transform: `${getTransform(0.5, 0.25)} translateZ(0)`,
        }}
      />
      {/* Nitro/Trees - Slow speed (0.3x) */}
      <img
        src={floatingNitro}
        alt=""
        aria-hidden="true"
        className={`absolute top-20 right-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 lg:bottom-24 lg:left-[8%] lg:top-auto lg:right-auto z-50 pointer-events-none animate-levitate-delayed ${parallaxTransition}`}
        style={{ 
          transform: `${getTransform(0.3, 0.15)} translateZ(0)`,
        }}
      />
      
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
            <source src="/videos/hero-kart-new.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-battlekart-red/40 via-transparent to-battlekart-red/60" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl pt-0 pb-12 md:pb-20 px-4">
        {/* Header Logo - Centered at top, overlapping banner */}
        <div className="flex justify-center -mb-16 md:-mb-24 relative z-30">
          <img 
            src={logoFull} 
            alt="BattleKart Beyond Reality" 
            className="w-48 sm:w-56 md:w-72 lg:w-80 h-auto drop-shadow-[0_0_30px_rgba(255,102,0,0.5)] animate-float"
          />
        </div>

        {/* Video Banner - "Únete al Club" Card with Sticky + Fast Parallax (boxes effect) */}
        <div 
          className={`-mt-12 md:-mt-20 relative aspect-[3/4] sm:aspect-[4/3] md:aspect-[2/1] rounded-2xl border-2 border-white/20 overflow-hidden mb-8 md:mb-14 ${parallaxTransition}`}
          style={{ 
            transform: `${getTransform(1.2, 0.6)} translateZ(0)`,
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hero-kart-new.mp4" type="video/mp4" />
          </video>
          {/* Horizontal gradient overlay - left to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 md:from-black/70 md:to-black/20" />
          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-center pt-20 md:pt-28 p-4 sm:p-5 md:p-8">
            <div className="inline-block mb-2 sm:mb-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/30 backdrop-blur-sm rounded-full w-fit">
              <span className="font-display text-white text-[10px] sm:text-xs md:text-sm uppercase tracking-wide">
                🏁 Programa de Lealtad
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl md:text-4xl lg:text-5xl text-white mb-2 sm:mb-3 leading-tight">
              Únete al Club
            </h1>
            <p className="font-body text-white/90 text-xs sm:text-sm md:text-base lg:text-lg max-w-xl leading-relaxed">
              Accede a beneficios exclusivos, sube de nivel y desbloquea recompensas increíbles con tu membresía anual.
            </p>
          </div>
        </div>

        {/* Hero - Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-10 md:mb-14">
          {/* Left side - Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Price Card */}
            <BattleCard 
              variant="level" 
              hoverable={false}
              className="inline-block bg-white/10 backdrop-blur-md border-2 border-white/30 mb-6"
            >
              <div className="text-center px-8 py-6">
                <p className="font-display text-white/80 text-sm uppercase mb-1">
                  Membresía Anual
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-5xl md:text-6xl text-white">
                    $990
                  </span>
                  <span className="font-body text-white/70 text-lg">MXN/año</span>
                </div>
                <p className="font-body text-white/70 text-sm mt-2">
                  Menos de $83 al mes
                </p>
              </div>
            </BattleCard>
          </div>
          
          {/* Right side - Kart Image with Normal Parallax (1x) */}
          <div 
            className={`flex justify-center lg:justify-end order-1 lg:order-2 ${parallaxTransition}`}
            style={{ 
              transform: `${getTransform(1.0, 0.5)} translateZ(0)`,
            }}
          >
            <img 
              src={heroKartImage} 
              alt="Piloto en kart Battle Kart" 
              className="w-full max-w-md lg:max-w-lg xl:max-w-xl drop-shadow-2xl animate-float"
            />
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-10">
          {membershipBenefits.map((benefit, index) => (
            <BattleCard
              key={index}
              variant="default"
              className="bg-white/10 backdrop-blur-md border border-white/20 p-5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                <img 
                  src={benefit.image}
                  alt=""
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-contain flex-shrink-0 drop-shadow-lg"
                />
                <div className="text-center sm:text-left">
                  <h3 className="font-display text-white text-base mb-1">
                    {benefit.title}
                  </h3>
                  <p className="font-body text-white/70 text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </BattleCard>
          ))}
        </div>

        {/* Comparison */}
        <BattleCard 
          variant="default" 
          hoverable={false}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 mb-10"
        >
          <h3 className="font-display text-white text-xl text-center mb-6">
            ¿Por qué ser miembro?
          </h3>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {/* Sin membresía */}
            <div className="text-center">
              <p className="font-display text-white/60 text-sm uppercase mb-2">
                Sin Membresía
              </p>
              <p className="font-display text-white/40 text-3xl md:text-4xl line-through">
                $350
              </p>
              <p className="font-body text-white/50 text-sm">por carrera</p>
            </div>
            {/* Con membresía Lun-Vie */}
            <div className="text-center">
              <p className="font-display text-battlekart-orange text-sm uppercase mb-2">
                Lun-Vie
              </p>
              <p className="font-display text-white text-3xl md:text-4xl">
                $200
              </p>
              <p className="font-body text-white/70 text-sm">por carrera</p>
            </div>
            {/* Con membresía Sáb-Dom */}
            <div className="text-center">
              <p className="font-display text-battlekart-orange text-sm uppercase mb-2">
                Sáb-Dom
              </p>
              <p className="font-display text-white text-3xl md:text-4xl">
                $300
              </p>
              <p className="font-body text-white/70 text-sm">por carrera</p>
            </div>
          </div>
          <div className="text-center mt-6 pt-6 border-t border-white/20">
            <p className="font-body text-green-400 text-lg">
              <Check className="inline w-5 h-5 mr-1" />
              Ahorras hasta <span className="font-display">$150</span> por carrera
            </p>
          </div>
        </BattleCard>

        {/* CTA */}
        <div className="text-center">
          <BattleButton 
            variant="secondary" 
            size="lg" 
            className="bg-white text-battlekart-red hover:bg-white/90 shadow-xl"
            onClick={() => document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' })}
          >
            ¡Quiero Mi Membresía!
          </BattleButton>
          <p className="font-body text-white/60 text-sm mt-4">
            🔒 Pago seguro • Activa tu cuenta hoy mismo
          </p>
        </div>
      </div>
    </section>
  );
};

export { Home };
