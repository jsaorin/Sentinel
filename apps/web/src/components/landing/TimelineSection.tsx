"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type TimelineSectionProps = {
  children: ReactNode;
};

export function TimelineSection({ children }: TimelineSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      setOpacity(1);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay: nothing until 25% visible, then ramp to full by 70%
          const ratio = entry.intersectionRatio;
          const progress = ratio < 0.25 ? 0 : Math.min((ratio - 0.25) / 0.45, 1);
          setOpacity(progress);
        }
      },
      { threshold: Array.from({ length: 20 }, (_, i) => i / 19) },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transform: `translateY(${(1 - opacity) * 20}px)`,
        transition: "opacity 300ms ease-out, transform 300ms ease-out",
      }}
    >
      {children}
    </div>
  );
}
