"use client";
import { useRef } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flightState } from "@/lib/flight-store";
import { departureVisibility, arrivalVisibility } from "@/lib/flight-route";

export function AirfieldHorizon() {
  const image = useTexture("/images/flight/airfield-panorama.png");
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    if (!mesh.current) return;
    const opacity = Math.max(departureVisibility(flightState.progress), arrivalVisibility(flightState.progress));
    mesh.current.visible = opacity > .001;
    mesh.current.position.set(camera.position.x, 116, camera.position.z - 600);
    (mesh.current.material as THREE.MeshBasicMaterial).opacity = opacity;
  });
  return <mesh ref={mesh} renderOrder={-10}>
    <planeGeometry args={[1400, 466.67]} />
    <meshBasicMaterial map={image} transparent depthWrite={false} toneMapped={false} fog={false} />
  </mesh>;
}
