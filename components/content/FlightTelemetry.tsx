"use client";

import { useEffect, useRef, useState } from "react";
import { LANDING_START, TOUCHDOWN_AT } from "@/data/flight";
import { flightState, onFlightFrame, scrollTo } from "@/lib/flight-store";

export function FlightTelemetry({ showStory, onToggleStory }: { showStory: boolean; onToggleStory: () => void }) {
  const altitude = useRef<HTMLSpanElement>(null);
  const phase = useRef<HTMLSpanElement>(null);
  const city = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [collapsed, setCollapsed] = useState(true);
  useEffect(() => onFlightFrame(state => {
    if (altitude.current) altitude.current.textContent = state.progress < .30 ? "—" : `${Math.round(state.altitude * 20)} m`;
    if (phase.current) phase.current.textContent = state.progress >= .99999 ? "Parked · flight complete" : state.progress >= TOUCHDOWN_AT ? "Touchdown / rollout" : state.progress >= LANDING_START ? "Final approach" : state.progress < .18 ? "Cabin window" : state.progress < .30 ? "Into the clouds" : "Level cloud cruise";
    if (city.current) city.current.textContent = process.env.NEXT_PUBLIC_GOOGLE_TILES_ENABLED !== "true" ? "Skylark · scroll flight" : state.cityStatus === "ready" ? "Vile Parle · live 3D" : state.cityStatus === "unavailable" ? "City imagery unavailable" : "Vile Parle · streaming city";
    if (button.current) button.current.textContent = state.progress >= .99999 ? "Return to runway ↑" : "Scroll to fly ↓";
  }), []);
  const advance = () => {
    const max = document.documentElement.scrollHeight-window.innerHeight;
    scrollTo(flightState.progress >= .99999 ? 0 : Math.min(max, window.scrollY+window.innerHeight*.6));
    button.current?.blur();
  };
  return <><button className="flight-console-reopen" hidden={!collapsed} type="button" onClick={() => setCollapsed(false)}>Flight controls ↗</button><aside hidden={collapsed} className="flight-console" aria-label="Flight controls">
    <div className="flight-console-heading"><span className="flight-live-dot" /><span ref={city}>Skylark · scroll flight</span><button className="flight-console-close" type="button" aria-label="Hide flight controls" onClick={() => setCollapsed(true)}>×</button></div>
    <div className="flight-console-data"><span ref={phase}>Cabin window</span><span><span ref={altitude}>—</span> <small>SIM ALT</small></span></div>
    <div className="flight-console-actions">
      <button ref={button} type="button" onClick={advance}>Scroll to fly ↓</button>
      <span><kbd>↑</kbd> reverse <kbd>↓</kbd> forward</span>
    </div>
    <div className="flight-console-footer"><p>Scroll to explore · simulated altitude</p><button type="button" onClick={onToggleStory}>{showStory ? "Hide story" : "Show story"}</button></div>
  </aside></>;
}
