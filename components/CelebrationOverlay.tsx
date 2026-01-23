"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lottie from "lottie-react";
import celebrationAnimation from "@/public/celebration.json";
import type { LottieRefCurrentProps } from "lottie-react";

export default function CelebrationOverlay() {
  const pathname = usePathname();
  const [showText, setShowText] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fadeOutStart, setFadeOutStart] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 2000);
    const stopAnimTimer = setTimeout(() => {
      lottieRef.current?.pause?.();
    }, 5000);
    const fadeTimer = setTimeout(() => setFadeOutStart(true), 7000);
    const closeTimer = setTimeout(() => setVisible(false), 10000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(stopAnimTimer);
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  if (pathname !== "/") return null;
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        opacity: fadeOutStart ? 0 : 1,
        transition: "opacity 3s linear",
        backgroundColor: "rgba(0,0,0,0.85)",
        pointerEvents: fadeOutStart ? "none" : "auto",
      }}
    >
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <Lottie
          lottieRef={lottieRef}
          animationData={celebrationAnimation}
          loop
          className="w-full h-full object-contain"
        />
      </div>

      <div className="relative z-[10000] flex flex-col items-center justify-center text-center px-6 gap-10">
        <div className="min-h-[120px] flex items-center justify-center">
          <h1
            className={`text-yellow-300 text-4xl md:text-6xl font-extrabold drop-shadow-xl transition-all duration-700 ease-out transform ${
              showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            Bayan Medical — Celebrating 15 Years
          </h1>
        </div>

        
      </div>
    </div>
  );
}
