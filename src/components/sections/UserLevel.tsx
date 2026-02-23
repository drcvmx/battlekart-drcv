import { Trophy, Check, Lock, Gift, Users, Ticket, Star, Crown, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/BattleBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BattleCard } from "@/components/ui/BattleCard";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { LevelsCarousel } from "./LevelsCarousel";

// Datos de niveles (copy/UI). La lógica real se gestiona en backend.
const LEVEL_UP_BENEFIT = "1 carrera gratis al subir de nivel";

const benefitCopy = {
  birthday: "1 carrera gratis en tu cumpleaños",
  tokens6: "6 fichas gratis por carrera",
  tokens12: "12 fichas gratis por carrera",
  arcade10: "10% de descuento en Arcade",
  arcade15: "15% de descuento en Arcade",
  cafeteria10: "10% de descuento en Cafetería",
  vr10: "10 min en Arena de RV gratis por carrera",
};

const levels = [
  {
    id: 1,
    name: "Bronce",
    color: "bg-nivel-basico",
    textColor: "text-white",
    minRaces: 0,
    maxRaces: 10,
    renewalDiscount: 0,
    renewalText: "Nivel inicial",
    benefits: [benefitCopy.birthday],
    icon: Star,
  },
  {
    id: 2,
    name: "Plata",
    color: "bg-nivel-plata",
    textColor: "text-gray-800",
    minRaces: 11,
    maxRaces: 20,
    renewalDiscount: 0,
    renewalText: "11-20 carreras",
    benefits: [LEVEL_UP_BENEFIT, benefitCopy.tokens6],
    icon: Trophy,
  },
  {
    id: 3,
    name: "Oro",
    color: "gradient-oro",
    textColor: "text-gray-900",
    minRaces: 21,
    maxRaces: 35,
    renewalDiscount: 0,
    renewalText: "21-35 carreras",
    benefits: [LEVEL_UP_BENEFIT, benefitCopy.tokens6, benefitCopy.arcade10],
    icon: Crown,
  },
  {
    id: 4,
    name: "Diamante",
    color: "bg-nivel-platino",
    textColor: "text-gray-800",
    minRaces: 36,
    maxRaces: 70,
    renewalDiscount: 0,
    renewalText: "36-70 carreras",
    benefits: [LEVEL_UP_BENEFIT, benefitCopy.tokens6, benefitCopy.arcade15, benefitCopy.cafeteria10],
    icon: Zap,
  },
  {
    id: 5,
    name: "Black",
    color: "bg-nivel-black",
    textColor: "text-white",
    minRaces: 71,
    maxRaces: 100,
    renewalDiscount: 0,
    renewalText: "71-100 carreras",
    benefits: [LEVEL_UP_BENEFIT, benefitCopy.tokens12, benefitCopy.arcade15, benefitCopy.cafeteria10, benefitCopy.vr10],
    icon: Gift,
    isSpecial: true,
  },
];

// Datos del usuario actual (ejemplo - vendrán de la BD)
const currentUser = {
  totalRaces: 24,
  currentLevelId: 2, // Plata
  isPermanentLevel: false,
};

const UserLevel = () => {
  const currentLevel = levels.find((l) => l.id === currentUser.currentLevelId)!;
  const nextLevel = levels.find((l) => l.id === currentUser.currentLevelId + 1);
  const racesToNext = nextLevel ? nextLevel.minRaces - currentUser.totalRaces : 0;
  const progressPercent = nextLevel
    ? ((currentUser.totalRaces - currentLevel.minRaces) /
        (nextLevel.minRaces - currentLevel.minRaces)) *
      100
    : 100;

  return (
    <section 
      id="level" 
      className="py-12 md:py-20 px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-red.png')" }}
    >
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <h2 className="font-display text-3xl md:text-4xl text-white text-center mb-4">
          Sistema de Niveles
        </h2>
        <p className="font-body text-white/70 text-center mb-10 max-w-xl mx-auto">
          Sube de nivel corriendo más carreras y acumula beneficios de membresía.
        </p>

        {/* Current Level Card - Con estilo dinámico por nivel */}
        {(() => {
          const currentLevelStyles: Record<number, {
            cardBg: string;
            textColor: string;
            subTextColor: string;
            boxBg: string;
            checkBg: string;
            checkColor: string;
          }> = {
            1: { // Básico - Transparente
              cardBg: "bg-white/10 backdrop-blur-sm border border-white/20",
              textColor: "text-white",
              subTextColor: "text-white/80",
              boxBg: "bg-black/20",
              checkBg: "bg-battlekart-orange",
              checkColor: "text-white",
            },
            2: { // Plata - Gris plateado brillante
              cardBg: "bg-gradient-to-br from-[#C0C0C0] via-[#A8A8A8] to-[#808080] shadow-[0_0_30px_rgba(192,192,192,0.4)]",
              textColor: "text-white",
              subTextColor: "text-white/80",
              boxBg: "bg-white/20 border border-white/30",
              checkBg: "bg-white/30",
              checkColor: "text-white",
            },
            3: { // Oro - Brillante
              cardBg: "bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FF9800] shadow-[0_0_30px_rgba(255,215,0,0.5)]",
              textColor: "text-amber-900",
              subTextColor: "text-amber-800",
              boxBg: "bg-white/50 border border-yellow-600/30",
              checkBg: "bg-amber-900",
              checkColor: "text-yellow-300",
            },
                4: { // Diamante - Gris claro brillante
              cardBg: "bg-gradient-to-br from-[#E5E4E2] via-[#D4D4D4] to-[#A9A9A9] shadow-[0_0_30px_rgba(229,228,226,0.5)]",
              textColor: "text-gray-800",
              subTextColor: "text-gray-600",
              boxBg: "bg-white/60 border border-gray-400",
              checkBg: "bg-gray-700",
              checkColor: "text-white",
            },
            5: { // Black - Brillante
              cardBg: "bg-gradient-to-br from-[#2D2D2D] via-[#1a1a1a] to-[#000000] shadow-[0_0_40px_rgba(255,215,0,0.3)]",
              textColor: "text-white",
              subTextColor: "text-white/80",
              boxBg: "bg-white/10",
              checkBg: "bg-yellow-500",
              checkColor: "text-black",
            },
          };
          const style = currentLevelStyles[currentLevel.id] || currentLevelStyles[1];

          return (
            <div className={cn("relative rounded-2xl p-6 mb-10 max-w-lg mx-auto", style.cardBg)}>
              {/* Badge */}
              <Badge variant="nuevo" className="absolute top-3 right-3 bg-battlekart-orange text-white border-0">
                <currentLevel.icon className="w-3 h-3 mr-1" />
                TU NIVEL
              </Badge>

              {/* Level Name */}
              <div className={cn("font-display text-5xl md:text-6xl mb-2", style.textColor)}>
                {currentLevel.name}
              </div>

              {/* Races count */}
              <p className={cn("font-body text-lg mb-6", style.subTextColor)}>
                {currentUser.totalRaces} carreras completadas
              </p>

              {/* Progress to next level */}
              {nextLevel && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className={cn("font-body text-sm", style.subTextColor)}>
                      Progreso a {nextLevel.name}
                    </span>
                    <span className="font-display text-battlekart-orange text-sm">
                      {racesToNext} carreras más
                    </span>
                  </div>
                  <ProgressBar value={progressPercent} max={100} />
                  <p className={cn("text-center mt-2 font-body text-sm", style.subTextColor)}>
                    {currentUser.totalRaces} / {nextLevel.minRaces}
                  </p>
                </div>
              )}

               {/* Benefit Box */}
               {currentLevel.benefits.length > 0 && (
                 <div className={cn("rounded-lg p-4 space-y-2", style.boxBg)}>
                   <p className={cn("font-display text-xs uppercase mb-3", style.subTextColor)}>
                     Beneficios de membresía
                   </p>
                   {currentLevel.benefits.map((benefit, idx) => (
                     <div key={idx} className="flex items-start gap-2">
                       <div className={cn(
                         "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                         style.checkBg
                       )}>
                         <Check className={cn("w-3 h-3", style.checkColor)} />
                       </div>
                       <span className={cn("font-body text-sm", style.subTextColor)}>{benefit}</span>
                     </div>
                   ))}
                 </div>
               )}

              {currentLevel.id === 5 && (
                <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-yellow-400/30" />
              )}
            </div>
          );
        })()}

        {/* All Levels Carousel */}
        <h3 className="font-display text-2xl text-white text-center mb-8">
          🏆 Catálogo de Niveles
        </h3>
        <LevelsCarousel 
          levels={levels} 
          currentLevelId={currentUser.currentLevelId} 
        />

         {/* Rules Info */}
        <BattleCard
          variant="default"
          hoverable={false}
          className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10"
        >
          <h4 className="font-display text-white text-lg mb-4">
            📋 Reglas del Sistema
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body text-sm">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-battlekart-orange font-display mb-2">Periodo de Gracia</p>
              <p className="text-white/70">
                2 meses para renovar después del vencimiento. Tu nivel se mantiene durante este periodo.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-battlekart-orange font-display mb-2">Sin Renovar</p>
              <p className="text-white/70">
                Si no renuevas en los 2 meses, bajas un nivel automáticamente.
              </p>
            </div>
          </div>
        </BattleCard>
      </div>
    </section>
  );
};

export { UserLevel };
