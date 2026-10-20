"use client";

import { useTexture } from "@react-three/drei";

/** Photographic terrain mapped onto real ground, retaining perspective and parallax. */
export function Airfield() {
  const aerial = useTexture("/images/flight/airfield-aerial.png");
  aerial.anisotropy = 8;
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.04, -170]}>
      <planeGeometry args={[1600, 1600]} />
      <meshBasicMaterial color="#797a5c" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -170]}>
      <planeGeometry args={[200, 400]} />
      <meshBasicMaterial map={aerial} toneMapped={false} />
    </mesh>
  </group>;
}
