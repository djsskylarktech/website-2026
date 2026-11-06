"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Box3, Euler, Quaternion, Vector3 } from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import modelAsset from "../model-asset.json";

const MODEL_URL = modelAsset.url;
// The source export points its tail toward the original camera angle.
const FRONT_VIEW = new Quaternion().setFromEuler(new Euler(0, Math.PI - 0.38, 0));

function trackballPoint(event, element) {
  const rect = element.getBoundingClientRect();
  const x = (2 * (event.clientX - rect.left)) / rect.width - 1;
  const y = 1 - (2 * (event.clientY - rect.top)) / rect.height;
  const radius = x * x + y * y;
  return new Vector3(x, y, radius < 1 ? Math.sqrt(1 - radius) : 0).normalize();
}

export function preloadRoverModel() {
  useGLTF.preload(MODEL_URL, false, true);
}

function Rover({ target, invalidateRef }) {
  const { scene } = useGLTF(MODEL_URL, false, true);
  const group = useRef(null);
  const invalidate = useThree((state) => state.invalidate);
  const { center, scale } = useMemo(() => {
    const bounds = new Box3().setFromObject(scene);
    const size = bounds.getSize(new Vector3());
    const midpoint = bounds.getCenter(new Vector3());
    scene.traverse((part) => {
      if (!part.isMesh) return;
      const materials = Array.isArray(part.material) ? part.material : [part.material];
      materials.forEach((material) => {
        material.color?.set("#465158");
        material.roughness = 0.78;
        material.metalness = 0.12;
        material.needsUpdate = true;
      });
    });
    return {
      center: midpoint.toArray(),
      scale: 5.5 / Math.max(size.x, size.y, size.z, 0.001),
    };
  }, [scene]);

  useEffect(() => {
    invalidateRef.current = invalidate;
    return () => { invalidateRef.current = null; };
  }, [invalidate, invalidateRef]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.quaternion.slerp(target.current, 1 - Math.exp(-10 * Math.min(delta, 0.05)));
    if (group.current.quaternion.angleTo(target.current) > 0.001) invalidate();
  });

  return (
    <group ref={group} scale={scale} quaternion={FRONT_VIEW}>
      <primitive object={scene} position={center.map((v) => -v)} />
    </group>
  );
}

export default function RoverModel() {
  const target = useRef(FRONT_VIEW.clone());
  const orientation = useRef(FRONT_VIEW.clone());
  const invalidateRef = useRef(null);
  const dragging = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const update = (hover = new Quaternion()) => {
    target.current.copy(orientation.current).multiply(hover);
    invalidateRef.current?.();
  };

  const onPointerMove = (event) => {
    if (dragging.current) {
      const drag = dragging.current;
      if (event.pointerId !== drag.pointerId) return;
      const next = trackballPoint(event, event.currentTarget);
      const turn = new Quaternion().setFromUnitVectors(drag.point, next);
      orientation.current.premultiply(turn).normalize();
      drag.point = next;
      update();
      return;
    }
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 2 - 1;
    const y = (event.clientY - rect.top) / rect.height * 2 - 1;
    update(new Quaternion().setFromEuler(new Euler(-y * 0.06, x * 0.1, 0)));
  };

  const onPointerDown = (event) => {
    if (event.button !== 0 || dragging.current) return;
    dragging.current = { pointerId: event.pointerId, point: trackballPoint(event, event.currentTarget) };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const onPointerUp = (event) => {
    if (dragging.current?.pointerId !== event.pointerId) return;
    dragging.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    update();
  };

  return (
    <div
      className={`jx-rover-model${isDragging ? " jx-rover-model--dragging" : ""}`}
      role="group"
      tabIndex={0}
      aria-label="Interactive Skylark aircraft model. Drag in any direction to rotate, or use arrow keys and Q and E when focused. Press R to reset the front view."
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => { if (!dragging.current) update(); }}
      onBlur={() => update()}
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "q", "e", "r"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "r") orientation.current.copy(FRONT_VIEW);
        else {
          const axis = event.key === "q" || event.key === "e" ? new Vector3(0, 0, 1)
            : event.key === "ArrowUp" || event.key === "ArrowDown" ? new Vector3(1, 0, 0)
            : new Vector3(0, 1, 0);
          const sign = ["ArrowUp", "ArrowRight", "e"].includes(event.key) ? 1 : -1;
          orientation.current.premultiply(new Quaternion().setFromAxisAngle(axis, sign * 0.16));
        }
        update();
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [6, 4, 7], zoom: 70, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight args={[0xffffff, 0x8c9caa, 0.7]} />
        <directionalLight position={[5, 8, 6]} intensity={2.2} />
        <directionalLight position={[-5, 2, -4]} intensity={0.5} />
        <Suspense fallback={null}>
          <Rover target={target} invalidateRef={invalidateRef} />
        </Suspense>
      </Canvas>
      <span className="jx-rover-model__hint" aria-hidden="true">Drag to rotate freely <span>·</span> R to reset</span>
    </div>
  );
}
