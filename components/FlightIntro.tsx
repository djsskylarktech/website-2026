"use client";

import { useEffect, useRef } from "react";
import { flightState, onFlightFrame } from "@/lib/flight-store";
import { smootherstep } from "@/lib/flight-route";

/** The reference video's opening: a cabin window passes into open cloud. */
export function FlightIntro() {
  const root = useRef<HTMLDivElement>(null);
  const windowImage = useRef<HTMLDivElement>(null);
  const mist = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = (progress: number) => {
      const el = root.current;
      if (!el) return;
      const push = smootherstep(0.035, 0.245, progress);
      const mistIn = smootherstep(0.225, 0.30, progress);
      const reveal = smootherstep(0.30, 0.355, progress);
      el.style.opacity = String(1 - reveal);
      el.style.visibility = progress >= 0.355 ? "hidden" : "visible";
      if (windowImage.current) {
        windowImage.current.style.transform = `scale(${(1 + push * 2.85).toFixed(3)})`;
      }
      if (mist.current) {
        mist.current.style.opacity = String(mistIn);
      }
      if (caption.current) caption.current.style.opacity = String(1 - smootherstep(0.025, 0.095, progress));
    };
    update(flightState.progress);
    return onFlightFrame((state) => update(state.progress));
  }, []);

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-20 overflow-hidden bg-[#11151a]" aria-hidden="true">
      <div
        ref={windowImage}
        className="absolute inset-0 origin-center bg-cover bg-center will-change-transform"
        style={{ backgroundImage: "url('/images/intro/cabin-window.png')" }}
      />
      {/* A brief cloud-white veil hides the handoff to WebGL. No second cloud
          photograph is swapped in, so the texture never jumps mid-scroll. */}
      <div ref={mist} className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,#fff_0%,#f1f6f9_55%,#d7e6f0_100%)] opacity-0" />
      <div ref={caption} className="absolute inset-x-0 bottom-[8vh] flex flex-col items-center gap-3 text-center text-white drop-shadow-lg">
        <span className="font-mono text-[10px] uppercase tracking-[0.38em] text-white/75">DJS Skylark · Mumbai</span>
        <span className="text-xl font-light tracking-[0.05em] sm:text-2xl">A different perspective begins here.</span>
        <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">Scroll to fly ↓</span>
      </div>
    </div>
  );
}
