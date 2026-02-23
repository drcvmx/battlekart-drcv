import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { dsStorage } from "@/lib/mockData";
import { BattleCard } from "@/components/ui/BattleCard";
import { BattleButton } from "@/components/ui/BattleButton";
import { Badge } from "@/components/ui/BattleBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  LogOut, User, Trophy, Ticket, Calendar, Check,
  Phone, Mail, Gift, Crown, Star, Zap, Hash, Copy, Loader2, History
} from "lucide-react";
import logoImage from "@/assets/logo-battlekart.png";
import iconCancun from "@/assets/icons/icon-cancun.png";
import iconRocket from "@/assets/icons/icon-rocket.png";
import iconHourglass from "@/assets/icons/icon-hourglass.png";
import iconClipboard from "@/assets/icons/icon-clipboard.png";
import { cn } from "@/lib/utils";
import { formatDateEsMX, formatDateShort } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
interface Level {
  id: number;
  name: string;
  color: string;
  min_races: number;
  renewal_discount: number;
}

interface Membership {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface UserCoupon {
  id: string;
  code: string;
  is_used: boolean;
  valid_until: string | null;
  source: string;
  coupon_templates: {
    name: string;
    description: string | null;
    discount_type: string;
    discount_value: number;
  } | null;
}

interface PointReward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  reward_type: "free_race" | "membership_discount" | "custom";
  reward_value: number;
}

interface PointRedemptionHistory {
  id: string;
  points_spent: number;
  reward_name: string;
  created_at: string;
}


// Level up benefits are now also stored as user_coupons with code

const levelIcons: Record<number, React.ElementType> = {
  1: Star,
  2: Trophy,
  3: Crown,
  4: Zap,
  5: Gift,
};

const MEMBERSHIP_PRICE_MXN = 990;

// Beneficios de la MEMBRESÍA (solo precios de carrera)
const getMembershipBenefits = (): string[] => {
  return [
    "Carrera Lun-Vie: $200 MXN",
    "Carrera Sáb-Dom: $300 MXN",
  ];
};

// Beneficios del NIVEL de lealtad (acumulan por carreras)
const getLevelBenefits = (levelId: number): string[] => {
  const benefits: string[] = [];

  // Bronce (0-10 carreras)
  if (levelId === 1) {
    benefits.push("1 carrera gratis en tu cumpleaños");
    return benefits;
  }

  // Plata (11-20 carreras)
  if (levelId === 2) {
    benefits.push("1 carrera gratis al subir de nivel");
    benefits.push("6 fichas gratis por carrera");
  }

  // Oro (21-35 carreras)
  if (levelId === 3) {
    benefits.push("1 carrera gratis al subir de nivel");
    benefits.push("6 fichas gratis por carrera");
    benefits.push("10% de descuento en Arcade");
  }

  // Diamante (36-70 carreras)
  if (levelId === 4) {
    benefits.push("1 carrera gratis al subir de nivel");
    benefits.push("6 fichas gratis por carrera");
    benefits.push("15% de descuento en Arcade");
    benefits.push("10% de descuento en Cafetería");
  }

  // Black (71-100 carreras)
  if (levelId === 5) {
    benefits.push("1 carrera gratis al subir de nivel");
    benefits.push("12 fichas gratis por carrera");
    benefits.push("15% de descuento en Arcade");
    benefits.push("10% de descuento en Cafetería");
    benefits.push("10 min en Arena de RV gratis por carrera");
  }

  return benefits;
};

const ClientDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("nivel");
  const [level, setLevel] = useState<Level | null>(null);
  const [nextLevel, setNextLevel] = useState<Level | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointRewards, setPointRewards] = useState<PointReward[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<PointRedemptionHistory[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);


  const [levels, setLevels] = useState<Level[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // MOCK DATA: Using dsStorage instead of Supabase
      const { dsStorage, mockLevels, mockPointRewards } = await import("@/lib/mockData");

      setLevels(mockLevels);

      // Find current level
      const currentLevel = mockLevels.find(l => l.id === profile?.current_level_id);
      setLevel(currentLevel || mockLevels[0]);

      // Find next level
      const currentIndex = mockLevels.findIndex(l => l.id === profile?.current_level_id);
      if (currentIndex < mockLevels.length - 1) {
        setNextLevel(mockLevels[currentIndex + 1]);
      }

      // Fetch active membership
      if (user) {
        const membershipsData = dsStorage.getMemberships();
        const activeMembership = membershipsData?.find((m: any) => m.user_id === user.id && m.status === "active");
        setMembership(activeMembership || null);

        // Fetch user coupons (from mock data system)
        const couponsData = dsStorage.getCoupons();
        const userCoupons = couponsData?.filter((c: any) => c.user_id === user.id && !c.is_used) || [];
        setUserCoupons(userCoupons as unknown as UserCoupon[]);

        // Fetch available points 
        // Mock points calculation: total_races * 10
        const points = (profile?.total_races || 0) * 10;
        setAvailablePoints(points);

        // Fetch available rewards
        setPointRewards(mockPointRewards as PointReward[]);

        // Fetch user's redemption history
        // Dummy data just to show UI
        setRedemptionHistory([]);
      }
    };

    if (profile) {
      fetchData();
    }
  }, [profile, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "¡Código copiado!",
      description: "Muéstralo en caja para canjearlo",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleMembershipCTA = () => {
    const price = new Intl.NumberFormat("es-MX").format(MEMBERSHIP_PRICE_MXN);
    toast({
      title: "Membresía",
      description: `Costo: MX$${price}. Paga en caja y pide a un miembro del staff que la active para que te lleguen tus beneficios por SMS.`,
    });
  };

  const redeemReward = async (reward: PointReward) => {
    if (!user || availablePoints < reward.points_required) return;

    setRedeeming(reward.id);

    // Mock redemption operation
    const newRedemption = {
      id: crypto.randomUUID(),
      points_spent: reward.points_required,
      created_at: new Date().toISOString(),
      user_id: user.id,
      redeemed_by_staff_id: null,
      reward_id: reward.id,
      generated_coupon_id: null
    };

    const redemptions = dsStorage.getPointRedemptions();
    dsStorage.setPointRedemptions([newRedemption, ...redemptions]);

    toast({
      title: "¡Canjeado exitosamente (Demo)!",
      description: `Tu recompensa está lista.`,
    });

    // Refresh points and coupons locally
    const newPts = availablePoints - reward.points_required;
    setAvailablePoints(newPts);

    const couponsData = dsStorage.getCoupons();
    const activeCoupons = couponsData?.filter((c: any) => c.user_id === user.id && !c.is_used) || [];
    setUserCoupons(activeCoupons as unknown as UserCoupon[]);

    setRedeeming(null);
  };

  const getRewardTypeLabel = (type: string, value: number) => {
    switch (type) {
      case "free_race":
        return `${value} Carrera${value > 1 ? "s" : ""} Gratis`;
      case "membership_discount":
        return `${value}% Desc. Membresía`;
      default:
        return "Premio";
    }
  };

  const totalCoupons = userCoupons.length;

  const racesToNext = nextLevel ? nextLevel.min_races - (profile?.total_races || 0) : 0;
  const progressPercent = nextLevel && level
    ? ((profile?.total_races || 0) - level.min_races) / (nextLevel.min_races - level.min_races) * 100
    : 100;

  const LevelIcon = level ? levelIcons[level.id] || Star : Star;

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile?.full_name || "Usuario";
  };

  // Dynamic background based on level
  const levelBackgrounds: Record<number, string> = {
    1: "/images/bg-bronze.png",   // Bronce
    2: "/images/bg-silver.png",   // Plata
    3: "/images/bg-gold.png",     // Oro
    4: "/images/bg-diamond.png",  // Diamante
    5: "/images/bg-black.png",    // Black
  };

  const currentBackground = levelBackgrounds[level?.id || 1] || levelBackgrounds[1];


  return (
    <div
      className="min-h-screen pb-24 overflow-x-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('${currentBackground}')` }}
    >
      {/* Header */}
      <div className="pt-8 pb-20 px-4">
        <div className="container mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <img src={logoImage} alt="Battle Kart" className="h-12" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Card - Dynamic styling based on level */}
          {(() => {
            const profileStyles: Record<number, {
              cardBg: string;
              textColor: string;
              subTextColor: string;
              iconBg: string;
              borderColor: string;
              levelTextColor: string;
            }> = {
              1: { // Básico
                cardBg: "gradient-dark",
                textColor: "text-white",
                subTextColor: "text-white/60",
                iconBg: "bg-battlekart-orange",
                borderColor: "border-white/10",
                levelTextColor: "text-battlekart-orange",
              },
              2: { // Plata - Gris plateado brillante
                cardBg: "bg-gradient-to-br from-[#C0C0C0] via-[#A8A8A8] to-[#808080] shadow-[0_0_30px_rgba(192,192,192,0.4)]",
                textColor: "text-white",
                subTextColor: "text-white/80",
                iconBg: "bg-white/30",
                borderColor: "border-white/30",
                levelTextColor: "text-white",
              },
              3: { // Oro - Brillante
                cardBg: "bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FF9800] shadow-[0_0_30px_rgba(255,215,0,0.5)]",
                textColor: "text-amber-900",
                subTextColor: "text-amber-800",
                iconBg: "bg-amber-900",
                borderColor: "border-yellow-600/30",
                levelTextColor: "text-amber-900",
              },
              4: { // Platino - Brillante
                cardBg: "bg-gradient-to-br from-[#E5E4E2] via-[#D4D4D4] to-[#A9A9A9] shadow-[0_0_30px_rgba(229,228,226,0.5)]",
                textColor: "text-gray-800",
                subTextColor: "text-gray-600",
                iconBg: "bg-gray-700",
                borderColor: "border-gray-400",
                levelTextColor: "text-gray-800",
              },
              5: { // Black - Brillante
                cardBg: "bg-gradient-to-br from-[#2D2D2D] via-[#1a1a1a] to-[#000000] shadow-[0_0_40px_rgba(255,215,0,0.3)]",
                textColor: "text-white",
                subTextColor: "text-white/80",
                iconBg: "bg-yellow-500",
                borderColor: "border-yellow-400/30",
                levelTextColor: "text-yellow-400",
              },
            };
            const style = profileStyles[level?.id || 1] || profileStyles[1];

            return (
              <div className={cn("rounded-2xl p-6 -mb-16 relative z-10", style.cardBg)}>
                <div className="flex items-center gap-4">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", style.iconBg)}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className={cn("font-display text-xl", style.textColor)}>
                      {getDisplayName()}
                    </h2>
                    <div className="space-y-1">
                      <p className={cn("font-body text-sm flex items-center gap-2", style.subTextColor)}>
                        <Hash className="w-4 h-4" />
                        Cliente #{profile?.client_number || "—"}
                      </p>
                      <p className={cn("font-body text-sm flex items-center gap-2", style.subTextColor)}>
                        <Mail className="w-4 h-4" />
                        {user?.email}
                      </p>
                      {profile?.phone && (
                        <p className={cn("font-body text-sm flex items-center gap-2", style.subTextColor)}>
                          <Phone className="w-4 h-4" />
                          {profile.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className={cn("grid grid-cols-4 gap-1 sm:gap-4 mt-6 pt-6 border-t", style.borderColor)}>
                  <div className="text-center cursor-pointer" onClick={() => setActiveTab("nivel")}>
                    <p className={cn("font-display text-lg sm:text-3xl", style.textColor)}>{profile?.total_races || 0}</p>
                    <p className={cn("font-body text-[9px] sm:text-xs uppercase", style.subTextColor)}>Carreras</p>
                  </div>
                  <div className="text-center cursor-pointer" onClick={() => setActiveTab("nivel")}>
                    <p className={cn("font-display text-lg sm:text-3xl truncate", style.levelTextColor)}>{level?.name || "—"}</p>
                    <p className={cn("font-body text-[9px] sm:text-xs uppercase", style.subTextColor)}>Nivel</p>
                  </div>
                  <div className="text-center cursor-pointer" onClick={() => setActiveTab("puntos")}>
                    <p className={cn("font-display text-lg sm:text-3xl", style.textColor)}>{availablePoints}</p>
                    <p className={cn("font-body text-[9px] sm:text-xs uppercase", style.subTextColor)}>Puntos</p>
                  </div>
                  <div className="text-center cursor-pointer" onClick={() => setActiveTab("cupones")}>
                    <p className={cn("font-display text-lg sm:text-3xl", style.textColor)}>{totalCoupons}</p>
                    <p className={cn("font-body text-[9px] sm:text-xs uppercase", style.subTextColor)}>Cupones</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-lg px-4 pt-20">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "nivel", label: "Mi Nivel", icon: Trophy },
            { id: "puntos", label: "Puntos", icon: Star, badge: availablePoints > 0 ? availablePoints : undefined },
            { id: "cupones", label: "Cupones", icon: Ticket },
            { id: "membresia", label: "Membresía", icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-display text-sm whitespace-nowrap transition-colors relative",
                activeTab === tab.id
                  ? "bg-battlekart-red text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {'badge' in tab && tab.badge !== undefined && (
                <span className="absolute -top-1 -right-1 bg-battlekart-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-display">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "nivel" && level && (
          <div className="space-y-4">
            {/* Current Level Card with dynamic styling */}
            {(() => {
              const levelStyles: Record<number, {
                cardBg: string;
                textColor: string;
                subTextColor: string;
                iconBg: string;
                iconColor: string;
                checkBg: string;
                checkColor: string;
                borderColor: string;
              }> = {
                1: { // Básico - Transparente
                  cardBg: "bg-white/10 backdrop-blur-sm border border-white/20",
                  textColor: "text-gray-800",
                  subTextColor: "text-gray-600",
                  iconBg: "bg-battlekart-orange",
                  iconColor: "text-white",
                  checkBg: "bg-battlekart-orange",
                  checkColor: "text-white",
                  borderColor: "border-gray-200",
                },
                2: { // Plata - Gris plateado brillante
                  cardBg: "bg-gradient-to-br from-[#C0C0C0] via-[#A8A8A8] to-[#808080] shadow-[0_0_30px_rgba(192,192,192,0.4)]",
                  textColor: "text-white",
                  subTextColor: "text-white/80",
                  iconBg: "bg-white/30",
                  iconColor: "text-white",
                  checkBg: "bg-white/30",
                  checkColor: "text-white",
                  borderColor: "border-white/30",
                },
                3: { // Oro - Brillante
                  cardBg: "bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FF9800] shadow-[0_0_30px_rgba(255,215,0,0.5)]",
                  textColor: "text-amber-900",
                  subTextColor: "text-amber-800",
                  iconBg: "bg-amber-900",
                  iconColor: "text-yellow-300",
                  checkBg: "bg-amber-900",
                  checkColor: "text-yellow-300",
                  borderColor: "border-yellow-600/30",
                },
                4: { // Platino - Brillante
                  cardBg: "bg-gradient-to-br from-[#F0F0F0] via-[#E5E4E2] to-[#D4D4D4] shadow-[0_0_30px_rgba(229,228,226,0.5)]",
                  textColor: "text-gray-800",
                  subTextColor: "text-gray-600",
                  iconBg: "bg-gray-700",
                  iconColor: "text-white",
                  checkBg: "bg-gray-700",
                  checkColor: "text-white",
                  borderColor: "border-gray-400",
                },
                5: { // Black - Brillante
                  cardBg: "bg-gradient-to-br from-[#2D2D2D] via-[#1a1a1a] to-[#000000] shadow-[0_0_40px_rgba(255,215,0,0.3)]",
                  textColor: "text-white",
                  subTextColor: "text-white/80",
                  iconBg: "bg-yellow-500",
                  iconColor: "text-black",
                  checkBg: "bg-yellow-500",
                  checkColor: "text-black",
                  borderColor: "border-yellow-400/30",
                },
              };
              const style = levelStyles[level.id] || levelStyles[1];

              return (
                <div className={cn("relative rounded-2xl p-6", style.cardBg)}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", style.iconBg)}>
                      <LevelIcon className={cn("w-7 h-7", style.iconColor)} />
                    </div>
                    <div>
                      <Badge variant="nuevo" className="mb-1 bg-battlekart-orange text-white border-0">TU NIVEL ACTUAL</Badge>
                      <h3 className={cn("font-display text-2xl", style.textColor)}>{level.name}</h3>
                    </div>
                  </div>

                  {nextLevel && (
                    <div className="mb-4">
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
                        {profile?.total_races || 0} / {nextLevel.min_races}
                      </p>
                    </div>
                  )}

                  {/* Beneficios del NIVEL */}
                  {(() => {
                    const levelBenefits = getLevelBenefits(level.id);
                    if (!levelBenefits.length) return null;

                    return (
                      <div className={cn("space-y-2 pt-4 border-t", style.borderColor)}>
                        <p className={cn("font-display text-sm uppercase mb-3", style.subTextColor)}>
                          Beneficios de tu Nivel
                        </p>
                        {levelBenefits.map((benefit, idx) => (
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
                        <p className={cn("font-body text-xs mt-2 opacity-70", style.subTextColor)}>
                          Fichas y descuentos se aplican en caja.
                        </p>
                      </div>
                    );
                  })()}

                  {level.id === 5 && (
                    <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-yellow-400/30" />
                  )}
                </div>
              );
            })()}

            {/* Fichas feature removed - handled in-store */}
          </div>
        )}

        {activeTab === "puntos" && (
          <div className="space-y-4">
            <BattleCard variant="default" className="bg-gradient-to-br from-battlekart-orange to-battlekart-red text-white">
              <div className="text-center py-4">
                <Star className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
                <p className="font-display text-4xl">{availablePoints}</p>
                <p className="font-body text-white/80">Puntos Disponibles</p>
                <p className="font-body text-white/60 text-sm mt-1">
                  {profile?.total_races || 0} carreras totales
                </p>
              </div>
            </BattleCard>

            {/* Available Rewards to Redeem */}
            <BattleCard variant="default" className="bg-white">
              <h3 className="font-display text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-battlekart-orange" />
                Canjear Puntos
              </h3>

              {pointRewards.length === 0 ? (
                <p className="text-gray-500 text-center py-4 font-body">
                  No hay recompensas disponibles por ahora
                </p>
              ) : (
                <div className="space-y-3">
                  {pointRewards.map((reward) => {
                    const canRedeem = availablePoints >= reward.points_required;
                    const isRedeeming = redeeming === reward.id;

                    return (
                      <div
                        key={reward.id}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all",
                          canRedeem
                            ? "border-battlekart-orange bg-battlekart-orange/5"
                            : "border-gray-200 bg-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <p className={cn(
                              "font-display text-lg",
                              canRedeem ? "text-gray-900" : "text-gray-400"
                            )}>
                              {reward.name}
                            </p>
                            <p className={cn(
                              "font-body text-sm",
                              canRedeem ? "text-battlekart-orange" : "text-gray-400"
                            )}>
                              {getRewardTypeLabel(reward.reward_type, reward.reward_value)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-display text-xl",
                              canRedeem ? "text-battlekart-orange" : "text-gray-400"
                            )}>
                              {reward.points_required}
                            </p>
                            <p className="font-body text-xs text-gray-500">puntos</p>
                          </div>
                        </div>

                        {reward.description && (
                          <p className="font-body text-sm text-gray-500 mb-3">
                            {reward.description}
                          </p>
                        )}

                        <BattleButton
                          variant={canRedeem ? "primary" : "ghost"}
                          size="sm"
                          className="w-full"
                          disabled={!canRedeem || isRedeeming}
                          onClick={() => redeemReward(reward)}
                        >
                          {isRedeeming ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Canjeando...
                            </>
                          ) : canRedeem ? (
                            "Canjear Ahora"
                          ) : (
                            `Te faltan ${reward.points_required - availablePoints} puntos`
                          )}
                        </BattleButton>
                      </div>
                    );
                  })}
                </div>
              )}
            </BattleCard>

            {/* How it works */}
            <BattleCard variant="default" className="bg-white">
              <h3 className="font-display text-lg text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-battlekart-orange" />
                ¿Cómo funciona?
              </h3>
              <div className="space-y-3 font-body text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-battlekart-orange/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-battlekart-orange font-display text-sm">1</span>
                  </div>
                  <p>Cada carrera que corres = 1 punto</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-battlekart-orange/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-battlekart-orange font-display text-sm">2</span>
                  </div>
                  <p>Acumula puntos para canjear premios</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-battlekart-orange/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-battlekart-orange font-display text-sm">3</span>
                  </div>
                  <p>Canjea aquí y recibe tu cupón automático</p>
                </div>
              </div>
            </BattleCard>

            {/* Redemption History */}
            {redemptionHistory.length > 0 && (
              <BattleCard variant="default" className="bg-white">
                <h3 className="font-display text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-500" />
                  Tu Historial de Canjes
                </h3>
                <div className="space-y-2">
                  {redemptionHistory.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-display text-sm text-gray-900">{redemption.reward_name}</p>
                        <p className="font-body text-xs text-gray-500">
                          {formatDateShort(redemption.created_at)}
                        </p>
                      </div>
                      <Badge variant="usado">
                        -{redemption.points_spent} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </BattleCard>
            )}
          </div>
        )}

        {activeTab === "cupones" && (
          <div className="space-y-4">
            {totalCoupons === 0 ? (
              <BattleCard variant="default" className="bg-white text-center py-8">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="font-display text-gray-500">No tienes cupones disponibles</p>
                <p className="font-body text-gray-400 text-sm mt-1">
                  ¡Sigue corriendo para obtener beneficios!
                </p>
              </BattleCard>
            ) : (
              <>
                {userCoupons.map((coupon) => {
                  // Get source label and styling
                  const getSourceInfo = (source: string) => {
                    switch (source) {
                      case "level_up":
                        return { label: "🎉 Por subir de nivel", icon: Gift, color: "bg-battlekart-orange/10", iconColor: "text-battlekart-orange" };
                      case "points_redemption":
                        return { label: "🎁 Canjeado con puntos", icon: Star, color: "bg-purple-100", iconColor: "text-purple-600" };
                      case "birthday":
                        return { label: "🎂 Cumpleaños", icon: Gift, color: "bg-pink-100", iconColor: "text-pink-600" };
                      case "auto_assign":
                        return { label: "✨ Promoción especial", icon: Ticket, color: "bg-blue-100", iconColor: "text-blue-600" };
                      default:
                        return { label: "", icon: Ticket, color: "bg-battlekart-red/10", iconColor: "text-battlekart-red" };
                    }
                  };

                  const sourceInfo = getSourceInfo(coupon.source);
                  const SourceIcon = sourceInfo.icon;

                  // Get display info based on template or source
                  const getCouponDisplayInfo = () => {
                    // If template exists, use its values
                    if (coupon.coupon_templates) {
                      const template = coupon.coupon_templates;
                      const value = template.discount_type === "percentage"
                        ? `${template.discount_value}% Descuento`
                        : template.discount_type === "free_race"
                          ? `${template.discount_value} Carrera${template.discount_value > 1 ? 's' : ''} Gratis`
                          : `$${template.discount_value} Descuento`;
                      return {
                        title: value,
                        subtitle: template.name
                      };
                    }

                    // If no template, infer from source
                    switch (coupon.source) {
                      case "level_up":
                        return {
                          title: "1 Carrera Gratis",
                          subtitle: "Premio por subir de nivel"
                        };
                      case "points_redemption":
                        return {
                          title: "Carrera Gratis",
                          subtitle: "Canjeado con puntos"
                        };
                      case "birthday":
                        return {
                          title: "1 Carrera Gratis",
                          subtitle: "Regalo de cumpleaños"
                        };
                      case "auto_assign":
                        return {
                          title: "Beneficio Especial",
                          subtitle: "Promoción BattleKart"
                        };
                      default:
                        return {
                          title: "Cupón BattleKart",
                          subtitle: "Beneficio especial"
                        };
                    }
                  };

                  const displayInfo = getCouponDisplayInfo();

                  return (
                    <BattleCard key={coupon.id} variant="coupon" className="bg-white relative">
                      <Badge variant="nuevo" className="absolute top-3 right-3">
                        DISPONIBLE
                      </Badge>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          sourceInfo.color
                        )}>
                          <SourceIcon className={cn("w-6 h-6", sourceInfo.iconColor)} />
                        </div>
                        <div className="flex-1">
                          <div className="font-display text-xl text-battlekart-red">
                            {displayInfo.title}
                          </div>
                          <p className="font-body text-gray-500 text-sm">
                            {displayInfo.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Source badge - only show if there's a label */}
                      {sourceInfo.label && (
                        <div className="mb-3">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                            coupon.source === "level_up" && "bg-battlekart-orange/10 text-battlekart-orange",
                            coupon.source === "points_redemption" && "bg-purple-100 text-purple-700",
                            coupon.source === "birthday" && "bg-pink-100 text-pink-700",
                            coupon.source === "auto_assign" && "bg-blue-100 text-blue-700"
                          )}>
                            {sourceInfo.label}
                          </span>
                        </div>
                      )}

                      {coupon.coupon_templates?.description && (
                        <p className="font-body text-gray-600 text-sm mb-3">
                          {coupon.coupon_templates.description}
                        </p>
                      )}

                      {/* Coupon code */}
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-mono text-2xl font-bold text-gray-900 transition-colors"
                      >
                        {coupon.code}
                        <Copy className={cn(
                          "w-5 h-5 transition-colors",
                          copiedCode === coupon.code ? "text-green-600" : "text-gray-400"
                        )} />
                      </button>

                      <p className="font-body text-gray-400 text-sm mt-3 text-center">
                        {coupon.valid_until
                          ? `Válido hasta: ${formatDateShort(coupon.valid_until)}`
                          : "Sin fecha de expiración"
                        }
                      </p>
                    </BattleCard>
                  );
                })}
              </>
            )}
          </div>
        )}

        {activeTab === "membresia" && (
          <div className="space-y-4">
            {membership ? (
              <BattleCard variant="default" className="bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <Badge variant="nuevo" className="mb-1">ACTIVA</Badge>
                    <h3 className="font-display text-xl text-gray-900">Membresía Anual</h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-body text-gray-500">Inicio:</span>
                    <span className="font-body text-gray-900">
                      {formatDateShort(membership.start_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-gray-500">Vencimiento:</span>
                    <span className="font-body text-gray-900">
                      {formatDateShort(membership.end_date)}
                    </span>
                  </div>
                  {level && level.renewal_discount > 0 && (
                    <div className="mt-4 p-3 bg-battlekart-orange/10 rounded-xl">
                      <p className="font-display text-battlekart-orange text-center">
                        ¡{level.renewal_discount}% de descuento en renovación por ser nivel {level.name}!
                      </p>
                    </div>
                  )}

                  {/* Beneficios de membresía (precios) */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="font-display text-gray-900 mb-1">Precio preferencial</p>
                    <div className="space-y-2">
                      {getMembershipBenefits().map((b, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-body text-sm text-gray-700">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Beneficios por nivel */}
                  {level && (
                    <div className="mt-4 p-4 bg-battlekart-orange/10 rounded-xl">
                      <p className="font-display text-gray-900 mb-1">Beneficios de Nivel {level.name}</p>
                      <div className="space-y-2">
                        {getLevelBenefits(level.id).map((b, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-battlekart-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-body text-sm text-gray-700">{b}</span>
                          </div>
                        ))}
                      </div>
                      <p className="font-body text-xs text-gray-400 mt-3">
                        Fichas y descuentos se aplican en caja.
                      </p>
                    </div>
                  )}
                </div>
              </BattleCard>
            ) : (
              <BattleCard variant="default" className="bg-white">
                <div className="text-center py-4">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="font-display text-gray-500">No tienes membresía activa</p>
                  <p className="font-body text-gray-400 text-sm mt-1">
                    Con la membresía tendrás acceso a beneficios exclusivos
                  </p>
                </div>

                {level && (
                  <div className="px-6 pb-6">
                    {/* Beneficios de membresía que obtendrían */}
                    <div className="mt-2 p-4 bg-green-50 rounded-xl text-left">
                      <p className="font-display text-gray-900 mb-1">Con membresía tendrás:</p>
                      <div className="space-y-2">
                        {getMembershipBenefits().map((b, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-body text-sm text-gray-700">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Beneficios de nivel actual */}
                    <div className="mt-4 p-4 bg-battlekart-orange/10 rounded-xl text-left">
                      <p className="font-display text-gray-900 mb-1">Beneficios de Nivel {level.name}</p>
                      <div className="space-y-2">
                        {getLevelBenefits(level.id).map((b, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-battlekart-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-body text-sm text-gray-700">{b}</span>
                          </div>
                        ))}
                      </div>
                      <p className="font-body text-xs text-gray-400 mt-3">
                        Fichas y descuentos se aplican en caja.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <BattleButton variant="primary" onClick={handleMembershipCTA}>
                        Obtener Membresía (MX${new Intl.NumberFormat("es-MX").format(MEMBERSHIP_PRICE_MXN)})
                      </BattleButton>
                    </div>

                    <p className="font-body text-xs text-gray-400 mt-3 text-center">
                      Acude a caja con un miembro del staff para confirmar el pago y activar tu membresía.
                    </p>
                  </div>
                )}
              </BattleCard>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center py-3 px-2 max-w-lg mx-auto safe-area-pb">
          {[
            {
              id: "nivel",
              label: "Nivel",
              img: iconRocket,
              imgClassName: "w-9 h-9 object-contain",
            },
            {
              id: "puntos",
              label: "Puntos",
              img: iconClipboard,
              imgClassName: "w-9 h-9 object-contain",
            },
            {
              id: "cupones",
              label: "Cupones",
              img: iconHourglass,
              imgClassName: "w-9 h-9 object-contain",
            },
            {
              id: "membresia",
              label: "Membresía",
              img: iconCancun,
              imgClassName: "w-9 h-9 object-contain scale-[2]",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors duration-300 min-w-[72px] relative",
                activeTab === item.id
                  ? "text-battlekart-red bg-battlekart-red/10"
                  : "text-muted-foreground hover:text-battlekart-red",
              )}
            >
              <div className="relative">
                <img src={item.img} alt={item.label} className={item.imgClassName} />
              </div>
              <span className="text-xs font-display uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default ClientDashboard;
