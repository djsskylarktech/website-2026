"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const loadRover = () => import("./RoverModel");
const RoverModel = dynamic(loadRover, { ssr: false });

export default function LazyRover() {
  const host = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!host.current) return undefined;
    let warmed = false;
    const prewarm = () => {
      if (warmed) return;
      warmed = true;
      loadRover().then(({ preloadRoverModel }) => preloadRoverModel()).catch(() => {});
    };
    const warmup = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        prewarm();
        warmup.disconnect();
      }
    }, { rootMargin: "2500px" });
    const mount = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNear(true);
        mount.disconnect();
      }
    }, { rootMargin: "900px" });
    warmup.observe(host.current);
    mount.observe(host.current);
    const idle = "requestIdleCallback" in window
      ? window.requestIdleCallback(prewarm, { timeout: 3500 })
      : window.setTimeout(prewarm, 2000);
    return () => {
      warmup.disconnect();
      mount.disconnect();
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  return <div ref={host} className="jx-rover-lazy">{near && <RoverModel />}</div>;
}
