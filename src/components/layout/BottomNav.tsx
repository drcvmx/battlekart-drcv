import { cn } from "@/lib/utils";
import iconCancun from "@/assets/icons/icon-cancun.png";
import iconRocket from "@/assets/icons/icon-rocket.png";
import iconHourglass from "@/assets/icons/icon-hourglass.png";
import iconClipboard from "@/assets/icons/icon-clipboard.png";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active, badge, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors duration-300 min-w-[72px] relative",
      active
        ? "text-battlekart-red bg-battlekart-red/10"
        : "text-muted-foreground hover:text-battlekart-red"
    )}
  >
    <div className="relative">
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-2 w-4 h-4 bg-battlekart-red text-white text-[10px] font-display rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
    <span className="text-xs font-display uppercase">{label}</span>
  </button>
);

interface NavLinkItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

const NavLinkItem = ({ icon, label, to }: NavLinkItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors duration-300 min-w-[72px] relative",
      "text-muted-foreground hover:text-battlekart-red"
    )}
  >
    <div className="relative">
      {icon}
    </div>
    <span className="text-xs font-display uppercase">{label}</span>
  </Link>
);

interface BottomNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  couponCount?: number;
}

const BottomNav = ({ activeSection, onSectionChange, couponCount = 6 }: BottomNavProps) => {
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center py-3 px-2 max-w-lg mx-auto safe-area-pb">
        <NavItem
          icon={<img src={iconCancun} alt="Membresía" className="w-9 h-9 object-contain scale-[2]" />}
          label="Membresía"
          active={activeSection === "home"}
          onClick={() => onSectionChange("home")}
        />
        <NavItem
          icon={<img src={iconRocket} alt="Tu Nivel" className="w-9 h-9 object-contain" />}
          label="Tu Nivel"
          active={activeSection === "level"}
          onClick={() => onSectionChange("level")}
        />
        <NavItem
          icon={<img src={iconHourglass} alt="Cupones" className="w-9 h-9 object-contain" />}
          label="Cupones"
          active={activeSection === "coupons"}
          badge={couponCount}
          onClick={() => onSectionChange("coupons")}
        />
        <NavLinkItem
          icon={<img src={iconClipboard} alt="Mi Cuenta" className="w-9 h-9 object-contain" />}
          label={user ? "Mi Cuenta" : "Entrar"}
          to={user ? "/dashboard" : "/login"}
        />
      </div>
    </nav>
  );
};

export { BottomNav };
