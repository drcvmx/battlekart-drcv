import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BattleButton } from "@/components/ui/BattleButton";
import { BattleCard } from "@/components/ui/BattleCard";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@/assets/logo-battlekart.png";
import { ArrowLeft } from "lucide-react";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Scroll to top when page mounts
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn();

    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Bienvenido a la Demo!",
        description: "Has ingresado correctamente",
      });
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg-red.png')" }}
    >
      <div className="w-full max-w-md">
        {/* Back button - using Link for better navigation */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-body">Volver al inicio</span>
        </Link>

        <BattleCard variant="coupon" className="bg-black/30 backdrop-blur-sm border-white/10">
          {/* Logo */}
          <div className="text-center mb-6">
            <img
              src={logoImage}
              alt="Battle Kart"
              className="h-20 mx-auto mb-4"
            />
            <h1 className="font-display text-2xl text-white">Demo Interactiva</h1>
            <p className="font-body text-white/60 text-sm mt-1">
              Explora el sistema sin necesidad de credenciales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-4">
              <p className="text-white/80 text-center text-sm font-body px-4">
                Al ingresar podrás ver la funcionalidad del sistema con datos de prueba, probando ambos tableros de control (Administrador y Cliente).
              </p>
            </div>

            <BattleButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-lg h-14"
              disabled={loading}
            >
              {loading ? "Iniciando..." : "Entrar al Demo"}
            </BattleButton>
          </form>

        </BattleCard>
      </div>
    </div>
  );
};

export default Login;
