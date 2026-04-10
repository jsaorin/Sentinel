"use client";

import { useEffect, useRef, useState } from "react";

type SectionDividerProps = {
  height?: number;
};

export function SectionDivider({ height = 300 }: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      setProgress(1);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const ratio = entry.intersectionRatio;
          setProgress(Math.min(ratio * 3, 1));
        }
      },
      { threshold: Array.from({ length: 20 }, (_, i) => i / 19) },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="hidden md:flex justify-center" style={{ height }}>
      <div
        className="w-px"
        style={{
          height: "100%",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,1) 100%)",
          transform: `scaleY(${progress})`,
          transformOrigin: "top",
          transition: "transform 600ms ease-out",
        }}
      />
    </div>
  );
}
