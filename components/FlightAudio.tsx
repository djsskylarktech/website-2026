"use client";

import { useEffect, useRef, useState } from "react";
import { CRUISE_START, LANDING_START, TAKEOFF_START, TOUCHDOWN_AT } from "@/data/flight";
import { flightState, onFlightFrame } from "@/lib/flight-store";

export function FlightAudio() {
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  const audio = useRef<{ context: AudioContext; master: GainNode } | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const active = useRef(false);
  useEffect(() => () => { cleanup.current?.(); void audio.current?.context.close(); }, []);

  async function toggle() {
    try {
      if (!audio.current) {
        const context = new AudioContext();
        const master = context.createGain();
        master.gain.value = 0; master.connect(context.destination);
        // A low propeller fundamental with detuned harmonics, plus filtered wind.
        const engineGain = context.createGain(); engineGain.gain.value = .07; engineGain.connect(master);
        const engines = [1, 2.01, 3.98].map((multiple) => {
          const oscillator = context.createOscillator(); oscillator.type = "sine";
          oscillator.frequency.value = 55 * multiple; oscillator.connect(engineGain); oscillator.start();
          return { oscillator, multiple };
        });
        const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
        const samples = buffer.getChannelData(0);
        let brown = 0;
        for (let i = 0; i < samples.length; i++) { brown = (brown + (Math.random() * 2 - 1) * .025) / 1.025; samples[i] = brown * 4; }
        const noise = context.createBufferSource(); noise.buffer = buffer; noise.loop = true;
        const filter = context.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 700;
        const wind = context.createGain(); wind.gain.value = .015;
        noise.connect(filter); filter.connect(wind); wind.connect(master); noise.start();
        audio.current = { context, master };
        const visibility = () => {
          if (document.hidden) void context.suspend();
          else if (active.current) void context.resume();
        };
        document.addEventListener("visibilitychange", visibility);
        const off = onFlightFrame(() => {
          if (!active.current || context.state !== "running") return;
          const t = flightState.progress;
          const airborne = Math.min(1, Math.max(0, flightState.altitude / 32));
          const power = t < TAKEOFF_START ? .35 : t < CRUISE_START ? 1 : t < LANDING_START ? .72 : t < TOUCHDOWN_AT ? .4 : .2;
          engines.forEach(({ oscillator, multiple }) => oscillator.frequency.setTargetAtTime((42 + power * 32) * multiple, context.currentTime, .6));
          engineGain.gain.setTargetAtTime(.035 + power * .035, context.currentTime, .6);
          wind.gain.setTargetAtTime(.015 + airborne * .13, context.currentTime, .9);
          filter.frequency.setTargetAtTime(350 + airborne * 850, context.currentTime, .9);
        });
        cleanup.current = () => { off(); document.removeEventListener("visibilitychange", visibility); engines.forEach(({ oscillator }) => oscillator.stop()); noise.stop(); };
      }
      const next = !active.current;
      await audio.current.context.resume();
      active.current = next;
      audio.current.master.gain.setTargetAtTime(next ? .65 : 0, audio.current.context.currentTime, .18);
      setEnabled(next); setFailed(false);
    } catch { setFailed(true); }
  }
  return <button type="button" className="flight-audio" onClick={toggle} aria-pressed={enabled} aria-label={enabled ? "Mute flight sound" : "Enable flight sound"}>
    <span aria-hidden="true">{enabled ? "◖))" : "♪"}</span> {failed ? "Retry sound" : enabled ? "Sound on" : "Enable sound"}
  </button>;
}
