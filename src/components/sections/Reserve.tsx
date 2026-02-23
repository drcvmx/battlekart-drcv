import { Phone, MessageCircle, CreditCard, Lock, Calendar, Zap } from "lucide-react";
import { BattleButton } from "@/components/ui/BattleButton";
import floatingRocket from "@/assets/floating-rocket-reserve.png";
import floatingNitro from "@/assets/floating-nitro-reserve.png";

const Reserve = () => {
  return (
    <section 
      id="reserve" 
      className="relative py-12 md:py-20 px-4 overflow-hidden"
    >
      {/* Background Layer - Mobile (vertical sticker-bomb) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/images/bg-sticker-mobile.jpeg')" }}
      />
      
      {/* Background Layer - Desktop (horizontal sticker-bomb) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
        style={{ backgroundImage: "url('/images/bg-sticker-desktop.jpeg')" }}
      />
      
      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Floating Decorative Assets */}
      <img
        src={floatingRocket}
        alt=""
        aria-hidden="true"
        className="absolute top-32 right-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 lg:top-24 lg:right-[18%] z-50 pointer-events-none animate-levitate"
      />
      <img
        src={floatingNitro}
        alt=""
        aria-hidden="true"
        className="absolute bottom-32 left-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 lg:bottom-24 lg:left-[18%] z-50 pointer-events-none animate-levitate-delayed"
      />
      <div className="container mx-auto max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl text-white mb-3">
            ¡Reserva Ahora!
          </h2>
          <p className="font-body text-white/80 text-base">
            Elige tu forma preferida de reservar
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-6">
          {/* Phone */}
          <a href="tel:+1234567890" className="block">
            <BattleButton
              variant="phone"
              size="lg"
              className="w-full justify-center"
            >
              <Phone className="w-6 h-6" />
              <span>Llamar y Reservar</span>
            </BattleButton>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/1234567890?text=Hola,%20quiero%20reservar"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <BattleButton
              variant="whatsapp"
              size="lg"
              className="w-full justify-center"
            >
              <MessageCircle className="w-6 h-6" />
              <span>Pagar por WhatsApp</span>
            </BattleButton>
          </a>

          {/* Online Payment */}
          <a href="/pagar-online" className="block">
            <BattleButton
              variant="online"
              size="lg"
              className="w-full justify-center"
            >
              <CreditCard className="w-6 h-6" />
              <span>Pagar en Línea</span>
            </BattleButton>
          </a>
        </div>

        {/* Info */}
        <div className="mt-10 flex flex-col items-center gap-3 text-white/90 text-sm font-body">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Pago seguro y encriptado</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Cancela gratis hasta 24h antes</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Confirmación instantánea</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Reserve };
