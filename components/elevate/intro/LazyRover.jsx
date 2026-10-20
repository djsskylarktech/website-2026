"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const RoverModel = dynamic(() => import("./RoverModel"), { ssr: false });

export default function LazyRover() {
  const host = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!host.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin: "600px" });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={host} className="jx-rover-lazy">{near && <RoverModel />}</div>;
}
