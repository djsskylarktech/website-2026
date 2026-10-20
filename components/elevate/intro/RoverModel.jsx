"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Box3, MathUtils, Vector3 } from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import modelAsset from "../model-asset.json";

const MODEL_URL = modelAsset.url;
const REST_YAW = -0.38;

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
    const rotation = group.current.rotation;
    const pitch = target.current.pitch;
    const yaw = REST_YAW + target.current.yaw;
    const roll = target.current.roll;
    const step = Math.min(delta, 0.05);
    rotation.x = MathUtils.damp(rotation.x, pitch, 7, step);
    rotation.y = MathUtils.damp(rotation.y, yaw, 7, step);
    rotation.z = MathUtils.damp(rotation.z, roll, 7, step);
    if (Math.abs(rotation.x - pitch) + Math.abs(rotation.y - yaw) + Math.abs(rotation.z - roll) > 0.001) {
      invalidate();
    }
  });

  return (
    <group ref={group} scale={scale} rotation={[0, REST_YAW, 0]}>
      <primitive object={scene} position={center.map((v) => -v)} />
    </group>
  );
}

export default function RoverModel() {
  const target = useRef({ pitch: 0, yaw: 0, roll: 0 });
  const invalidateRef = useRef(null);
  const dragging = useRef(null);
  const lastScroll = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      lastScroll.current = performance.now();
      if (dragging.current) {
        dragging.current = null;
        setIsDragging(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const update = (pitch, yaw, roll) => {
    target.current = { pitch, yaw, roll };
    invalidateRef.current?.();
  };

  const onPointerMove = (event) => {
    if (event.pointerType === "touch" || performance.now() - lastScroll.current < 180) return;
    if (dragging.current) {
      const drag = dragging.current;
      update(
        MathUtils.clamp(drag.pitch + (event.clientY - drag.y) * 0.004, -0.45, 0.45),
        MathUtils.clamp(drag.yaw + (event.clientX - drag.x) * 0.006, -1.05, 1.05),
        0,
      );
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = MathUtils.clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
    const y = MathUtils.clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
    update(-y * 0.13, x * 0.32, -x * 0.045);
  };

  const onPointerDown = (event) => {
    if (event.pointerType === "touch" || performance.now() - lastScroll.current < 180) return;
    dragging.current = { x: event.clientX, y: event.clientY, pitch: target.current.pitch, yaw: target.current.yaw };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const onPointerUp = (event) => {
    dragging.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      className={`jx-rover-model${isDragging ? " jx-rover-model--dragging" : ""}`}
      role="group"
      tabIndex={0}
      aria-label="Interactive Skylark aircraft model. Move the mouse to tilt, drag to rotate, or use arrow keys when focused."
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => { if (!dragging.current) update(0, 0, 0); }}
      onBlur={() => update(0, 0, 0)}
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const { pitch, yaw } = target.current;
        update(
          MathUtils.clamp(pitch + (event.key === "ArrowUp" ? -0.12 : event.key === "ArrowDown" ? 0.12 : 0), -0.45, 0.45),
          MathUtils.clamp(yaw + (event.key === "ArrowLeft" ? -0.18 : event.key === "ArrowRight" ? 0.18 : 0), -1.05, 1.05),
          0,
        );
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
      <span className="jx-rover-model__hint" aria-hidden="true">Move to explore <span>·</span> Drag to rotate</span>
    </div>
  );
}
