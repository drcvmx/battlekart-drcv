import { useEffect, useRef, useState, useCallback } from 'react';

interface ParallaxConfig {
  speed: number; // Multiplier for scroll speed (1 = normal, <1 = slower, >1 = faster)
  mobileSpeedMultiplier?: number; // Reduce effect on mobile (default 0.5)
}

interface ParallaxElement {
  ref: React.RefObject<HTMLElement>;
  config: ParallaxConfig;
}

export const useParallax = () => {
  const [isInView, setIsInView] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<Map<string, ParallaxElement>>(new Map());

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const registerElement = useCallback((id: string, ref: React.RefObject<HTMLElement>, config: ParallaxConfig) => {
    elementsRef.current.set(id, { ref, config });
  }, []);

  const getTransform = useCallback((speed: number, mobileMultiplier = 0.5): string => {
    if (!isInView) return 'translateY(0px)';
    
    const effectiveSpeed = isMobile ? speed * mobileMultiplier : speed;
    const offset = scrollY * effectiveSpeed;
    
    return `translateY(${offset}px)`;
  }, [isInView, scrollY, isMobile]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Intersection Observer to detect when section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      {
        threshold: 0,
        rootMargin: '0px',
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress relative to container
      // When container top is at viewport bottom: progress = 0
      // When container top is at viewport top: progress = 1
      const progress = 1 - (rect.top / viewportHeight);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      
      // Convert to offset value (negative = move up, positive = move down)
      setScrollY((clampedProgress - 0.5) * 200); // Range: -100 to +100
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isInView]);

  return {
    containerRef,
    isInView,
    getTransform,
    registerElement,
    scrollY,
  };
};
