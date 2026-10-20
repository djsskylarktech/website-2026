"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { TilesRenderer } from "3d-tiles-renderer";
import { ReorientationPlugin, GLTFExtensionsPlugin } from "3d-tiles-renderer/plugins";
import { GoogleCloudAuthPlugin } from "3d-tiles-renderer/core/plugins";
import { flightState, onFlightFrame } from "@/lib/flight-store";

// Vile Parle, Mumbai. Local +Y is altitude; 20 real metres = one scene unit.
export function GoogleCity({ apiKey, reduced = false }: { apiKey?: string; reduced?: boolean }) {
  const { camera, gl } = useThree();
  const root = useRef<THREE.Group>(null);
  const renderer = useRef<TilesRenderer | null>(null);
  const lastUpdate = useRef(0);
  const lastCredits = useRef(0);

  useEffect(() => {
    if (!apiKey || !root.current) { flightState.cityStatus = "unavailable"; return; }
    const tiles = new TilesRenderer("https://tile.googleapis.com/v1/3dtiles/root.json");
    const decoder = new DRACOLoader().setDecoderPath("/draco/").setWorkerLimit(reduced ? 1 : 2);
    tiles.registerPlugin(new GoogleCloudAuthPlugin({ apiToken: apiKey, autoRefreshToken: true }));
    tiles.registerPlugin(new ReorientationPlugin({ lat: THREE.MathUtils.degToRad(19.1005), lon: THREE.MathUtils.degToRad(72.8463), height: 15 }));
    tiles.registerPlugin(new GLTFExtensionsPlugin({ dracoLoader: decoder }));
    // Coarse visible coverage first; never limit traversal depth (Google's root is global).
    tiles.errorTarget = reduced ? 40 : 28;
    tiles.loadSiblings = false;
    tiles.downloadQueue.maxJobsPerOrigin = reduced ? 4 : 8;
    tiles.parseQueue.maxJobs = 1;
    tiles.lruCache.minSize = reduced ? 40 : 80;
    tiles.lruCache.maxSize = reduced ? 100 : 180;
    tiles.setCamera(camera);
    const owner = root.current;
    owner.add(tiles.group);
    renderer.current = tiles;
    flightState.cityStatus = "loading";
    const ready = () => { flightState.cityStatus = "ready"; };
    const error = ({ tile }: { tile: unknown }) => {
      // A failed child must not permanently destroy the whole city.
      if (!tile) flightState.cityStatus = "unavailable";
    };
    tiles.addEventListener("load-model", ready);
    tiles.addEventListener("load-error", error);
    return () => {
      renderer.current = null;
      owner.remove(tiles.group);
      tiles.removeEventListener("load-model", ready);
      tiles.removeEventListener("load-error", error);
      tiles.dispose();
      flightState.cityCredits = "";
    };
  }, [apiKey, camera, reduced]);

  useFrame(({ clock }) => {
    const tiles = renderer.current;
    if (!tiles || clock.elapsedTime - lastUpdate.current < 0.10) return;
    lastUpdate.current = clock.elapsedTime;
    tiles.setResolutionFromRenderer(camera, gl);
    camera.updateMatrixWorld();
    tiles.update();
    if (clock.elapsedTime - lastCredits.current > 1) {
      lastCredits.current = clock.elapsedTime;
      flightState.cityCredits = tiles.getAttributions().filter(a => a.type === "string").map(a => String(a.value)).join(" · ");
    }
  });
  return <group ref={root} scale={0.05} position={[0, -3, 0]} name="vile-parle-city" />;
}

export function GoogleCityAttribution({ apiKey }: { apiKey?: string }) {
  const credits = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => onFlightFrame(() => {
    if (credits.current) credits.current.textContent = flightState.cityCredits;
    if (root.current) root.current.style.display = flightState.cityCredits ? "flex" : "none";
  }), []);
  if (!apiKey) return null;
  return <div ref={root} style={{ display: "none" }} className="city-attribution">
    <span className="city-brand">Google Maps</span>
    <span>City imagery · <span ref={credits} /></span>
  </div>;
}
