"use client";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CRUISE_START, LANDING_START, TOUCHDOWN_AT } from "@/data/flight";
import { flightState, lerp } from "@/lib/flight-store";
import { sampleFlightPosition, sampleLateral, samplePitch, sampleFraming, smootherstep } from "@/lib/flight-route";
import { AircraftModel } from "./AircraftModel";
export interface FlightRigProps { src: string; placeholder: boolean; reduced?: boolean; }

export function FlightRig({ src, placeholder, reduced = false }: FlightRigProps) {
  const aircraft = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const scratch = useMemo(() => ({ position: new THREE.Vector3(), target: new THREE.Vector3(), up: new THREE.Vector3() }), []);
  useFrame(() => {
    const group = aircraft.current;
    if (!group || !(camera instanceof THREE.PerspectiveCamera)) return;
    const t = flightState.progress;
    // The new opening travels through a cabin window and cloud before the
    // existing level-flight rig takes over. Never show its runway phase.
    group.visible = t >= .30;
    sampleFlightPosition(t, scratch.position);
    // Wheel bottoms touch the photographic runway at altitude zero.
    group.position.copy(scratch.position); group.position.y += .148;
    const dx = (sampleLateral(Math.min(1,t+.0001))-sampleLateral(Math.max(0,t-.0001)))/.0002;
    const turn = Math.tanh(dx/350);
    group.rotation.set(samplePitch(t), -turn*.10, -turn*(reduced ? .025 : .045));
    const mobile = (window.innerWidth || size.width) < 640;
    const cruise = smootherstep(.12, CRUISE_START,t);
    const landing = smootherstep(LANDING_START,TOUCHDOWN_AT,t);
    // Guarantee a bounded wingspan on narrow screens by changing lens distance,
    // not the aircraft scale. Both camera and model are pure functions of t.
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    const widthFraction = mobile ? .43 : .27;
    const fitDistance = 3.7/(2*tan*camera.aspect*widthFraction);
    const distance = Math.max(fitDistance, lerp(lerp(9,11,cruise),10,landing));
    const height = distance*.16;
    const depth = Math.hypot(distance,height);
    const framing = sampleFraming(t);
    const screenX = framing*(mobile ? .27 : .53);
    const screenY = mobile ? .48 : -.04;
    scratch.up.set(0,distance,-height).normalize();
    scratch.target.copy(group.position); scratch.target.y += .16; scratch.target.z += .6;
    scratch.target.x -= screenX*depth*tan*camera.aspect;
    scratch.target.addScaledVector(scratch.up,-screenY*depth*tan);
    camera.position.copy(scratch.target); camera.position.y += height; camera.position.z += distance;
    camera.up.set(0,1,0); camera.lookAt(scratch.target);
  });
  return <group ref={aircraft}><AircraftModel src={src} placeholder={placeholder} /></group>;
}
