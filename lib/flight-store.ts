/**
 * Flight progress, shared between the 3D scene and the HTML panels.
 *
 * Scroll fires far more often than React should re-render. Progress therefore
 * lives in a plain mutable object: Lenis writes it, `useFrame` and the panel
 * layer read it each frame, and nothing re-renders as a result. Components that
 * genuinely need to re-render (the nav changing state, say) subscribe and are
 * notified only when a coarse milestone changes.
 */

export interface FlightState {
  /** 0 → 1 across the whole homepage flight. */
  progress: number;
  altitude: number;
  cityStatus: "loading" | "ready" | "unavailable";
  cityCredits: string;
  /** Scroll velocity, used to add a little aerodynamic lead to the camera. */
  velocity: number;
  /** True once the 3D scene has taken over from the loading state. */
  ready: boolean;
  /** Set when the device or the user's settings rule out the full sequence. */
  reducedMotion: boolean;
}

export const flightState: FlightState = {
  progress: 0,
  altitude: 0,
  cityStatus: "loading",
  cityCredits: "",
  velocity: 0,
  ready: false,
  reducedMotion: false,
};

/**
 * The active Lenis instance.
 *
 * Lenis takes ownership of the scroll position and rewrites it every frame, so
 * `window.scrollTo` is silently undone. Anything that needs to move the page —
 * an anchor, the skip link, a "back to top" — must go through here.
 */
interface ScrollController {
  scrollTo(target: number | string | HTMLElement, options?: Record<string, unknown>): void;
}

let controller: ScrollController | null = null;

export function setLenis(instance: ScrollController | null): void {
  controller = instance;
  if (typeof window !== "undefined") {
    // Also handy when inspecting the page directly.
    (window as Window & { __skylarkScroll?: ScrollController | null }).__skylarkScroll = instance;
  }
}

/** Scroll the page. Falls back to native scrolling when Lenis is not running. */
export function scrollTo(target: number | string | HTMLElement, options?: Record<string, unknown>): void {
  if (controller) return controller.scrollTo(target, options);
  if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
}

type Listener = (state: FlightState) => void;
const listeners = new Set<Listener>();

/** Subscribe to coarse changes. Returns an unsubscribe function. */
export function subscribeFlight(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notifyFlight(): void {
  for (const fn of listeners) fn(flightState);
}

/**
 * Per-frame subscribers.
 *
 * Panels animate by writing their own inline styles from here rather than by
 * holding React state, so a scroll moves the whole page without a single
 * re-render. One rAF loop (in FlightScroll) drives them all.
 */
type FrameListener = (state: FlightState) => void;
const frameListeners = new Set<FrameListener>();

export function onFlightFrame(fn: FrameListener): () => void {
  frameListeners.add(fn);
  return () => frameListeners.delete(fn);
}

export function tickFlight(): void {
  for (const fn of frameListeners) fn(flightState);
}

/** Linear interpolation, clamped. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

/** Smooth 0→1 ramp across [edge0, edge1]. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * How present a scene is at the current progress: 0 outside its band, rising to
 * 1 at its centre. Panels use this for opacity and offset so they arrive and
 * leave with the aircraft rather than snapping.
 */
export function scenePresence(progress: number, at: number, span: number): number {
  const d = Math.abs(progress - at);
  if (d > span) return 0;
  return smoothstep(span, span * 0.35, d);
}
