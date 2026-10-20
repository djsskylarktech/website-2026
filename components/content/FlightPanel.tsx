"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { FLIGHT_SCENES } from "@/data/flight";
import { flightState, onFlightFrame, scenePresence } from "@/lib/flight-store";

/**
 * A content window placed in the flight environment.
 *
 * Panels are HTML, positioned over the 3D scene and tied to a point in the
 * flight. They are deliberately not cards: square corners, asymmetric
 * placement, varying widths, and a single orange rule marking the leading edge.
 *
 * Motion is written directly to the element each frame. The panel rises and
 * fades as the aircraft reaches its point on the path, and leaves the same way,
 * so content arrives *with* the flight rather than scrolling past it.
 */

export interface FlightPanelProps {
  /** Must match an id in FLIGHT_SCENES. */
  scene: string;
  children: ReactNode;
  /** Optional override of the side defined in the flight data. */
  side?: "left" | "right" | "center";
  className?: string;
}

// Panels take at most a little under half the viewport, so the aircraft always
// has clear air on the opposite side. A panel that spans the full width is what
// makes the 3D scene look like a background image rather than the same space.
const SIZE_CLASS = {
  sm: "max-w-[min(26rem,42vw)]",
  md: "max-w-[min(32rem,45vw)]",
  lg: "max-w-[min(38rem,48vw)]",
} as const;

const SIDE_CLASS = {
  left: "mr-auto ml-[5vw] lg:ml-[7vw] items-start text-left",
  right: "ml-auto mr-[5vw] lg:mr-[7vw] items-start text-left",
  center: "mx-auto items-start text-left",
} as const;

export function FlightPanel({ scene, children, side, className = "" }: FlightPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const config = FLIGHT_SCENES.find((s) => s.id === scene);

  useEffect(() => {
    const el = ref.current;
    if (!el || !config) return;

    // Without the flight loop (reduced motion / static tier) the panel is
    // simply present. It must never be stuck invisible waiting for a frame.
    if (flightState.reducedMotion) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    return onFlightFrame((state) => {
      const presence = scenePresence(state.progress, config.at, config.span);

      el.style.opacity = presence.toFixed(3);
      // Panels drift against the direction of travel as they leave, which
      // reads as the viewer passing them rather than them fading out.
      const drift = (1 - presence) * (state.progress > config.at ? -28 : 28);
      el.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0)`;
      // Below a threshold the panel should not intercept clicks or be read by
      // a screen reader while it is effectively not on screen.
      el.style.pointerEvents = presence > 0.5 ? "auto" : "none";
      el.inert = presence <= 0.5;
      el.setAttribute("aria-hidden", presence > 0.15 ? "false" : "true");
    });
  }, [config]);

  if (!config) {
    // A panel pointing at a scene that does not exist is an authoring mistake;
    // failing loudly in development beats rendering nothing in production.
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`FlightPanel: no scene "${scene}" in FLIGHT_SCENES`);
    }
    return null;
  }

  const resolvedSide = side ?? config.side;

  return (
    // Outer element owns position: every panel occupies the same space and is
    // revealed by presence, so they must stack rather than flow. The top inset
    // clears the fixed navbar so a tall panel never runs under it.
    <div
      className="flight-panel-slot pointer-events-none absolute inset-x-0 bottom-0 flex items-center"
      style={{ top: "var(--nav-h)" }}
      data-scene={scene}
    >
      <div
        ref={ref}
        aria-hidden={config.id !== "start"}
        inert={config.id !== "start"}
        className={`flight-panel scrim ${resolvedSide === "right" ? "scrim-right" : ""} pointer-events-none relative flex w-full flex-col ${SIDE_CLASS[resolvedSide]} ${SIZE_CLASS[config.size]} ${className}`}
        style={{ opacity: 0 }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The fixed layer panels live in. One per homepage; panels inside it are
 * centred vertically and positioned horizontally by their own side setting.
 */
export function FlightPanelLayer({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
