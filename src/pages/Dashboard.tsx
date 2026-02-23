import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const { user, loading, rolesLoaded, isStaff, isAdmin, switchRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when dashboard mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Show loading while auth is loading OR while roles are still being fetched
  if (loading || !rolesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-battlekart-red to-battlekart-red/80">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isManagerMode = isStaff || isAdmin;

  const toggleRole = (checked: boolean) => {
    if (checked) {
      switchRole("admin");
    } else {
      switchRole("client");
    }
  };

  return (
    <>
      {/* Floating Demo Role Switcher */}
      <div className="fixed bottom-4 right-4 z-[100] bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl flex items-center gap-3">
        <div className="flex flex-col text-right">
          <span className="text-white font-display text-sm tracking-wide">Modo Demo</span>
          <span className="text-white/60 font-body text-xs">{isManagerMode ? "Administrador" : "Cliente"}</span>
        </div>
        <Switch
          id="demo-role-switch"
          checked={isManagerMode}
          onCheckedChange={toggleRole}
          className="data-[state=checked]:bg-battlekart-orange"
        />
        <Label htmlFor="demo-role-switch" className="sr-only">
          Cambiar de rol
        </Label>
      </div>

      {isManagerMode ? <AdminDashboard /> : <ClientDashboard />}
    </>
  );
};

export default Dashboard;
