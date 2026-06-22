import React, { useEffect, useRef } from "react";
import "./infinity-background.scss";

const PARALLAX_STRENGTH = 18;

export default function InfinityBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      root.style.setProperty("--parallax-x", `${x * PARALLAX_STRENGTH}px`);
      root.style.setProperty("--parallax-y", `${y * PARALLAX_STRENGTH}px`);
      root.style.setProperty("--glow-x", `${event.clientX}px`);
      root.style.setProperty("--glow-y", `${event.clientY}px`);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={rootRef} className="infinity-background" aria-hidden="true">
      <div className="infinity-background__grid" />
      <div className="infinity-background__grid-alt" />
      <div className="infinity-background__glow" />
      <div className="infinity-background__glow-secondary" />
      <div className="infinity-background__overlay" />
    </div>
  );
}
