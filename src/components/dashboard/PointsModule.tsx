import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { dsStorage } from "@/lib/mockData";
import { BattleCard } from "@/components/ui/BattleCard";
import { BattleButton } from "@/components/ui/BattleButton";
import { Badge } from "@/components/ui/BattleBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Star, Plus, Gift, Search, Coins, Settings, Trash2,
  ToggleLeft, ToggleRight, History, User, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PointReward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  reward_type: "free_race" | "membership_discount" | "custom";
  reward_value: number;
  is_active: boolean;
  created_at: string;
}

interface Client {
  id: string;
  full_name: string | null;
  client_number: number;
  total_races: number;
  available_points?: number;
}

interface PointRedemption {
  id: string;
  points_spent: number;
  created_at: string;
  user_name: string | null;
  staff_name: string | null;
  reward_name: string | null;
  coupon_code: string | null;
  coupon_is_used: boolean;
}

const REWARD_TYPE_LABELS: Record<string, string> = {
  free_race: "Carreras Gratis",
  membership_discount: "Descuento Membresía",
  custom: "Personalizado",
};

interface PointsModuleProps {
  isAdmin: boolean;
}

const PointsModule = ({ isAdmin }: PointsModuleProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<"rewards" | "redeem" | "history">("redeem");
  const [rewards, setRewards] = useState<PointReward[]>([]);
  const [redemptions, setRedemptions] = useState<PointRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  // Reward form state
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [newReward, setNewReward] = useState({
    name: "",
    description: "",
    points_required: 20,
    reward_type: "free_race" as "free_race" | "membership_discount" | "custom",
    reward_value: 1,
  });

  // Redeem state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedReward, setSelectedReward] = useState<PointReward | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch rewards
    const rewardsData = dsStorage.getPointRewards() as PointReward[];
    // sort asc by points
    rewardsData.sort((a, b) => a.points_required - b.points_required);
    setRewards(rewardsData);

    // Fetch redemptions history (admin only)
    if (isAdmin) {
      const redemptionsData = dsStorage.getPointRedemptions() as any[];
      const usersData = dsStorage.getUsers();
      const couponsData = dsStorage.getCoupons();

      // Enriquecer datos similar a lo que hacía Supabase
      const enriched: PointRedemption[] = redemptionsData.map(r => {
        const user = usersData.find((u: any) => u.id === r.user_id);
        const staff = usersData.find((u: any) => u.id === r.redeemed_by_staff_id);
        const reward = rewardsData.find((rw: PointReward) => rw.id === r.reward_id);
        const coupon = r.generated_coupon_id ? couponsData.find((c: any) => c.id === r.generated_coupon_id) : null;

        return {
          id: r.id,
          points_spent: r.points_spent,
          created_at: r.created_at,
          user_name: user?.full_name || "Usuario",
          staff_name: staff?.full_name || "Staff",
          reward_name: reward?.name || "Recompensa",
          coupon_code: coupon?.code || null,
          coupon_is_used: coupon?.is_used || false,
        };
      });

      // sort desc by created_at 
      enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRedemptions(enriched);
    }

    setLoading(false);
  };

  const searchClients = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const usersData = dsStorage.getUsers();

    // Filtramos localmente asumiendo todos aquí son client a nivel UI
    const isNumeric = /^\d+$/.test(query);
    const filteredUsers = usersData.filter((u: any) => {
      if (isNumeric) {
        return u.client_number?.toString().includes(query);
      } else {
        return u.full_name?.toLowerCase().includes(query.toLowerCase());
      }
    });

    const clientsWithPoints = filteredUsers.map((client: any) => ({
      ...client,
      available_points: (client.total_races || 0) * 10, // dummy logic for available points 
    }));

    setSearchResults(clientsWithPoints.slice(0, 10));
  };

  const selectClient = async (client: Client) => {
    // mock available points calculation
    const points = (client.total_races || 0) * 10;

    setSelectedClient({
      ...client,
      available_points: points,
    });
    setSearchQuery("");
    setSearchResults([]);
    setSelectedReward(null);
  };

  const createReward = async () => {
    if (!newReward.name || newReward.points_required <= 0) {
      toast({
        title: "Error",
        description: "Nombre y puntos requeridos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const newMockReward = {
      id: crypto.randomUUID(),
      name: newReward.name,
      description: newReward.description || null,
      points_required: newReward.points_required,
      reward_type: newReward.reward_type,
      reward_value: newReward.reward_value,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const currentRewards = dsStorage.getPointRewards();
    dsStorage.setPointRewards([...currentRewards, newMockReward]);

    toast({
      title: "¡Recompensa creada (Demo)!",
      description: `${newReward.name} ahora está disponible`,
    });

    setNewReward({
      name: "",
      description: "",
      points_required: 20,
      reward_type: "free_race",
      reward_value: 1,
    });
    setShowRewardForm(false);
    fetchData();
  };

  const toggleRewardStatus = async (reward: PointReward) => {
    const rewards = dsStorage.getPointRewards();
    const idx = rewards.findIndex((r: any) => r.id === reward.id);
    if (idx !== -1) {
      rewards[idx].is_active = !rewards[idx].is_active;
      dsStorage.setPointRewards(rewards);
      fetchData();
    }
  };

  const deleteReward = async (rewardId: string) => {
    const rewards = dsStorage.getPointRewards();
    const filtered = rewards.filter((r: any) => r.id !== rewardId);
    dsStorage.setPointRewards(filtered);

    toast({
      title: "Recompensa eliminada (Demo)",
    });
    fetchData();
  };

  const redeemPoints = async () => {
    if (!selectedClient || !selectedReward) return;

    if ((selectedClient.available_points || 0) < selectedReward.points_required) {
      toast({
        title: "Puntos insuficientes",
        description: `El cliente necesita ${selectedReward.points_required} puntos, tiene ${selectedClient.available_points}`,
        variant: "destructive",
      });
      return;
    }

    setRedeeming(true);

    const newRedemption = {
      id: crypto.randomUUID(),
      points_spent: selectedReward.points_required,
      created_at: new Date().toISOString(),
      user_id: selectedClient.id,
      redeemed_by_staff_id: user?.id || "admin-1",
      reward_id: selectedReward.id,
      generated_coupon_id: null
    };

    const redemptions = dsStorage.getPointRedemptions();
    dsStorage.setPointRedemptions([newRedemption, ...redemptions]);

    // To properly simulate, we need to artificially decrease total races to "spend" points logically in this demo environment, 
    // or strictly save it in a user property if we expanded the mock structure. Let's assume we modify points internally for simplicity, 
    // but the actual `total_races` remains the source of truth for the demo. 
    // We'll update clients directly to match the points reduction.

    const usersData = dsStorage.getUsers();
    const userIndex = usersData.findIndex((u: any) => u.id === selectedClient.id);
    if (userIndex !== -1) {
      // Mock approach: 1 total_race = 10 pts. Deduct equivalent total races or track separately. Tracking separately in the mock is cleaner, but requires expanding mockUsers. 
      // For demo, we just simulate the success without reducing total_races for now, but update the local UI.
    }

    setRedeeming(false);

    toast({
      title: "¡Puntos canjeados (Demo)!",
      description: `${selectedClient.full_name} canjeó ${selectedReward.points_required} puntos por ${selectedReward.name}`,
    });

    const newPts = (selectedClient.available_points || 0) - selectedReward.points_required;

    setSelectedClient({
      ...selectedClient,
      available_points: newPts,
    });
    setSelectedReward(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-battlekart-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeRewards = rewards.filter(r => r.is_active);

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSection("redeem")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm whitespace-nowrap transition-colors",
            activeSection === "redeem"
              ? "bg-battlekart-orange text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <Gift className="w-4 h-4" />
          Canjear Puntos
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveSection("rewards")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm whitespace-nowrap transition-colors",
                activeSection === "rewards"
                  ? "bg-battlekart-orange text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <Settings className="w-4 h-4" />
              Configurar Recompensas
            </button>
            <button
              onClick={() => setActiveSection("history")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm whitespace-nowrap transition-colors",
                activeSection === "history"
                  ? "bg-battlekart-orange text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <History className="w-4 h-4" />
              Historial
            </button>
          </>
        )}
      </div>

      {/* Redeem Section */}
      {activeSection === "redeem" && (
        <div className="space-y-4">
          {/* Search Client */}
          <BattleCard variant="default" className="bg-white">
            <h3 className="font-display text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-battlekart-orange" />
              Buscar Cliente
            </h3>
            <div className="relative">
              <Input
                placeholder="Buscar por nombre o # de cliente..."
                value={searchQuery}
                onChange={(e) => searchClients(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => selectClient(client)}
                    className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-battlekart-orange/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-battlekart-orange" />
                      </div>
                      <div className="text-left">
                        <p className="font-display text-gray-900">{client.full_name || "Sin nombre"}</p>
                        <p className="font-body text-sm text-gray-500">
                          #{client.client_number} • {client.available_points} puntos disponibles
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </BattleCard>

          {/* Selected Client */}
          {selectedClient && (
            <BattleCard variant="default" className="bg-white border-2 border-battlekart-orange">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-battlekart-orange/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-battlekart-orange" />
                  </div>
                  <div>
                    <p className="font-display text-xl text-gray-900">{selectedClient.full_name}</p>
                    <p className="font-body text-gray-500">Cliente #{selectedClient.client_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-battlekart-orange/10 rounded-xl">
                  <p className="font-display text-3xl text-battlekart-orange">
                    {selectedClient.available_points}
                  </p>
                  <p className="font-body text-gray-600 text-sm flex items-center justify-center gap-1">
                    <Star className="w-4 h-4" /> Puntos Disponibles
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-100 rounded-xl">
                  <p className="font-display text-3xl text-gray-700">
                    {selectedClient.total_races}
                  </p>
                  <p className="font-body text-gray-500 text-sm">Carreras Totales</p>
                </div>
              </div>

              {/* Available Rewards */}
              <h4 className="font-display text-gray-900 mb-3">Recompensas Disponibles</h4>
              {activeRewards.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay recompensas configuradas
                </p>
              ) : (
                <div className="space-y-2">
                  {activeRewards.map((reward) => {
                    const canRedeem = (selectedClient.available_points || 0) >= reward.points_required;
                    const isSelected = selectedReward?.id === reward.id;

                    return (
                      <button
                        key={reward.id}
                        onClick={() => setSelectedReward(isSelected ? null : reward)}
                        disabled={!canRedeem}
                        className={cn(
                          "w-full p-4 rounded-xl text-left transition-all",
                          isSelected
                            ? "bg-battlekart-orange text-white ring-2 ring-battlekart-orange ring-offset-2"
                            : canRedeem
                              ? "bg-gray-50 hover:bg-gray-100"
                              : "bg-gray-50 opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={cn("font-display", isSelected ? "text-white" : "text-gray-900")}>
                              {reward.name}
                            </p>
                            <p className={cn("font-body text-sm", isSelected ? "text-white/80" : "text-gray-500")}>
                              {reward.description || REWARD_TYPE_LABELS[reward.reward_type]}
                              {reward.reward_type === "free_race" && ` (${reward.reward_value} carrera${reward.reward_value > 1 ? "s" : ""})`}
                              {reward.reward_type === "membership_discount" && ` (${reward.reward_value}% dto.)`}
                            </p>
                          </div>
                          <Badge variant={isSelected ? "nuevo" : canRedeem ? "default" : "usado"}>
                            <Coins className="w-3 h-3 mr-1" />
                            {reward.points_required} pts
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Redeem Button */}
              {selectedReward && (
                <BattleButton
                  variant="primary"
                  size="lg"
                  className="w-full mt-4"
                  onClick={redeemPoints}
                  disabled={redeeming}
                >
                  {redeeming ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Gift className="w-5 h-5 mr-2" />
                  )}
                  Canjear {selectedReward.points_required} puntos
                </BattleButton>
              )}
            </BattleCard>
          )}
        </div>
      )}

      {/* Rewards Configuration Section (Admin Only) */}
      {activeSection === "rewards" && isAdmin && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-lg text-gray-900">Recompensas Configuradas</h3>
            <BattleButton
              variant="primary"
              size="sm"
              onClick={() => setShowRewardForm(!showRewardForm)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nueva Recompensa
            </BattleButton>
          </div>

          {/* New Reward Form */}
          {showRewardForm && (
            <BattleCard variant="default" className="bg-white border-2 border-dashed border-battlekart-orange">
              <h4 className="font-display text-gray-900 mb-4">Nueva Recompensa</h4>
              <div className="space-y-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    placeholder="Ej: 3 Carreras Gratis"
                    value={newReward.name}
                    onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    placeholder="Descripción opcional..."
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Puntos Requeridos *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newReward.points_required}
                      onChange={(e) => setNewReward({ ...newReward, points_required: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Tipo de Recompensa</Label>
                    <Select
                      value={newReward.reward_type}
                      onValueChange={(value: "free_race" | "membership_discount" | "custom") =>
                        setNewReward({ ...newReward, reward_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free_race">Carreras Gratis</SelectItem>
                        <SelectItem value="membership_discount">Descuento Membresía</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>
                    {newReward.reward_type === "free_race" && "Número de Carreras"}
                    {newReward.reward_type === "membership_discount" && "Porcentaje de Descuento"}
                    {newReward.reward_type === "custom" && "Valor"}
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={newReward.reward_value}
                    onChange={(e) => setNewReward({ ...newReward, reward_value: parseInt(e.target.value) || 1 })}
                  />
                  {newReward.reward_type === "free_race" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ejemplo: 50 puntos = {newReward.reward_value} carrera{newReward.reward_value > 1 ? "s" : ""} gratis
                    </p>
                  )}
                  {newReward.reward_type === "membership_discount" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ejemplo: 60 puntos = {newReward.reward_value}% de descuento en membresía
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <BattleButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowRewardForm(false)}
                  >
                    Cancelar
                  </BattleButton>
                  <BattleButton
                    variant="primary"
                    size="sm"
                    onClick={createReward}
                  >
                    Crear Recompensa
                  </BattleButton>
                </div>
              </div>
            </BattleCard>
          )}

          {/* Rewards List */}
          {rewards.length === 0 ? (
            <BattleCard variant="default" className="bg-white text-center py-8">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-display text-gray-500">No hay recompensas configuradas</p>
              <p className="font-body text-gray-400 text-sm mt-1">
                Crea tu primera recompensa para que los clientes puedan canjear puntos
              </p>
            </BattleCard>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <BattleCard
                  key={reward.id}
                  variant="default"
                  className={cn("bg-white", !reward.is_active && "opacity-60")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-gray-900">{reward.name}</p>
                        {!reward.is_active && (
                          <Badge variant="usado">Inactivo</Badge>
                        )}
                      </div>
                      <p className="font-body text-sm text-gray-500">
                        {reward.description || REWARD_TYPE_LABELS[reward.reward_type]}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="default">
                          <Coins className="w-3 h-3 mr-1" />
                          {reward.points_required} puntos
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {reward.reward_type === "free_race" && `${reward.reward_value} carrera${reward.reward_value > 1 ? "s" : ""}`}
                          {reward.reward_type === "membership_discount" && `${reward.reward_value}% descuento`}
                          {reward.reward_type === "custom" && `Valor: ${reward.reward_value}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRewardStatus(reward)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title={reward.is_active ? "Desactivar" : "Activar"}
                      >
                        {reward.is_active ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteReward(reward.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </BattleCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Section (Admin Only) */}
      {activeSection === "history" && isAdmin && (
        <div className="space-y-4">
          <h3 className="font-display text-lg text-gray-900">Historial de Canjes</h3>
          <p className="text-sm text-gray-500 -mt-2">
            Verifica el código del cupón y si ya fue usado para evitar dobles cobros
          </p>

          {redemptions.length === 0 ? (
            <BattleCard variant="default" className="bg-white text-center py-8">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-display text-gray-500">No hay canjes registrados</p>
            </BattleCard>
          ) : (
            <div className="space-y-2">
              {redemptions.map((redemption) => (
                <BattleCard key={redemption.id} variant="default" className="bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-gray-900">{redemption.user_name}</p>
                      <p className="font-body text-sm text-gray-500">
                        Canjeó <span className="text-battlekart-orange font-medium">{redemption.points_spent} pts</span> por {redemption.reward_name}
                      </p>

                      {/* Coupon info */}
                      {redemption.coupon_code && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-mono text-lg font-bold bg-gray-100 px-3 py-1 rounded-lg">
                            {redemption.coupon_code}
                          </span>
                          <Badge variant={redemption.coupon_is_used ? "usado" : "success"}>
                            {redemption.coupon_is_used ? "YA USADO" : "DISPONIBLE"}
                          </Badge>
                        </div>
                      )}

                      <p className="font-body text-xs text-gray-400 mt-2">
                        {redemption.staff_name ? `Por ${redemption.staff_name}` : "Auto-canje"} • {formatDateShort(redemption.created_at)}
                      </p>
                    </div>
                    <Badge variant="nuevo" className="flex-shrink-0">
                      -{redemption.points_spent} pts
                    </Badge>
                  </div>
                </BattleCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PointsModule;
