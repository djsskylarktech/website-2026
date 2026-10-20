import { ARRIVAL_RUNWAY_Z, CRUISE_ALTITUDE, CRUISE_START, FLIGHT_SCENES, LANDING_START, TAKEOFF_START, TOUCHDOWN_AT } from "@/data/flight";
import { lerp } from "./flight-store";

export function smootherstep(a: number, b: number, value: number): number {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t*t*t*(t*(t*6-15)+10);
}
const lateralStops = [
  { at: CRUISE_START + .025, x: 0 },
  ...FLIGHT_SCENES.filter(s => s.id !== "start").map(s => ({ at: s.at, x: s.side === "left" ? 4 : -4 })),
  { at: LANDING_START + .025, x: 0 },
];
export function sampleLateral(t: number): number {
  if (t < lateralStops[0].at) return 0;
  for (let i = 1; i < lateralStops.length; i++) {
    const a = lateralStops[i-1], b = lateralStops[i];
    if (t <= b.at) return lerp(a.x, b.x, smootherstep(a.at + .009, b.at - .009, t));
  }
  return 0;
}
export function sampleAltitude(t: number): number {
  return CRUISE_ALTITUDE * smootherstep(TAKEOFF_START, CRUISE_START, t)
    * (1 - smootherstep(LANDING_START, TOUCHDOWN_AT, t));
}
// Cubic Hermite distance: position AND speed agree at every phase boundary.
const travel = [
  { t: 0, z: 6, speed: 0 }, { t: TAKEOFF_START, z: -75, speed: -900 },
  { t: CRUISE_START, z: -240, speed: -450 }, { t: LANDING_START, z: -410, speed: -450 },
  { t: TOUCHDOWN_AT, z: ARRIVAL_RUNWAY_Z - 10, speed: -1800 },
  { t: 1, z: ARRIVAL_RUNWAY_Z - 60, speed: 0 },
];
export function sampleForward(t: number): number {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < travel.length; i++) {
    const a = travel[i-1], b = travel[i];
    if (t <= b.t) {
      const d = b.t-a.t, u = (t-a.t)/d;
      return (2*u*u*u-3*u*u+1)*a.z + (u*u*u-2*u*u+u)*d*a.speed
        + (-2*u*u*u+3*u*u)*b.z + (u*u*u-u*u)*d*b.speed;
    }
  }
  return travel[travel.length-1].z;
}
export function sampleFlightPosition(t: number, target: {x: number; y: number; z: number}): void {
  target.x = sampleLateral(t); target.y = sampleAltitude(t); target.z = sampleForward(t);
}
export function samplePitch(t: number): number {
  const rotation = smootherstep(TAKEOFF_START, TAKEOFF_START+.03,t) * (1-smootherstep(.18,.27,t));
  const approach = smootherstep(LANDING_START,.88,t) * (1-smootherstep(.925,.96,t));
  const flare = smootherstep(.945,TOUCHDOWN_AT,t) * (1-smootherstep(TOUCHDOWN_AT,.99,t));
  return rotation*.065 - approach*.035 + flare*.025;
}
export function sampleFraming(t: number): number {
  return t < CRUISE_START ? 1-smootherstep(.025,.08,t) : sampleLateral(t)/4;
}
export function departureVisibility(t: number): number { return 1-smootherstep(.19,.29,t); }
export function arrivalVisibility(t: number): number { return smootherstep(LANDING_START,.91,t); }

/** Bounded scrub: no autonomous progress or accumulated velocity after input. */
export function scrubProgress(current: number, target: number, dt: number): number {
  const frame = Math.min(dt,.05);
  const step = (target-current)*(1-Math.exp(-14*frame));
  const next = current + Math.max(-.75*frame, Math.min(.75*frame, step));
  return Math.abs(target-next) < .00001 ? target : next;
}
