"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flightState } from "@/lib/flight-store";

/**
 * Vajra, built from the team's own CAD figures.
 *
 * This is still a stand-in for the real SolidWorks export, but it is no longer
 * a schematic: the geometry and the materials follow the 2026 design report
 * drawings — twin balsa/ply fuselage pods with a rounded nose and a boxy cargo
 * bay, carbon booms running aft, an H-tail with swept trapezoidal fins, a wing
 * with a rectangular centre section and tapered outboard panels, winglets,
 * tractor props and the blue-anodised mounts and gear legs that appear
 * throughout the drawings.
 *
 * Scale: 1 unit = 1 metre. 120 in span = 3.05 m.
 */

const SPAN = 3.05;
const CENTRE_SPAN = 0.62; // rectangular section between the pods
const POD_GAP = 0.56; // lateral offset of each fuselage from centreline
const ROOT_CHORD = 0.52;
const TIP_CHORD = 0.34;
const POD_LEN = 0.82;
const BOOM_LEN = 1.5;

/* Materials taken from the renders: natural balsa and ply, carbon black booms,
   blue anodised hardware, aluminium spars and grey composite props. */
const PALETTE = {
  balsa: "#B4833F",
  ply: "#8C5B28",
  carbon: "#15171C",
  blue: "#2E7FD4",
  metal: "#9AA2AE",
  prop: "#5A6068",
};

export function AircraftPlaceholder({ dimmed = false }: { dimmed?: boolean }) {
  const mats = useMemo(() => {
    const make = (color: string, roughness: number, metalness = 0) =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).multiplyScalar(dimmed ? 0.65 : 1),
        roughness,
        metalness,
      });
    return {
      balsa: make("#d9c6a0", 0.48),
      ply: make("#ad8859", 0.58),
      carbon: make(PALETTE.carbon, 0.45, 0.25),
      blue: make(PALETTE.blue, 0.42, 0.15),
      metal: make(PALETTE.metal, 0.35, 0.75),
      prop: make(PALETTE.prop, 0.5, 0.2),
    };
  }, [dimmed]);

  return (
    <group name="vajra">
      <Wing mats={mats} />
      {[-POD_GAP, POD_GAP].map((x) => (
        <Fuselage key={x} x={x} mats={mats} />
      ))}
      <Empennage mats={mats} />
    </group>
  );
}

/**
 * Wing: rectangular through the centre, tapered outboard, with the leading
 * edge straight and the taper carried on the trailing edge — the planform in
 * the 3.1.1 drawing.
 */
function Wing({ mats }: { mats: Record<string, THREE.MeshStandardMaterial> }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const thickness = (u: number) => 5 * .12 * (.2969 * Math.sqrt(u) - .126 * u - .3516 * u*u + .2843 * u*u*u - .1036 * u*u*u*u);
    for (let i = 0; i <= 48; i++) {
      const u = (1 - Math.cos(i / 48 * Math.PI)) / 2;
      const x = ROOT_CHORD * (.5 - u);
      const y = ROOT_CHORD * (thickness(u) + .018 * Math.sin(Math.PI * u));
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    for (let i = 48; i >= 0; i--) {
      const u = (1 - Math.cos(i / 48 * Math.PI)) / 2;
      shape.lineTo(ROOT_CHORD * (.5-u), ROOT_CHORD * (-thickness(u) + .018 * Math.sin(Math.PI*u)));
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: SPAN, steps: 24, bevelEnabled: false });
    geo.rotateY(Math.PI / 2);
    geo.translate(-SPAN / 2, 0, 0);
    const points = geo.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i);
      const taper = Math.max(0, (Math.abs(x) - CENTRE_SPAN / 2) / ((SPAN - CENTRE_SPAN) / 2));
      const ratio = 1 - taper * (1 - TIP_CHORD / ROOT_CHORD);
      points.setY(i, points.getY(i) * ratio + Math.abs(x) * .022);
      points.setZ(i, points.getZ(i) * ratio);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={[0, 0.3, 0]}>
      <mesh geometry={geometry} material={mats.balsa} />

      {/* Aluminium main spar, visible through the structure in the drawings. */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.02, -0.04]} material={mats.metal}>
        <cylinderGeometry args={[0.016, 0.016, SPAN, 10]} />
      </mesh>

      {/* Winglets: small end plates canted up at each tip. */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * (SPAN / 2 - 0.01), 0.075, 0.02]}
          rotation={[0, 0, s * -0.22]}
          material={mats.ply}
         
        >
          <boxGeometry args={[0.018, 0.17, TIP_CHORD * 0.78]} />
        </mesh>
      ))}
    </group>
  );
}

/** One fuselage pod: rounded nose, cargo bay, tractor prop, boom and gear. */
function Fuselage({ x, mats }: { x: number; mats: Record<string, THREE.MeshStandardMaterial> }) {
  const prop = useRef<THREE.Group>(null);

  // The props turn. At cruise a real propeller is a disc, but a slow visible
  // rotation reads better than a blur at this scale.
  useFrame(() => {
    if (prop.current) prop.current.rotation.z = flightState.progress * 1800;
  });

  return (
    <group position={[x, 0.12, 0]}>
      {/* Cargo bay — the whole pod is the payload volume. */}
      <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]} material={mats.balsa}>
        <capsuleGeometry args={[0.118, POD_LEN - .236, 12, 24]} />
      </mesh>

      {/* Rounded nose cap. */}
      <mesh
        position={[0, 0, -POD_LEN / 2 - 0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={mats.ply}
       
      >
        <capsuleGeometry args={[0.112, 0.12, 4, 12]} />
      </mesh>

      {/* Motor mount and spinner. */}
      <mesh position={[0, 0, -POD_LEN / 2 - 0.235]} material={mats.blue}>
        <boxGeometry args={[0.07, 0.07, 0.09]} />
      </mesh>
      <group ref={prop} position={[0, 0, -POD_LEN / 2 - 0.3]}>
        <mesh material={mats.metal}>
          <coneGeometry args={[0.032, 0.07, 10]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            rotation={[0, 0, (i * Math.PI * 2) / 3]}
            position={[0, 0, 0.01]}
            material={mats.prop}
          >
            <boxGeometry args={[0.012, 0.3, 0.004]} />
          </mesh>
        ))}
      </group>

      {/* Carbon boom aft to the tail. */}
      <mesh
        position={[0, 0.02, POD_LEN / 2 + BOOM_LEN / 2 - 0.05]}
        rotation={[Math.PI / 2, 0, 0]}
        material={mats.carbon}
      >
        <cylinderGeometry args={[0.019, 0.019, BOOM_LEN, 10]} />
      </mesh>

      {/* Dual tandem gear: a blue V-leg forward, a trailing leg aft. */}
      <Gear z={-0.22} mats={mats} splayed />
      <Gear z={0.2} mats={mats} />
    </group>
  );
}

function Gear({
  z,
  mats,
  splayed = false,
}: {
  z: number;
  mats: Record<string, THREE.MeshStandardMaterial>;
  splayed?: boolean;
}) {
  return (
    <group position={[0, -0.13, z]}>
      <mesh rotation={[0, 0, splayed ? 0.18 : 0]} material={mats.blue}>
        <boxGeometry args={[0.022, 0.15, 0.022]} />
      </mesh>
      <mesh position={[0, -0.095, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.carbon}>
        <cylinderGeometry args={[0.042, 0.042, 0.026, 12]} />
      </mesh>
    </group>
  );
}

/**
 * H-tail: one horizontal surface spanning both booms, with swept trapezoidal
 * fins at each end — the flat-plate verticals described in the report.
 */
function Empennage({ mats }: { mats: Record<string, THREE.MeshStandardMaterial> }) {
  const fin = useMemo(() => {
    // Trapezoid with a swept leading edge, as drawn in the side profile.
    const shape = new THREE.Shape();
    shape.moveTo(-0.14, 0);
    shape.lineTo(0.13, 0);
    shape.lineTo(0.13, 0.3);
    shape.lineTo(0.02, 0.3);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.014, bevelEnabled: false });
    geo.rotateY(Math.PI / 2);
    return geo;
  }, []);

  const z = POD_LEN / 2 + BOOM_LEN - 0.14;

  return (
    <group position={[0, 0.14, z]}>
      <mesh material={mats.balsa}>
        <boxGeometry args={[POD_GAP * 2 + 0.34, 0.022, 0.26]} />
      </mesh>
      {[-POD_GAP, POD_GAP].map((x) => (
        <mesh key={x} geometry={fin} position={[x, 0.01, -0.06]} material={mats.ply} />
      ))}
    </group>
  );
}
