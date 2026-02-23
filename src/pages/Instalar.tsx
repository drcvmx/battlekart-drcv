import { BattleButton } from "@/components/ui/BattleButton";
import { BattleCard } from "@/components/ui/BattleCard";
import { Download, Smartphone, Clock, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo-battlekart.png";

const Instalar = () => {
  const handleDownloadAPK = () => {
    window.open("/downloads/BattleKart.apk", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <img 
            src={logo} 
            alt="BattleKart" 
            className="h-16 mx-auto"
          />
          <h1 className="text-2xl font-bold text-foreground">
            Descarga la App
          </h1>
          <p className="text-muted-foreground">
            Instala BattleKart Club en tu dispositivo
          </p>
        </div>

        {/* Android APK - Ready */}
        <BattleCard className="p-6 space-y-4 border-green-500/30 bg-green-500/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <Smartphone className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">
                  Android
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Disponible
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Descarga el archivo APK e instálalo
              </p>
            </div>
          </div>

          <BattleButton 
            onClick={handleDownloadAPK}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Descargar APK
          </BattleButton>

          <div className="space-y-2 pt-2 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground">
              Instrucciones de instalación:
            </p>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span>Descarga el archivo APK</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Abre el archivo descargado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span>Permite la instalación de fuentes desconocidas si te lo pide</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-[10px] font-bold">
                  4
                </span>
                <span>¡Listo! Abre la app desde tu pantalla de inicio</span>
              </li>
            </ol>
          </div>
        </BattleCard>

        {/* iOS IPA - Coming Soon */}
        <BattleCard className="p-6 space-y-4 border-orange-500/30 bg-orange-500/5 opacity-80">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <Smartphone className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">
                  iOS (iPhone/iPad)
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 text-xs font-medium">
                  <Clock className="h-3 w-3" />
                  Próximamente
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Estamos trabajando en la versión para iOS
              </p>
            </div>
          </div>

          <BattleButton 
            disabled
            className="w-full bg-muted text-muted-foreground cursor-not-allowed"
            size="lg"
          >
            <Clock className="mr-2 h-5 w-5" />
            En desarrollo
          </BattleButton>

          <p className="text-xs text-muted-foreground text-center">
            La versión para iPhone y iPad estará disponible pronto. 
            Te notificaremos cuando esté lista.
          </p>
        </BattleCard>

        {/* Benefits */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground text-center">
            Beneficios de la app nativa
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <span className="text-2xl">⚡</span>
              <p className="text-xs text-muted-foreground mt-1">Más rápida</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <span className="text-2xl">🔔</span>
              <p className="text-xs text-muted-foreground mt-1">Notificaciones</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <span className="text-2xl">🎁</span>
              <p className="text-xs text-muted-foreground mt-1">Cupones exclusivos</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <span className="text-2xl">🎮</span>
              <p className="text-xs text-muted-foreground mt-1">Mejor experiencia</p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <a 
            href="/" 
            className="text-sm text-primary hover:underline"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default Instalar;
