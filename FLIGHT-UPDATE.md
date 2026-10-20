# Scroll flight

Run `npm run dev` and open http://localhost:3000.

One shared scroll position drives the aircraft, camera, panels, propellers and cloud movement. There is no automatic flight. A short bounded scrub smooths input, settles when scrolling stops, and reverses without a separate camera or rotation timeline.

- 0–12%: aligned ground roll with gradually increasing forward speed.
- 12–30%: S-curve ascent, gentle rotation, early pitch recovery.
- 30–35%: stable cloud cruise before the first content panel.
- 35–82%: all eight content sections, opposite-side aircraft with restrained banking.
- 83–96.5%: alignment, gradual descent and flare.
- 96.5–100%: touchdown and decelerating rollout to a complete stop.

Forward position and velocity are continuous across phase boundaries. Vertical speed and acceleration settle at both ends of the climb/descent. Camera framing is deterministic and sizes the aircraft to the viewport; phones reserve the upper area for flight and the lower area for scrollable story panels.

The controls start collapsed. Arrow keys scroll forward/backward. The small advance button moves one scroll increment, and the end button returns to the beginning. Optional local engine/wind sound and story visibility remain available.

Google tiles remain disabled unless explicitly enabled in environment configuration. Existing generated airfield imagery stays local in `public/images/flight`.

Validation: `node tests/flight-route.cjs` covers stationary start, ground-roll distance, monotonic forward travel, continuous velocities, shallow pitch, content ordering, touchdown/stop, bounded scrub, deterministic reverse travel, and projected aircraft clearance at 390×844, 768×1024, 1366×768 and 1920×1080. TypeScript checking passes. Browser inspection verified the runway start, opposite-side section composition and final runway stop; no browser console errors were observed during that inspection.
