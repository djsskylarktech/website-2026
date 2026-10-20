/**
 * The homepage flight.
 *
 * Scroll progress (0 → 1) drives one continuous flight. The aircraft follows a
 * 3D spline; the camera follows the aircraft. Content panels are anchored to
 * progress ranges along that path, alternating sides so the aircraft and the
 * panel compose against each other rather than overlapping.
 *
 * Tuning: the `at` values are the starting points from the brief. Adjust them
 * here — no component reads a hard-coded progress number.
 */

export type PanelSide = "left" | "right" | "center";

export interface FlightScene {
  id: string;
  /** Scroll progress where this scene is fully present. */
  at: number;
  /** How wide a band of scroll the panel stays legible for. */
  span: number;
  label: string;
  side: PanelSide;
  /** Panel weight: how much of the viewport it is allowed to take. */
  size: "sm" | "md" | "lg";
}

/**
 * Scene bands must not overlap, or two panels are legible at once and the text
 * collides. A panel is fully gone at `at ± span`, so for any neighbouring pair
 * `span[i] + span[i+1]` has to stay below the gap between their `at` values.
 * The spacing below leaves roughly a third of each gap as clear air.
 */
export const FLIGHT_SCENES: FlightScene[] = [
  { id: "start", at: 0, span: .055, label: "Start", side: "left", size: "md" },
  { id: "about", at: .375, span: .025, label: "About", side: "left", size: "lg" },
  { id: "achievements", at: .435, span: .025, label: "Achievements", side: "right", size: "lg" },
  { id: "fleet", at: .495, span: .025, label: "Aircraft", side: "left", size: "lg" },
  { id: "engineering", at: .555, span: .025, label: "Engineering", side: "right", size: "md" },
  { id: "flight-log", at: .615, span: .025, label: "Flight log", side: "left", size: "md" },
  { id: "team", at: .675, span: .025, label: "Team", side: "right", size: "md" },
  { id: "sponsors", at: .735, span: .025, label: "Partners", side: "left", size: "sm" },
  { id: "join", at: .795, span: .025, label: "Join", side: "right", size: "lg" },
];

// Vertical phases and section placement are sampled in lib/flight-route.ts.
export const CRUISE_ALTITUDE = 32;
export const TAKEOFF_START = 0.12;
export const CRUISE_START = 0.30;
export const LANDING_START = 0.83;
export const TOUCHDOWN_AT = 0.965;
export const ARRIVAL_RUNWAY_Z = -800;

/**
 * How far behind and above the aircraft the camera rides, by progress.
 * It starts close behind on the ground and eases back once airborne so the
 * aircraft reads as travelling away without shrinking to nothing.
 */
export const CAMERA_RIG = {
  // The aircraft is the protagonist: it recedes as it accelerates away, but it
  // must never shrink to a speck. These distances keep it reading as a solid
  // object at every phase.
  distance: { ground: 7.5, cruise: 10.5, landing: 9 },
  height: { ground: 1.5, cruise: 2.6, landing: 2 },
  /** How much the camera adopts the aircraft's bank. 0 = level, 1 = locked. */
  bankFollow: 0.35,
  /** Seconds of lag, so the camera trails rather than being welded on. */
  lag: 0.45,
};

/** Total scroll length of the homepage, in viewport heights. */
export const FLIGHT_SCROLL_VH = 1200;
