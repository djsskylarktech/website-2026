"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { flightState, notifyFlight, setLenis, tickFlight } from "@/lib/flight-store";
import { sampleAltitude, scrubProgress } from "@/lib/flight-route";

export function FlightScroll({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    flightState.reducedMotion = !enabled;
    if (!enabled) { notifyFlight(); return; }
    // Native wheel/touch sets the target; only the shared visual timeline scrubs.
    const lenis = new Lenis({ anchors: true, smoothWheel: false, duration: .45 });
    setLenis(lenis);
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    lenis.scrollTo(0, { immediate: true });
    flightState.progress = 0;
    // Browsers can restore scroll after hydration. Keep the runway start until
    // an actual input, rather than interpreting restoration as a takeoff.
    let interacted = false;
    const begin = () => { interacted = true; };
    const keys = (event: KeyboardEvent) => { if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) begin(); };
    window.addEventListener("wheel", begin, { passive: true });
    window.addEventListener("touchmove", begin, { passive: true });
    window.addEventListener("pointerdown", begin, { passive: true });
    window.addEventListener("keydown", keys);
    let frame = 0, previousTime = 0, milestone = -1;
    const tick = (time: number) => {
      const dt = previousTime ? (time-previousTime)/1000 : 0;
      previousTime = time;
      lenis.raf(time);
      if (!interacted && window.scrollY !== 0) lenis.scrollTo(0, { immediate: true });
      const range = Math.max(1, document.documentElement.scrollHeight-window.innerHeight);
      const target = Math.max(0, Math.min(1, window.scrollY/range));
      const before = flightState.progress;
      flightState.progress = scrubProgress(before, target, dt);
      flightState.velocity = dt ? (flightState.progress-before)/dt : 0;
      flightState.altitude = sampleAltitude(flightState.progress);
      document.documentElement.style.setProperty("--flight-progress", String(flightState.progress));
      tickFlight();
      const next = Math.floor(flightState.progress*100);
      if (next !== milestone) { milestone = next; notifyFlight(); }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame); lenis.destroy(); setLenis(null);
      window.removeEventListener("wheel", begin);
      window.removeEventListener("touchmove", begin);
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("keydown", keys);
      history.scrollRestoration = previousRestoration;
      document.documentElement.style.removeProperty("--flight-progress");
    };
  }, [enabled]);
  return null;
}
