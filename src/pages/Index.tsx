import { useState, useEffect } from "react";
import { Home } from "@/components/sections/Home";
import { UserLevel } from "@/components/sections/UserLevel";
import { Coupons } from "@/components/sections/Coupons";
import { Reserve } from "@/components/sections/Reserve";
import { BottomNav } from "@/components/layout/BottomNav";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "level", "coupons", "reserve"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen pb-bottom-nav overflow-x-hidden">
      <Home />
      <UserLevel />
      <Coupons />
      <Reserve />
      <BottomNav
        activeSection={activeSection}
        onSectionChange={scrollToSection}
        couponCount={6}
      />
    </div>
  );
};

export default Index;
