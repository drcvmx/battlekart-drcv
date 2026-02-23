import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import { dsStorage, mockLevels, mockCoupons } from "@/lib/mockData";
import { BattleCard } from "@/components/ui/BattleCard";
import { BattleButton } from "@/components/ui/BattleButton";
import { Badge } from "@/components/ui/BattleBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LogOut, Users, Trophy, Ticket, Calendar, Search,
  Plus, Minus, Flag, User, ChevronRight, LayoutDashboard, Trash2, History,
  Phone, Hash, Cake, Copy, Check, MessageCircle, Send, Star, Gift
} from "lucide-react";
import PointsModule from "./PointsModule";
import logoImage from "@/assets/logo-battlekart.png";
import { cn } from "@/lib/utils";
import { formatDateEsMX, formatDateShort } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
  client_number: number;
  total_races: number;
  current_level_id: number | null;
  levels: { name: string; color: string } | null;
}

interface Stats {
  totalClients: number;
  totalRaces: number;
  activeMemberships: number;
  pendingCoupons: number;
}

interface Level {
  id: number;
  name: string;
  color: string;
}

interface CouponTemplate {
  id: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  target_level_id: number | null;
  valid_until: string | null;
  is_active: boolean;
  auto_assign: boolean;
  levels: { name: string } | null;
}

interface UserCoupon {
  id: string;
  code: string;
  is_used: boolean;
  valid_until: string | null;
  user_id: string;
  template_id: string | null;
  source: string;
  profiles: { full_name: string | null; client_number: number } | null;
  coupon_templates: { name: string; discount_value: number; discount_type: string } | null;
}

interface RaceLog {
  id: string;
  created_at: string;
  user_id: string;
  staff_id: string | null;
  client_name: string | null;
  staff_name: string | null;
  type: "added" | "deleted";
}

interface RaceDeletion {
  id: string;
  deleted_at: string;
  client_id: string;
  deleted_by_staff_id: string;
}

interface CouponStats {
  template_id: string;
  template_name: string;
  discount_type: string;
  discount_value: number;
  level_name: string | null;
  total_issued: number;
  total_redeemed: number;
  total_expired: number;
  total_active: number;
  valid_until: string | null;
}

interface CouponRedemption {
  id: string;
  code: string;
  used_at: string;
  user_name: string | null;
  staff_name: string | null;
  template_name: string | null;
}


interface ClientMembership {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: string;
}

const AdminDashboard = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalRaces: 0,
    activeMemberships: 0,
    pendingCoupons: 0,
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [raceLogs, setRaceLogs] = useState<RaceLog[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [couponTemplates, setCouponTemplates] = useState<CouponTemplate[]>([]);
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [couponSearchCode, setCouponSearchCode] = useState("");
  const [foundCoupon, setFoundCoupon] = useState<UserCoupon | null>(null);
  const [couponStats, setCouponStats] = useState<CouponStats[]>([]);
  const [couponRedemptions, setCouponRedemptions] = useState<CouponRedemption[]>([]);
  const [historyTab, setHistoryTab] = useState<"carreras" | "cupones">("carreras");
  const [searchingCoupon, setSearchingCoupon] = useState(false);


  // Membership control for selected client
  const [clientMembership, setClientMembership] = useState<ClientMembership | null>(null);
  const [loadingClientMembership, setLoadingClientMembership] = useState(false);
  const [activatingMembership, setActivatingMembership] = useState(false);

  // New client form state
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    birth_date: "",
  });

  // New coupon form state
  const [showNewCouponForm, setShowNewCouponForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    name: "",
    description: "",
    discount_type: "fixed",
    discount_value: 0,
    target_level_id: "",
    valid_until: "",
    auto_assign: true,
    send_whatsapp: false,
  });
  const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!selectedClient?.id) {
        setClientMembership(null);
        return;
      }

      setLoadingClientMembership(true);

      const { dsStorage } = await import("@/lib/mockData");
      const membershipsData = dsStorage.getMemberships() || [];
      const membership = membershipsData.find((m: any) => m.user_id === selectedClient.id);

      setClientMembership(membership || null);
      setLoadingClientMembership(false);
    };

    void load();
  }, [selectedClient?.id]);

  const activateMembershipForSelectedClient = async () => {
    if (!selectedClient?.id) return;

    // If already active, just notify
    if (clientMembership?.status === "active") {
      toast({
        title: "Ya está activa",
        description: "Este cliente ya tiene una membresía activa.",
      });
      return;
    }

    setActivatingMembership(true);

    const now = new Date();
    const startISO = now.toISOString();
    const end = new Date(now);
    end.setFullYear(end.getFullYear() + 1);
    const endISO = end.toISOString();

    try {
      const { dsStorage } = await import("@/lib/mockData");
      const memberships = dsStorage.getMemberships();

      let updatedMembership;

      if (clientMembership?.id) {
        // Update existing
        const index = memberships.findIndex((m: any) => m.id === clientMembership.id);
        if (index !== -1) {
          memberships[index] = {
            ...memberships[index],
            status: "active",
            start_date: memberships[index].start_date || startISO,
            end_date: memberships[index].end_date || endISO,
          };
          updatedMembership = memberships[index];
        }
      } else {
        // Insert new
        updatedMembership = {
          id: crypto.randomUUID(),
          user_id: selectedClient.id,
          status: "active",
          start_date: startISO,
          end_date: endISO,
        };
        memberships.push(updatedMembership);
      }

      // We'd actually have a setMemberships, but we can simulate by keeping it locally updated or just state if it's not exported
      if (typeof dsStorage.setMemberships === "function") {
        dsStorage.setMemberships(memberships);
      }

      toast({
        title: "Membresía activada (Demo)",
        description: "Se activó la membresía localmente.",
      });

      // Refresh membership + stats
      setLoadingClientMembership(true);
      setClientMembership(updatedMembership as ClientMembership);
      setLoadingClientMembership(false);

      void fetchData();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "No se pudo activar la membresía.",
        variant: "destructive",
      });
    } finally {
      setActivatingMembership(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    // Mock levels are set below


    // Fetch only clients (users with 'client' role) with their level info
    // MOCK DATA: Using dsStorage instead of Supabase
    const { dsStorage, mockLevels, mockCoupons } = await import("@/lib/mockData");

    const usersData = dsStorage.getUsers();
    console.log("Mock Users:", usersData);

    if (usersData) {
      setClients(usersData);

      // Calcular estadísticas mock
      const membershipsData = dsStorage.getMemberships();
      const activeMemberships = membershipsData?.filter((m: any) => m.status === 'active') || [];

      const couponsData = dsStorage.getCoupons();
      const pendingCoupons = couponsData?.filter((c: any) => !c.is_used) || [];

      const totalRaces = usersData.reduce((acc: number, user: any) => acc + (user.total_races || 0), 0);

      setStats({
        totalClients: usersData.length,
        totalRaces: totalRaces,
        activeMemberships: activeMemberships.length,
        pendingCoupons: pendingCoupons.length,
      });
    }

    setLevels(mockLevels);

    // For other mock data, you'd similarly fetch from dsStorage and update state
    // Example for coupon templates (if isAdmin is true in mock context)
    if (isAdmin) {
      setCouponTemplates(dsStorage.getCouponTemplates());
    }

    // Example for user coupons
    const mockUserCoupons = dsStorage.getCoupons().filter((c: any) => !c.is_used);
    const userIds = [...new Set(mockUserCoupons.map((c: any) => c.user_id))];
    const couponProfiles = dsStorage.getUsers().filter((u: any) => userIds.includes(u.id));
    const profilesMap = new Map(couponProfiles?.map((p: any) => [p.id, p]) || []);

    const enrichedCoupons = mockUserCoupons.map((coupon: any) => ({
      ...coupon,
      profiles: profilesMap.get(coupon.user_id) || null,
      coupon_templates: dsStorage.getCouponTemplates().find((t: any) => t.id === coupon.template_id) || null,
    }));
    setUserCoupons(enrichedCoupons);

    // Example for race logs (simplified mock)
    if (isAdmin) {
      const mockRaceLogs = dsStorage.getRaceLogs();
      setRaceLogs(mockRaceLogs.slice(0, 50));

      // Handle coupon stats manually locally
      const statsMap = new Map<string, CouponStats>();
      const allTemplates = dsStorage.getCouponTemplates();
      const allCoupons = dsStorage.getCoupons();
      const now = new Date();

      allTemplates.forEach((template: any) => {
        statsMap.set(template.id, {
          template_id: template.id,
          template_name: template.name,
          discount_type: template.discount_type,
          discount_value: template.discount_value,
          level_name: mockLevels.find(l => l.id === template.target_level_id)?.name || null,
          total_issued: 0,
          total_redeemed: 0,
          total_expired: 0,
          total_active: 0,
          valid_until: template.valid_until,
        });
      });

      allCoupons.forEach((coupon: any) => {
        const stat = statsMap.get(coupon.template_id);
        if (stat) {
          stat.total_issued++;
          if (coupon.is_used) {
            stat.total_redeemed++;
          } else if (coupon.valid_until) {
            const validUntil = new Date(coupon.valid_until);
            validUntil.setHours(23, 59, 59, 999);
            if (validUntil < now) {
              stat.total_expired++;
            } else {
              stat.total_active++;
            }
          } else {
            stat.total_active++; // No valid_until means always active
          }
        }
      });
      setCouponStats(Array.from(statsMap.values()));

      // Mock redemptions
      const mockRedemptions = allCoupons
        .filter((c: any) => c.is_used)
        .map((c: any) => ({
          id: c.id,
          code: c.code,
          used_at: c.used_at || new Date().toISOString(),
          user_name: dsStorage.getUsers().find((u: any) => u.id === c.user_id)?.full_name || "Desconocido",
          staff_name: dsStorage.getUsers().find((u: any) => u.id === c.used_by_staff_id)?.full_name || null,
          template_name: dsStorage.getCouponTemplates().find((t: any) => t.id === c.template_id)?.name || "Desconocido",
        }));
      setCouponRedemptions(mockRedemptions.slice(0, 50));
    }

    setLoading(false);
  };


  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const addRaceToClient = async (clientId: string) => {
    const usersData = dsStorage.getUsers();
    const clientIndex = usersData.findIndex((c: any) => c.id === clientId);

    if (clientIndex !== -1) {
      usersData[clientIndex].total_races = (usersData[clientIndex].total_races || 0) + 1;

      // Update level logic (mock)
      const currentRaces = usersData[clientIndex].total_races;
      let newLevelId = 1;
      if (currentRaces >= 100) newLevelId = 5;
      else if (currentRaces >= 60) newLevelId = 4;
      else if (currentRaces >= 30) newLevelId = 3;
      else if (currentRaces >= 10) newLevelId = 2;

      usersData[clientIndex].current_level_id = newLevelId;
      usersData[clientIndex].levels = mockLevels.find(l => l.id === newLevelId) || mockLevels[0];

      dsStorage.setUsers(usersData);
      setClients(usersData);

      // Add to race logs mock
      const newLog = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        user_id: clientId,
        staff_id: user?.id || null,
        client_name: usersData[clientIndex].full_name,
        staff_name: profile?.full_name || "Admin",
        type: "added" as const
      };

      const logs = dsStorage.getRaceLogs();
      dsStorage.setRaceLogs([newLog, ...logs]);
      setRaceLogs([newLog, ...logs].slice(0, 50));

      toast({
        title: "¡Carrera registrada!",
        description: "La carrera se ha agregado correctamente",
      });
      setSelectedClient(null);

      // recalculate total races for stats
      const totalRaces = usersData.reduce((acc: number, u: any) => acc + (u.total_races || 0), 0);
      setStats(prev => ({ ...prev, totalRaces }));
    }
  };

  const removeRaceFromClient = async (clientId: string) => {
    const usersData = dsStorage.getUsers();
    const clientIndex = usersData.findIndex((c: any) => c.id === clientId);

    if (clientIndex === -1 || (usersData[clientIndex].total_races || 0) <= 0) {
      toast({
        title: "Error",
        description: "El cliente no tiene carreras para eliminar",
        variant: "destructive",
      });
      return;
    }

    usersData[clientIndex].total_races -= 1;

    // Update level logic (mock)
    const currentRaces = usersData[clientIndex].total_races;
    let newLevelId = 1;
    if (currentRaces >= 100) newLevelId = 5;
    else if (currentRaces >= 60) newLevelId = 4;
    else if (currentRaces >= 30) newLevelId = 3;
    else if (currentRaces >= 10) newLevelId = 2;

    usersData[clientIndex].current_level_id = newLevelId;
    usersData[clientIndex].levels = mockLevels.find(l => l.id === newLevelId) || mockLevels[0];

    dsStorage.setUsers(usersData);
    setClients(usersData);

    // Add to race logs mock
    const newLog = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: clientId,
      staff_id: user?.id || null,
      client_name: usersData[clientIndex].full_name,
      staff_name: profile?.full_name || "Admin",
      type: "deleted" as const
    };

    const logs = dsStorage.getRaceLogs();
    dsStorage.setRaceLogs([newLog, ...logs]);
    setRaceLogs([newLog, ...logs].slice(0, 50));

    toast({
      title: "Carrera eliminada",
      description: "Se ha reducido una carrera del cliente",
    });
    setSelectedClient(null);

    // recalculate total races for stats
    const totalRaces = usersData.reduce((acc: number, u: any) => acc + (u.total_races || 0), 0);
    setStats(prev => ({ ...prev, totalRaces }));
  };

  const createClient = async () => {
    if (!newClient.email || !newClient.password || !newClient.first_name || !newClient.last_name) {
      toast({
        title: "Error",
        description: "Email, contraseña, nombre y apellido son requeridos",
        variant: "destructive",
      });
      return;
    }

    if (newClient.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setCreatingClient(true);

    try {
      // Mock client creation
      const usersData = dsStorage.getUsers();
      const currentHighestNumber = Math.max(...usersData.map((u: any) => u.client_number || 0), 1000);

      const newMockClient = {
        id: crypto.randomUUID(),
        email: newClient.email,
        full_name: `${newClient.first_name} ${newClient.last_name}`,
        first_name: newClient.first_name,
        last_name: newClient.last_name,
        phone: newClient.phone || null,
        birth_date: newClient.birth_date || null,
        client_number: currentHighestNumber + 1,
        total_races: 0,
        current_level_id: 1,
        levels: mockLevels[0],
      };

      dsStorage.setUsers([...usersData, newMockClient]);

      toast({
        title: "¡Cliente creado (Demo)!",
        description: `${newClient.first_name} ${newClient.last_name} ha sido registrado exitosamente`,
      });

      setNewClient({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
        birth_date: "",
      });
      setShowNewClientForm(false);
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear el cliente";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingClient(false);
    }
  };

  const createCouponTemplate = async () => {
    if (!newCoupon.name || newCoupon.discount_value <= 0) {
      toast({
        title: "Error",
        description: "Completa el nombre y valor del descuento",
        variant: "destructive",
      });
      return;
    }

    // Mock template creation
    const templates = dsStorage.getCouponTemplates();
    const newTemplate = {
      id: crypto.randomUUID(),
      name: newCoupon.name,
      description: newCoupon.description || null,
      discount_type: newCoupon.discount_type,
      discount_value: newCoupon.discount_value,
      target_level_id: newCoupon.target_level_id ? parseInt(newCoupon.target_level_id) : null,
      valid_until: newCoupon.valid_until || null,
      auto_assign: newCoupon.auto_assign,
      is_active: true,
      levels: newCoupon.target_level_id ? { name: mockLevels.find(l => l.id.toString() === newCoupon.target_level_id)?.name } : null
    };

    dsStorage.setCouponTemplates([newTemplate, ...templates]);

    toast({
      title: "¡Cupón creado (Demo)!",
      description: "La plantilla de cupón se ha creado correctamente",
    });

    setNewCoupon({
      name: "",
      description: "",
      discount_type: "fixed",
      discount_value: 0,
      target_level_id: "",
      valid_until: "",
      auto_assign: true,
      send_whatsapp: false,
    });
    setShowNewCouponForm(false);
    fetchData();
  };

  const sendCouponViaWhatsApp = async (couponId: string) => {
    setSendingWhatsApp(couponId);
    // Mock sending WhatsApp
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSendingWhatsApp(null);
    toast({
      title: "¡WhatsApp simulado!",
      description: "En la demo, simulamos el envío de WhatsApp.",
    });
  };

  const redeemCoupon = async (couponId: string) => {
    const coupons = dsStorage.getCoupons();
    const couponIndex = coupons.findIndex((c: any) => c.id === couponId);

    if (couponIndex !== -1) {
      coupons[couponIndex].is_used = true;
      coupons[couponIndex].used_at = new Date().toISOString();
      coupons[couponIndex].used_by_staff_id = user?.id || "staff-1";

      dsStorage.setCoupons(coupons);

      toast({
        title: "¡Cupón canjeado!",
        description: "El cupón ha sido marcado como usado",
      });

      fetchData();
    } else {
      toast({
        title: "Error",
        description: "No se pudo canjear el cupón",
        variant: "destructive",
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const deleteCouponTemplate = async (templateId: string) => {
    const templates = dsStorage.getCouponTemplates();
    const updatedTemplates = templates.filter((t: any) => t.id !== templateId);
    dsStorage.setCouponTemplates(updatedTemplates);

    toast({
      title: "Plantilla eliminada",
      description: "La plantilla de cupón ha sido eliminada",
    });

    fetchData();
  };

  const searchCouponByCode = async () => {
    if (couponSearchCode.length !== 6 && couponSearchCode.length !== 9) { // DEMO-WELC is 9
      toast({
        title: "Código inválido",
        description: "El código debe tener el formato correcto",
        variant: "destructive",
      });
      return;
    }

    setSearchingCoupon(true);
    setFoundCoupon(null);

    // Mock search
    await new Promise(resolve => setTimeout(resolve, 500));

    const coupons = dsStorage.getCoupons();
    const coupon = coupons.find((c: any) => c.code.toLowerCase() === couponSearchCode.toLowerCase());

    setSearchingCoupon(false);

    if (!coupon) {
      toast({
        title: "Cupón no encontrado",
        description: "No existe un cupón con ese código",
        variant: "destructive",
      });
      return;
    }

    if (coupon.is_used) {
      toast({
        title: "Cupón ya usado",
        description: "Este cupón ya fue canjeado anteriormente",
        variant: "destructive",
      });
      return;
    }

    if (coupon.valid_until) {
      const validUntilDate = new Date(coupon.valid_until);
      validUntilDate.setHours(23, 59, 59, 999);

      if (validUntilDate < new Date()) {
        toast({
          title: "Cupón expirado",
          description: "Este cupón ya no es válido",
          variant: "destructive",
        });
        return;
      }
    }

    const userData = dsStorage.getUsers().find((u: any) => u.id === coupon.user_id);
    const enrichedCoupon = {
      ...coupon,
      profiles: userData ? { full_name: userData.full_name, client_number: userData.client_number } : null,
      coupon_templates: dsStorage.getCouponTemplates().find((t: any) => t.id === coupon.template_id) || null,
    };

    setFoundCoupon(enrichedCoupon as unknown as UserCoupon);
  };

  const redeemFoundCoupon = async () => {
    if (!foundCoupon) return;

    await redeemCoupon(foundCoupon.id);

    toast({
      title: "¡Cupón canjeado!",
      description: `El cupón de ${foundCoupon.profiles?.full_name || "cliente"} ha sido canjeado exitosamente`,
    });

    setCouponSearchCode("");
    setFoundCoupon(null);
  };

  const getClientDisplayName = (client: Client) => {
    if (client.first_name && client.last_name) {
      return `${client.first_name} ${client.last_name}`;
    }
    return client.full_name || "Sin nombre";
  };

  // Using formatDateEsMX from date-utils to avoid timezone issues
  const formatBirthDate = (date: string | null) => formatDateEsMX(date);

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.full_name?.toLowerCase().includes(query) ||
      client.first_name?.toLowerCase().includes(query) ||
      client.last_name?.toLowerCase().includes(query) ||
      client.phone?.includes(searchQuery) ||
      client.client_number.toString().includes(searchQuery)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Battle Kart" className="h-10" />
            <div>
              <p className="font-display text-sm text-white/60">
                {isAdmin ? "ADMINISTRADOR" : "STAFF"}
              </p>
              <p className="font-body text-white/80 text-sm">
                {profile?.full_name || user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "clientes", label: "Clientes", icon: Users },
              { id: "cupones", label: "Cupones", icon: Ticket },
              { id: "puntos", label: "Puntos", icon: Star },
              { id: "carreras", label: "Registrar", icon: Flag },
              ...(isAdmin ? [{ id: "historial", label: "Historial", icon: History }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-battlekart-red text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-5xl px-6 py-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <BattleCard variant="default" className="bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-gray-900">{stats.totalClients}</p>
                    <p className="font-body text-gray-500 text-xs">Clientes</p>
                  </div>
                </div>
              </BattleCard>

              <BattleCard variant="default" className="bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Flag className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-gray-900">{stats.totalRaces}</p>
                    <p className="font-body text-gray-500 text-xs">Carreras</p>
                  </div>
                </div>
              </BattleCard>

              <BattleCard variant="default" className="bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-gray-900">{stats.activeMemberships}</p>
                    <p className="font-body text-gray-500 text-xs">Membresías</p>
                  </div>
                </div>
              </BattleCard>

              <BattleCard variant="default" className="bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-gray-900">{stats.pendingCoupons}</p>
                    <p className="font-body text-gray-500 text-xs">Cupones</p>
                  </div>
                </div>
              </BattleCard>
            </div>

            {/* Top Clients */}
            <BattleCard variant="default" className="bg-white">
              <h3 className="font-display text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-battlekart-orange" />
                Top Clientes
              </h3>
              <div className="space-y-3">
                {clients.slice(0, 5).map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-display text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-display text-gray-900">{getClientDisplayName(client)}</p>
                        <p className="font-body text-gray-500 text-xs">
                          #{client.client_number} • {client.levels?.name || "Básico"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="nuevo">{client.total_races} carreras</Badge>
                  </div>
                ))}
              </div>
            </BattleCard>
          </div>
        )}

        {activeTab === "clientes" && (
          <div className="space-y-4">
            {/* Search and Add Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, teléfono o # cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <BattleButton
                onClick={() => setShowNewClientForm(!showNewClientForm)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo
              </BattleButton>
            </div>

            {/* New Client Form */}
            {showNewClientForm && (
              <BattleCard variant="default" className="bg-white">
                <h3 className="font-display text-lg text-gray-900 mb-4">Registrar Nuevo Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-client-first-name">Nombre *</Label>
                    <Input
                      id="new-client-first-name"
                      value={newClient.first_name}
                      onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })}
                      placeholder="Nombre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-client-last-name">Apellido *</Label>
                    <Input
                      id="new-client-last-name"
                      value={newClient.last_name}
                      onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })}
                      placeholder="Apellido"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-client-email">Email *</Label>
                    <Input
                      id="new-client-email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-client-password">Contraseña *</Label>
                    <Input
                      id="new-client-password"
                      type="password"
                      value={newClient.password}
                      onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-client-phone">Teléfono</Label>
                    <Input
                      id="new-client-phone"
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      placeholder="+52 555 123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-client-birth-date">Fecha de nacimiento</Label>
                    <Input
                      id="new-client-birth-date"
                      type="date"
                      value={newClient.birth_date}
                      onChange={(e) => setNewClient({ ...newClient, birth_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <BattleButton
                    variant="secondary"
                    onClick={() => setShowNewClientForm(false)}
                  >
                    Cancelar
                  </BattleButton>
                  <BattleButton
                    onClick={createClient}
                    disabled={creatingClient}
                  >
                    {creatingClient ? "Creando..." : "Crear Cliente"}
                  </BattleButton>
                </div>
              </BattleCard>
            )}

            {/* Client List */}
            <div className="space-y-2">
              {filteredClients.map((client) => (
                <BattleCard
                  key={client.id}
                  variant="default"
                  className="bg-white cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-display text-gray-900">{getClientDisplayName(client)}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {client.client_number}
                          </span>
                          {client.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </span>
                          )}
                          {client.birth_date && (
                            <span className="flex items-center gap-1">
                              <Cake className="w-3 h-3" />
                              {formatDateShort(client.birth_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="amigos">{client.levels?.name || "Básico"}</Badge>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </BattleCard>
              ))}
            </div>
          </div>
        )}


        {activeTab === "cupones" && (
          <div className="space-y-6">
            {/* Admin: Coupon Templates */}
            {isAdmin && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl text-gray-900">Plantillas de Cupones</h3>
                  <BattleButton
                    variant="primary"
                    size="sm"
                    onClick={() => setShowNewCouponForm(!showNewCouponForm)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Crear Cupón
                  </BattleButton>
                </div>

                {/* New Coupon Form */}
                {showNewCouponForm && (
                  <BattleCard variant="default" className="bg-white">
                    <h4 className="font-display text-lg text-gray-900 mb-4">Nueva Plantilla de Cupón</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nombre del cupón</Label>
                        <Input
                          placeholder="Ej: Descuento Jueves Plata"
                          value={newCoupon.name}
                          onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción (opcional)</Label>
                        <Input
                          placeholder="Ej: Descuento especial para nivel plata"
                          value={newCoupon.description}
                          onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de descuento</Label>
                        <Select
                          value={newCoupon.discount_type}
                          onValueChange={(value) => setNewCoupon({ ...newCoupon, discount_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                            <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                            <SelectItem value="free_race">Carrera gratis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {newCoupon.discount_type === "percentage" ? "Porcentaje" :
                            newCoupon.discount_type === "free_race" ? "Carreras gratis" : "Monto ($)"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={newCoupon.discount_value}
                          onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nivel objetivo (opcional)</Label>
                        <Select
                          value={newCoupon.target_level_id || "all"}
                          onValueChange={(value) => setNewCoupon({ ...newCoupon, target_level_id: value === "all" ? "" : value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todos los niveles" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los niveles</SelectItem>
                            {levels.map((level) => (
                              <SelectItem key={level.id} value={level.id.toString()}>
                                {level.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha de expiración (opcional)</Label>
                        <Input
                          type="date"
                          value={newCoupon.valid_until}
                          onChange={(e) => setNewCoupon({ ...newCoupon, valid_until: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="auto_assign"
                          checked={newCoupon.auto_assign}
                          onChange={(e) => setNewCoupon({ ...newCoupon, auto_assign: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <Label htmlFor="auto_assign" className="font-normal">
                          Asignar automáticamente cuando el cliente alcance el nivel objetivo
                        </Label>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="send_whatsapp"
                          checked={newCoupon.send_whatsapp}
                          onChange={(e) => setNewCoupon({ ...newCoupon, send_whatsapp: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <Label htmlFor="send_whatsapp" className="font-normal flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          Enviar por WhatsApp a los clientes al crear
                        </Label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <BattleButton variant="primary" onClick={createCouponTemplate}>
                        Crear Plantilla
                      </BattleButton>
                      <BattleButton variant="ghost" onClick={() => setShowNewCouponForm(false)}>
                        Cancelar
                      </BattleButton>
                    </div>
                  </BattleCard>
                )}

                {/* Existing Templates */}
                {couponTemplates.length > 0 && (
                  <div className="space-y-2">
                    {couponTemplates.map((template) => {
                      const isExpired = template.valid_until && new Date(template.valid_until) < new Date();
                      const isLevelUpTemplate = template.id === "00000000-0000-0000-0000-000000000001";

                      return (
                        <BattleCard key={template.id} variant="default" className={cn("bg-white", isExpired && "opacity-60")}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                isExpired ? "bg-gray-100" : "bg-purple-100"
                              )}>
                                <Ticket className={cn("w-5 h-5", isExpired ? "text-gray-400" : "text-purple-600")} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-display text-gray-900 truncate">{template.name}</p>
                                <p className="font-body text-gray-500 text-sm">
                                  {template.discount_type === "percentage"
                                    ? `${template.discount_value}% descuento`
                                    : template.discount_type === "free_race"
                                      ? `${template.discount_value} carrera(s) gratis`
                                      : `$${template.discount_value} descuento`}
                                  {template.levels && ` • ${template.levels.name}`}
                                  {template.valid_until && (
                                    <span className={cn("ml-2", isExpired ? "text-red-500" : "text-gray-400")}>
                                      • {isExpired ? "Expirado" : `Expira: ${formatDateShort(template.valid_until)}`}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isExpired && (
                                <Badge variant="basico">Expirado</Badge>
                              )}
                              {!isExpired && (
                                <Badge variant={template.is_active ? "nuevo" : "basico"}>
                                  {template.is_active ? "Activo" : "Inactivo"}
                                </Badge>
                              )}
                              {!isLevelUpTemplate && (
                                <button
                                  onClick={() => deleteCouponTemplate(template.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Eliminar plantilla"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </BattleCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Coupon Redemption Search */}
            <div className="space-y-4">
              <h3 className="font-display text-xl text-gray-900">Canjear Cupón</h3>
              <p className="font-body text-gray-500 text-sm">
                Ingresa el código de 6 dígitos del cliente para canjear su cupón.
              </p>

              <BattleCard variant="default" className="bg-white">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Código de 6 dígitos..."
                      value={couponSearchCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setCouponSearchCode(val);
                        setFoundCoupon(null);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && searchCouponByCode()}
                      className="pl-10 font-mono text-xl tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <BattleButton
                    variant="primary"
                    onClick={searchCouponByCode}
                    disabled={couponSearchCode.length !== 6 || searchingCoupon}
                  >
                    {searchingCoupon ? "Buscando..." : "Buscar"}
                  </BattleButton>
                </div>

                {/* Found coupon result */}
                {foundCoupon && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-lg text-gray-900">
                          {(foundCoupon.coupon_templates as any)?.name || "Cupón"}
                        </p>
                        <p className="font-body text-gray-600 text-sm">
                          Cliente: {foundCoupon.profiles?.full_name || "Usuario"} • #{foundCoupon.profiles?.client_number}
                        </p>
                        <p className="font-body text-gray-500 text-sm mt-1">
                          {(foundCoupon.coupon_templates as any)?.discount_type === "percentage"
                            ? `${(foundCoupon.coupon_templates as any)?.discount_value}% descuento`
                            : (foundCoupon.coupon_templates as any)?.discount_type === "free_race"
                              ? `${(foundCoupon.coupon_templates as any)?.discount_value} carrera(s) gratis`
                              : `$${(foundCoupon.coupon_templates as any)?.discount_value || 0} descuento`}
                        </p>
                        {/* Source badge */}
                        <div className="mt-2">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                            (foundCoupon as any).source === "level_up" && "bg-orange-100 text-orange-700",
                            (foundCoupon as any).source === "points_redemption" && "bg-purple-100 text-purple-700",
                            (foundCoupon as any).source === "birthday" && "bg-pink-100 text-pink-700",
                            (foundCoupon as any).source === "auto_assign" && "bg-blue-100 text-blue-700",
                            (foundCoupon as any).source === "manual" && "bg-gray-100 text-gray-700"
                          )}>
                            {(foundCoupon as any).source === "level_up" && "🎉 Por subir de nivel"}
                            {(foundCoupon as any).source === "points_redemption" && "🎁 Canjeado con puntos"}
                            {(foundCoupon as any).source === "birthday" && "🎂 Cumpleaños"}
                            {(foundCoupon as any).source === "auto_assign" && "✨ Asignación automática"}
                            {(foundCoupon as any).source === "manual" && "🎟️ Asignado por staff"}
                          </span>
                        </div>
                        {(foundCoupon.coupon_templates as any)?.description && (
                          <p className="font-body text-gray-500 text-xs mt-1">
                            {(foundCoupon.coupon_templates as any).description}
                          </p>
                        )}
                        {foundCoupon.valid_until && (
                          <p className="font-body text-gray-400 text-xs mt-1">
                            Válido hasta: {formatDateShort(foundCoupon.valid_until)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <BattleButton
                        variant="primary"
                        className="flex-1"
                        onClick={redeemFoundCoupon}
                      >
                        ✓ Confirmar Canje
                      </BattleButton>
                      <BattleButton
                        variant="ghost"
                        onClick={() => {
                          setFoundCoupon(null);
                          setCouponSearchCode("");
                        }}
                      >
                        Cancelar
                      </BattleButton>
                    </div>
                  </div>
                )}
              </BattleCard>
            </div>

            {/* User Coupons with Codes */}
            <div className="space-y-4">
              <h3 className="font-display text-xl text-gray-900">Cupones de Clientes</h3>
              <p className="font-body text-gray-500 text-sm">
                Lista de todos los cupones activos. También puedes canjear desde aquí.
              </p>

              {userCoupons.length === 0 ? (
                <BattleCard variant="default" className="bg-white text-center py-8">
                  <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="font-display text-gray-500">No hay cupones activos</p>
                </BattleCard>
              ) : (
                <div className="space-y-2">
                  {userCoupons.map((coupon) => {
                    const getSourceLabel = (source: string) => {
                      switch (source) {
                        case "level_up": return { label: "🎉 Nivel", bg: "bg-orange-100", text: "text-orange-700" };
                        case "points_redemption": return { label: "🎁 Puntos", bg: "bg-purple-100", text: "text-purple-700" };
                        case "birthday": return { label: "🎂 Cumple", bg: "bg-pink-100", text: "text-pink-700" };
                        case "auto_assign": return { label: "✨ Auto", bg: "bg-blue-100", text: "text-blue-700" };
                        default: return { label: "🎟️ Manual", bg: "bg-gray-100", text: "text-gray-700" };
                      }
                    };
                    const sourceInfo = getSourceLabel(coupon.source);

                    return (
                      <BattleCard key={coupon.id} variant="default" className="bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                              <Ticket className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-display text-gray-900 truncate">
                                  {coupon.coupon_templates?.name || "Cupón"}
                                </p>
                                <span className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                  sourceInfo.bg, sourceInfo.text
                                )}>
                                  {sourceInfo.label}
                                </span>
                              </div>
                              <p className="font-body text-gray-500 text-sm">
                                {coupon.profiles?.full_name || "Usuario"} • #{coupon.profiles?.client_number}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* 6-digit code */}
                            <button
                              onClick={() => copyCode(coupon.code)}
                              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-mono text-lg font-bold text-gray-900 transition-colors"
                            >
                              {coupon.code}
                              {copiedCode === coupon.code ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => sendCouponViaWhatsApp(coupon.id)}
                              disabled={sendingWhatsApp === coupon.id}
                              className="w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors disabled:opacity-50"
                              title="Enviar por WhatsApp"
                            >
                              {sendingWhatsApp === coupon.id ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <MessageCircle className="w-5 h-5 text-green-600" />
                              )}
                            </button>
                            <BattleButton
                              variant="primary"
                              size="sm"
                              onClick={() => redeemCoupon(coupon.id)}
                            >
                              Canjear
                            </BattleButton>
                          </div>
                        </div>
                      </BattleCard>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "carreras" && (
          <div className="space-y-4">
            <h3 className="font-display text-xl text-gray-900">Gestionar Carreras</h3>
            <p className="font-body text-gray-500 text-sm">
              Busca un cliente para agregar{isAdmin ? " o eliminar" : ""} carreras
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, teléfono o # cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Client List for Race Registration */}
            <div className="space-y-3">
              {filteredClients.slice(0, 10).map((client) => (
                <BattleCard
                  key={client.id}
                  variant="default"
                  className="bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-gray-900 truncate">{getClientDisplayName(client)}</p>
                        <p className="font-body text-gray-500 text-sm">
                          #{client.client_number} • {client.total_races} carreras • {client.levels?.name || "Básico"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      {isAdmin && (
                        <button
                          onClick={() => removeRaceFromClient(client.id)}
                          disabled={client.total_races <= 0}
                          className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-5 h-5 text-red-600" />
                        </button>
                      )}
                      <span className="font-display text-xl w-12 text-center text-gray-900">
                        {client.total_races}
                      </span>
                      <button
                        onClick={() => addRaceToClient(client.id)}
                        className="w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-5 h-5 text-green-600" />
                      </button>
                    </div>
                  </div>
                </BattleCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === "puntos" && (
          <PointsModule isAdmin={isAdmin} />
        )}

        {activeTab === "historial" && isAdmin && (
          <div className="space-y-4">
            {/* History Sub-tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
              <button
                onClick={() => setHistoryTab("carreras")}
                className={cn(
                  "px-4 py-2 rounded-lg font-display text-sm transition-colors",
                  historyTab === "carreras"
                    ? "bg-battlekart-red text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Flag className="w-4 h-4 inline mr-2" />
                Carreras
              </button>
              <button
                onClick={() => setHistoryTab("cupones")}
                className={cn(
                  "px-4 py-2 rounded-lg font-display text-sm transition-colors",
                  historyTab === "cupones"
                    ? "bg-battlekart-red text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Ticket className="w-4 h-4 inline mr-2" />
                Cupones
              </button>
            </div>

            {/* Carreras History */}
            {historyTab === "carreras" && (
              <>
                <h3 className="font-display text-xl text-gray-900">Historial de Carreras</h3>
                <p className="font-body text-gray-500 text-sm">
                  Registro de carreras agregadas y eliminadas (últimas 50)
                </p>

                {raceLogs.length === 0 ? (
                  <BattleCard variant="default" className="bg-white text-center py-8">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-display text-gray-500">No hay registros de carreras</p>
                  </BattleCard>
                ) : (
                  <div className="space-y-2">
                    {raceLogs.map((log) => (
                      <BattleCard
                        key={log.id}
                        variant="default"
                        className="bg-white"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                              log.type === "added" ? "bg-green-100" : "bg-red-100"
                            )}>
                              {log.type === "added" ? (
                                <Plus className="w-5 h-5 text-green-600" />
                              ) : (
                                <Minus className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-display text-gray-900 truncate">
                                {log.client_name}
                              </p>
                              <p className="font-body text-gray-500 text-sm">
                                {log.type === "added" ? "Registrada" : "Eliminada"} por:{" "}
                                <span className={cn(
                                  "font-semibold",
                                  log.type === "added" ? "text-battlekart-orange" : "text-red-500"
                                )}>
                                  {log.staff_name || "Sistema"}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge variant={log.type === "added" ? "nuevo" : "basico"}>
                              {log.type === "added" ? "Agregada" : "Eliminada"}
                            </Badge>
                            <p className="font-body text-gray-400 text-xs mt-1">
                              {new Date(log.created_at).toLocaleDateString("es-MX", {
                                day: "2-digit",
                                month: "short",
                              })}{" "}
                              {new Date(log.created_at).toLocaleTimeString("es-MX", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </BattleCard>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Cupones History */}
            {historyTab === "cupones" && (
              <>
                <h3 className="font-display text-xl text-gray-900">Historial de Cupones</h3>
                <p className="font-body text-gray-500 text-sm">
                  Estadísticas y canjes de tus cupones
                </p>

                {/* Coupon Stats Cards */}
                {couponStats.length === 0 ? (
                  <BattleCard variant="default" className="bg-white text-center py-8">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-display text-gray-500">No hay plantillas de cupones</p>
                  </BattleCard>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-display text-lg text-gray-800">📊 Estadísticas por Cupón</h4>
                    <div className="grid gap-3">
                      {couponStats.map((stat) => (
                        <BattleCard key={stat.template_id} variant="default" className="bg-white">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Ticket className="w-6 h-6 text-purple-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-display text-gray-900 truncate">{stat.template_name}</p>
                                <p className="font-body text-gray-500 text-sm">
                                  {stat.discount_type === "percentage"
                                    ? `${stat.discount_value}% descuento`
                                    : stat.discount_type === "free_race"
                                      ? `${stat.discount_value} carrera(s) gratis`
                                      : `$${stat.discount_value} descuento`}
                                  {stat.level_name && ` • ${stat.level_name}`}
                                </p>
                                {stat.valid_until && (
                                  <p className="font-body text-gray-400 text-xs">
                                    Válido hasta: {formatDateShort(stat.valid_until)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <p className="font-display text-lg text-blue-600">{stat.total_issued}</p>
                                <p className="font-body text-gray-500 text-xs">Emitidos</p>
                              </div>
                              <div className="p-2 bg-green-50 rounded-lg">
                                <p className="font-display text-lg text-green-600">{stat.total_redeemed}</p>
                                <p className="font-body text-gray-500 text-xs">Canjeados</p>
                              </div>
                              <div className="p-2 bg-orange-50 rounded-lg">
                                <p className="font-display text-lg text-orange-600">{stat.total_active}</p>
                                <p className="font-body text-gray-500 text-xs">Activos</p>
                              </div>
                              <div className="p-2 bg-red-50 rounded-lg">
                                <p className="font-display text-lg text-red-600">{stat.total_expired}</p>
                                <p className="font-body text-gray-500 text-xs">Expirados</p>
                              </div>
                            </div>
                          </div>
                        </BattleCard>
                      ))}
                    </div>

                    {/* Recent Redemptions */}
                    <h4 className="font-display text-lg text-gray-800 mt-6">🎟️ Últimos Canjes</h4>
                    {couponRedemptions.length === 0 ? (
                      <BattleCard variant="default" className="bg-white text-center py-6">
                        <p className="font-body text-gray-500">No hay canjes registrados</p>
                      </BattleCard>
                    ) : (
                      <div className="space-y-2">
                        {couponRedemptions.map((redemption) => (
                          <BattleCard key={redemption.id} variant="default" className="bg-white">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <Check className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-display text-gray-900 truncate">
                                    {redemption.template_name}
                                  </p>
                                  <p className="font-body text-gray-500 text-sm">
                                    <span className="font-mono bg-gray-100 px-1 rounded">{redemption.code}</span>
                                    {" • "}
                                    Cliente: {redemption.user_name}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <Badge variant="nuevo">Canjeado</Badge>
                                <p className="font-body text-gray-400 text-xs mt-1">
                                  {new Date(redemption.used_at).toLocaleDateString("es-MX", {
                                    day: "2-digit",
                                    month: "short",
                                  })}{" "}
                                  {new Date(redemption.used_at).toLocaleTimeString("es-MX", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {redemption.staff_name && (
                                  <p className="font-body text-battlekart-orange text-xs">
                                    Por: {redemption.staff_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </BattleCard>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <BattleCard
            variant="default"
            className="bg-white w-full max-w-md max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-gray-900">Detalle Cliente</h3>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                ✕
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                <User className="w-10 h-10 text-gray-500" />
              </div>
              <h4 className="font-display text-xl text-gray-900">
                {getClientDisplayName(selectedClient)}
              </h4>
              <p className="font-body text-gray-500">Cliente #{selectedClient.client_number}</p>
            </div>

            {/* Client Info */}
            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{selectedClient.phone || "Sin teléfono"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Cake className="w-4 h-4 text-gray-400" />
                <span>{formatBirthDate(selectedClient.birth_date)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Hash className="w-4 h-4 text-gray-400" />
                <span>Cliente #{selectedClient.client_number}</span>
              </div>
            </div>

            {/* Membership */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="font-display text-gray-900">Membresía</p>
                </div>
                {loadingClientMembership ? (
                  <span className="font-body text-xs text-gray-400">Cargando…</span>
                ) : clientMembership?.status === "active" ? (
                  <Badge variant="nuevo">ACTIVA</Badge>
                ) : (
                  <Badge variant="default">INACTIVA</Badge>
                )}
              </div>

              {!loadingClientMembership && clientMembership?.status === "active" && (
                <p className="font-body text-sm text-gray-600">
                  Vence: {formatDateShort(clientMembership.end_date)}
                </p>
              )}

              <div className="mt-4">
                <BattleButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={activateMembershipForSelectedClient}
                  disabled={activatingMembership || clientMembership?.status === "active"}
                >
                  <Check className="w-5 h-5 mr-2" />
                  {clientMembership?.status === "active" ? "Membresía activa" : "Activar membresía (1 año)"}
                </BattleButton>
                <p className="font-body text-xs text-gray-400 mt-2">
                  Se usa después de confirmar el pago en caja. Al activar, se envía SMS al cliente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="font-display text-3xl text-battlekart-red">
                  {selectedClient.total_races}
                </p>
                <p className="font-body text-gray-500 text-sm">Carreras</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="font-display text-xl text-battlekart-orange">
                  {selectedClient.levels?.name || "Básico"}
                </p>
                <p className="font-body text-gray-500 text-sm">Nivel</p>
              </div>
            </div>

            {/* Race Controls */}
            <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              {isAdmin && (
                <button
                  onClick={() => removeRaceFromClient(selectedClient.id)}
                  disabled={selectedClient.total_races <= 0}
                  className="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-6 h-6 text-red-600" />
                </button>
              )}
              <span className="font-display text-3xl w-16 text-center text-gray-900">
                {selectedClient.total_races}
              </span>
              <button
                onClick={() => addRaceToClient(selectedClient.id)}
                className="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
              >
                <Plus className="w-6 h-6 text-green-600" />
              </button>
            </div>

            <BattleButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => addRaceToClient(selectedClient.id)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Registrar Carrera
            </BattleButton>
          </BattleCard>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
