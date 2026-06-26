import React, { useEffect, useRef } from "react";
import type { ParticleLoaderConfig } from "./config";
import { startParticleLoader } from "./engine";
import "./particle-loader.css";

export interface ParticleLoaderProps {
  statusText?: string;
  fullScreen?: boolean;
  size?: number;
  config?: Partial<ParticleLoaderConfig>;
  className?: string;
}

export function ParticleLoader({
  statusText = "Loading assets...",
  fullScreen = true,
  size = 320,
  config,
  className,
}: ParticleLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handle = startParticleLoader(canvas, { ...config, size });
    return () => handle.stop();
  }, [config, size]);

  const screenClass = fullScreen ? "particle-loader-screen" : "particle-loader-inline";
  const rootClass = [screenClass, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-busy="true" aria-label={statusText}>
      <div className="particle-loader-container" style={{ width: size, height: size }}>
        <canvas ref={canvasRef} className="particle-loader-canvas" />
        {statusText ? <div className="particle-loader-status">{statusText}</div> : null}
      </div>
    </div>
  );
}
