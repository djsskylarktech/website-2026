"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flightState } from "@/lib/flight-store";

/**
 * Daylight sky, cumulus deck and hazy terrain.
 *
 * Geometry and shaders only — no photographs, no generated imagery.
 *
 * Performance: the cloud deck is a single `Points` object. Points are
 * billboarded by the GPU, so nothing rebuilds hundreds of matrices every frame
 * the way the earlier instanced-quad version did. The whole deck is one draw
 * call and drifts by rotating a single parent.
 */

/* ------------------------------------------------------------------ sky dome */

const SKY_VERT = `
  varying vec3 vWorld;
  void main() {
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = `
  uniform vec3 uHorizon;
  uniform vec3 uMid;
  uniform vec3 uZenith;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  varying vec3 vWorld;

  void main() {
    vec3 dir = normalize(vWorld - cameraPosition);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

    vec3 col = mix(uHorizon, uMid, smoothstep(0.48, 0.63, h));
    col = mix(col, uZenith, smoothstep(0.60, 0.98, h));

    float sun = max(dot(dir, normalize(uSunDir)), 0.0);
    col += uSunColor * pow(sun, 6.0) * 0.30;
    col += uSunColor * pow(sun, 180.0) * 2.2;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const SUN_DIRECTION = new THREE.Vector3(-0.35, 0.42, 0.84).normalize();

export function SkyDome() {
  const dome = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => { dome.current?.position.copy(camera.position); });
  const uniforms = useMemo(
    () => ({
      // Clear mid-morning: pale warm haze at the horizon rising to a deep,
      // saturated blue overhead.
      uHorizon: { value: new THREE.Color("#CFE3F2") },
      uMid: { value: new THREE.Color("#7FB2E5") },
      uZenith: { value: new THREE.Color("#2E6FC4") },
      uSunDir: { value: SUN_DIRECTION.clone() },
      uSunColor: { value: new THREE.Color("#FFF3DC") },
    }),
    [],
  );

  return (
    <mesh ref={dome} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[620, 32, 20]} />
      <shaderMaterial
        vertexShader={SKY_VERT}
        fragmentShader={SKY_FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

/* --------------------------------------------------------------- cloud layer */

/** A soft round puff, drawn once into a canvas and shared by every point. */
function usePuffTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.7)");
    g.addColorStop(0.72, "rgba(246,250,255,0.2)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/**
 * A cumulus deck the aircraft climbs through and then flies above.
 *
 * Puffs are grouped into clumps so the deck reads as cloud rather than as an
 * even scatter of dots.
 */
export function CloudDeck({ altitude = 30, reduced = false }: { altitude?: number; reduced?: boolean }) {
  const texture = usePuffTexture();
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    let seed = 7;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const offsets: number[] = [];
    const sizes: number[] = [];
    for (let c = 0; c < (reduced ? 22 : 38); c++) {
      const x = (rand() - 0.5) * 170;
      const y = altitude + (rand() - 0.5) * 20;
      const z = -150 - rand() * 530;
      for (let i = 0; i < 7; i++) {
        offsets.push(x + (rand() - 0.5) * 25, y + (rand() - 0.5) * 6, z + (rand() - 0.5) * 22);
        sizes.push(8 + rand() * 11);
      }
    }
    const plane = new THREE.PlaneGeometry(1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = plane.index;
    geo.attributes.position = plane.attributes.position;
    geo.attributes.uv = plane.attributes.uv;
    geo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
    geo.setAttribute("aScale", new THREE.InstancedBufferAttribute(new Float32Array(sizes), 1));
    geo.instanceCount = sizes.length;
    return geo;
  }, [altitude, reduced]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uPuff: { value: texture } }, transparent: true, depthWrite: false,
    vertexShader: `attribute vec3 aOffset; attribute float aScale; varying vec2 vUv; varying float vDistance;
      void main() { vUv = uv; vec4 center = modelViewMatrix * vec4(aOffset, 1.0);
      vDistance = -center.z; center.xy += position.xy * aScale * vec2(1.6, 0.85);
      gl_Position = projectionMatrix * center; }`,
    fragmentShader: `uniform sampler2D uPuff; varying vec2 vUv; varying float vDistance;
      void main() { float alpha = texture2D(uPuff, vUv).a * 0.5;
      alpha *= smoothstep(2.0, 9.0, vDistance) * (1.0 - smoothstep(200.0, 380.0, vDistance));
      vec3 color = mix(vec3(0.70, 0.79, 0.88), vec3(1.0, 0.99, 0.96), smoothstep(0.1, 0.7, vUv.y));
      gl_FragColor = vec4(color, alpha); }`,
  }), [texture]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  useFrame(() => { if (group.current) group.current.position.x = Math.sin(flightState.progress * Math.PI) * 2; });
  return <group ref={group}><mesh geometry={geometry} material={material} frustumCulled={false} /></group>;
}

/* ------------------------------------------------------------------- terrain */

/**
 * Distant ridge lines.
 *
 * Pale and blue-shifted: at this range real terrain is washed out by aerial
 * perspective, and matching that is most of what makes a scene read as deep
 * rather than as scenery pasted behind the aircraft.
 */
export function Ridges() {
  const geometry = useMemo(() => {
    let seed = 41;
    const rand = () => {
      seed = (seed * 22695477 + 1) % 2147483648;
      return seed / 2147483648;
    };

    const shapes: THREE.BufferGeometry[] = [];
    for (const side of [-1, 1]) {
      for (let band = 0; band < 2; band++) {
        const segments = 48;
        const geo = new THREE.PlaneGeometry(620, 70, segments, 1);
        const pos = geo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          if (pos.getY(i) > 0) {
            const t = i / segments;
            pos.setY(
              i,
              16 +
                band * 7 +
                Math.sin(t * 6.1 + band * 2.3) * 10 +
                Math.sin(t * 15.3 + band) * 5 +
                rand() * 4,
            );
          } else {
            pos.setY(i, -34);
          }
        }
        geo.rotateY(side > 0 ? -Math.PI / 2 : Math.PI / 2);
        geo.translate(side * (135 + band * 85), 0, -230);
        shapes.push(geo);
      }
    }

    const merged = new THREE.BufferGeometry();
    const total = shapes.reduce((n, g) => n + g.attributes.position.count, 0);
    const positions = new Float32Array(total * 3);
    let offset = 0;
    for (const g of shapes) {
      positions.set(g.attributes.position.array as Float32Array, offset);
      offset += g.attributes.position.count * 3;
    }
    merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const indices: number[] = [];
    let base = 0;
    for (const g of shapes) {
      const idx = g.index;
      if (idx) for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + base);
      base += g.attributes.position.count;
    }
    merged.setIndex(indices);
    merged.computeVertexNormals();
    return merged;
  }, []);

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <meshBasicMaterial color="#8FAECB" transparent opacity={0.6} />
    </mesh>
  );
}
