"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { flightState } from "@/lib/flight-store";
import { SUN_DIRECTION, SkyDome, CloudDeck } from "./Sky";
import { ARRIVAL_RUNWAY_Z } from "@/data/flight";
import { departureVisibility, arrivalVisibility } from "@/lib/flight-route";
import { GoogleCity } from "./GoogleCity";
import { Airfield } from "./Airfield";
import { AirfieldHorizon } from "./AirfieldHorizon";

/**
 * The world the flight happens in: a hangar, a runway and daylight.
 *
 * Performance choices worth knowing about, because this runs every frame behind
 * the whole homepage:
 *
 *  - No shadow maps. A shadow pass re-renders the scene from the light every
 *    frame and bought little here — the aircraft is small in frame and mostly
 *    over cloud. Contact darkness under the wheels is a plain dark quad.
 *  - No per-frame JavaScript in the environment. Everything is static geometry
 *    built once; the clouds drift on a single parent rotation.
 *  - Runway markings are one merged geometry rather than ~50 separate meshes,
 *    which was ~50 draw calls for a row of white dashes.
 */


export function FlightEnvironment({ reduced = false }: { reduced?: boolean }) {
  return (
    <>
      <fogExp2 attach="fog" args={["#d7e8f5", 0.0025]} />
      <SkyDome />
      <AirfieldHorizon />
      <Lighting reduced={reduced} />
      {process.env.NEXT_PUBLIC_GOOGLE_TILES_ENABLED === "true" ? <GoogleCity apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} reduced={reduced} /> : null}
      <FlightGround />
      <FlightGround arrival />
      <CloudDeck altitude={30} reduced={reduced} />
    </>
  );
}

function FlightGround({ arrival = false }: { arrival?: boolean }) {
  const root = useRef<THREE.Group>(null);
  useFrame(() => {
    const group = root.current;
    if (!group) return;
    const opacity = arrival ? arrivalVisibility(flightState.progress) : departureVisibility(flightState.progress);
    group.visible = opacity > 0.005;
    if (!group.visible) return;
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        material.transparent = true;
        if (material.userData.baseOpacity === undefined) material.userData.baseOpacity = material.opacity;
        material.opacity = opacity * material.userData.baseOpacity;
        material.depthWrite = opacity > 0.95;
      }
    });
  });
  return <group ref={root} position={[0, 0, arrival ? ARRIVAL_RUNWAY_Z : 0]} name={arrival ? "arrival-ground" : "departure-ground"}><Airfield /></group>;
}

function Lighting({ reduced }: { reduced: boolean }) {
  const sunPosition = useMemo(() => SUN_DIRECTION.clone().multiplyScalar(120), []);

  return (
    <>
      {/* The HDRI already supplies sky and bounce light, so this is only the
          sun: a single direction for highlights and a sense of time of day.
          Adding the old hemisphere and ambient lights on top would double-count
          the sky and flatten everything out. */}
      <hemisphereLight args={["#dceeff", "#738990", 2.2]} />
      <directionalLight position={sunPosition} intensity={1.4} color="#FFF6E6" />
      {!reduced ? (
        <directionalLight position={[60, 30, -80]} intensity={0.25} color="#9FC0F0" />
      ) : null}
    </>
  );
}
