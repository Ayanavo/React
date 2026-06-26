import { DEFAULT_PARTICLE_LOADER_CONFIG, type ParticleLoaderConfig } from "./config";

interface Particle {
  x: number;
  y: number;
  z: number;
  phase: number;
  dist?: number;
  angle?: number;
  speed?: number;
  strand?: number;
  colorOverride?: string;
  ringIndex?: number;
}

interface ProjectedParticle {
  px: number;
  py: number;
  z: number;
  scale: number;
  opacity: number;
  color: string;
  origIndex: number;
}

function initParticles(config: ParticleLoaderConfig): Particle[] {
  const particles: Particle[] = [];
  const n = config.particleCount;
  const r = config.radius;

  if (config.preset === "sphere") {
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(1 - 2 * (i / (n - 1 || 1)));
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      particles.push({
        x: Math.sin(phi) * Math.cos(theta) * r,
        y: Math.cos(phi) * r,
        z: Math.sin(phi) * Math.sin(theta) * r,
        phase: Math.random() * Math.PI * 2,
      });
    }
  } else if (config.preset === "vortex") {
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * r + 15;
      particles.push({
        x: Math.cos(angle) * dist,
        y: (Math.random() - 0.5) * 30 - (r - dist) * 0.4,
        z: Math.sin(angle) * dist,
        dist,
        angle,
        speed: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
      });
    }
  } else if (config.preset === "dna") {
    for (let i = 0; i < n; i++) {
      const strand = i % 2;
      const t = (Math.floor(i / 2) / (n / 2)) * 3;
      const angle = t * Math.PI * 2;
      const helixRadius = r * 0.65;
      particles.push({
        x: Math.cos(angle + strand * Math.PI) * helixRadius,
        y: (t - 1.5) * r * 1.3,
        z: Math.sin(angle + strand * Math.PI) * helixRadius,
        strand,
        phase: angle,
        colorOverride: strand === 0 ? config.color : "#60a5fa",
      });
    }
  } else if (config.preset === "galaxy") {
    const numArms = 4;
    for (let i = 0; i < n; i++) {
      const armIndex = i % numArms;
      const progress = Math.random();
      const angle = armIndex * ((Math.PI * 2) / numArms) + progress * Math.PI * 2.5;
      const rGalaxy = progress * r + Math.random() * 12;
      const dy = (Math.random() - 0.5) * ((1.0 - progress) * 16 + 2);

      let col = config.color;
      if (progress < 0.25) col = "#ffb0b0";
      else if (armIndex % 2 !== 0) col = "#a78bfa";

      particles.push({
        x: Math.cos(angle) * rGalaxy,
        y: dy,
        z: Math.sin(angle) * rGalaxy,
        phase: Math.random() * Math.PI * 2,
        colorOverride: col,
        dist: rGalaxy,
      });
    }
  } else {
    const orbitsCount = 3;
    for (let i = 0; i < n; i++) {
      const orbitIndex = i % orbitsCount;
      const angle = Math.random() * Math.PI * 2;
      const radiusAtom = r * (0.85 + Math.random() * 0.25);
      const lx = Math.cos(angle) * radiusAtom;
      const ly = Math.sin(angle) * radiusAtom;
      const lz = (Math.random() - 0.5) * 8;

      let x = lx;
      let y = ly;
      let z = lz;
      if (orbitIndex === 1) {
        y = ly * Math.cos(Math.PI / 3) - lz * Math.sin(Math.PI / 3);
        z = ly * Math.sin(Math.PI / 3) + lz * Math.cos(Math.PI / 3);
      } else if (orbitIndex === 2) {
        const rx = lx * Math.cos(Math.PI / 4) - ly * Math.sin(Math.PI / 4);
        const ry = lx * Math.sin(Math.PI / 4) + ly * Math.cos(Math.PI / 4);
        y = ry * Math.cos(-Math.PI / 4) - lz * Math.sin(-Math.PI / 4);
        z = ry * Math.sin(-Math.PI / 4) + lz * Math.cos(-Math.PI / 4);
        x = rx;
      }

      particles.push({
        x,
        y,
        z,
        ringIndex: orbitIndex,
        phase: angle,
        colorOverride:
          orbitIndex === 0 ? config.color : orbitIndex === 1 ? "#38bdf8" : "#fb7185",
      });
    }
  }

  return particles;
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: ProjectedParticle,
  config: ParticleLoaderConfig
) {
  ctx.fillStyle = p.color;
  ctx.globalAlpha = p.opacity;
  const renderSize = Math.max(0.4, config.particleSize * p.scale);

  if (config.particleShape === "sparkle") {
    ctx.beginPath();
    ctx.moveTo(p.px, p.py - renderSize * 1.5);
    ctx.lineTo(p.px + renderSize * 0.5, p.py - renderSize * 0.5);
    ctx.lineTo(p.px + renderSize * 1.5, p.py);
    ctx.lineTo(p.px + renderSize * 0.5, p.py + renderSize * 0.5);
    ctx.lineTo(p.px, p.py + renderSize * 1.5);
    ctx.lineTo(p.px - renderSize * 0.5, p.py + renderSize * 0.5);
    ctx.lineTo(p.px - renderSize * 1.5, p.py);
    ctx.lineTo(p.px - renderSize * 0.5, p.py - renderSize * 0.5);
    ctx.closePath();
    ctx.fill();
  } else if (config.particleShape === "square") {
    ctx.fillRect(p.px - renderSize / 2, p.py - renderSize / 2, renderSize, renderSize);
  } else {
    ctx.beginPath();
    ctx.arc(p.px, p.py, renderSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

export interface ParticleLoaderHandle {
  stop: () => void;
}

export function startParticleLoader(
  canvas: HTMLCanvasElement,
  options?: Partial<ParticleLoaderConfig> & { size?: number }
): ParticleLoaderHandle {
  const config: ParticleLoaderConfig = { ...DEFAULT_PARTICLE_LOADER_CONFIG, ...options };
  const width = options?.size ?? 320;
  const height = options?.size ?? 320;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return { stop: () => {} };
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const particles = initParticles(config);
  let angleX = 0;
  let angleY = 0;
  let angleZ = 0;
  let noiseTime = 0;
  let lastTime = performance.now();
  let frameId = 0;
  let stopped = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const render = () => {
    if (stopped) return;

    const now = performance.now();
    const delta = reducedMotion ? 0 : (now - lastTime) / 1000;
    lastTime = now;

    ctx.fillStyle = config.backgroundColor;
    if (config.trailEffect < 1) {
      ctx.globalAlpha = 1 - config.trailEffect;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;
    } else {
      ctx.fillRect(0, 0, width, height);
    }

    angleX += config.speedX * delta * 0.4;
    angleY += config.speedY * delta * 0.4;
    angleZ += config.speedZ * delta * 0.4;
    noiseTime += config.noiseSpeed * delta;

    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosZ = Math.cos(angleZ);
    const sinZ = Math.sin(angleZ);

    const centerX = width / 2;
    const centerY = height / 2;
    const projected: ProjectedParticle[] = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      let rx = p.x;
      let ry = p.y;
      let rz = p.z;

      if (config.preset === "vortex" && p.dist !== undefined && p.angle !== undefined && p.speed !== undefined) {
        p.angle += p.speed * 1.5;
        p.dist -= 18 * delta;
        if (p.dist < 10) {
          p.dist = config.radius * (0.8 + Math.random() * 0.2) + 15;
          p.angle = Math.random() * Math.PI * 2;
        }
        rx = Math.cos(p.angle) * p.dist;
        rz = Math.sin(p.angle) * p.dist;
        p.y = (Math.random() - 0.5) * 20 - (config.radius - p.dist) * 0.5;
        ry = p.y;
      }

      if (config.noise > 0) {
        const d = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1;
        if (config.preset === "sphere") {
          const noiseFactor =
            Math.sin((rx / d) * 3.5 + noiseTime) *
            Math.cos((ry / d) * 3.5 + noiseTime) *
            Math.sin((rz / d) * 3.5 + noiseTime);
          const displacement = 1 + noiseFactor * config.noise * 0.4;
          rx *= displacement;
          ry *= displacement;
          rz *= displacement;
        } else if (config.preset === "galaxy" && p.dist !== undefined) {
          ry += Math.sin(p.dist * 0.06 - noiseTime * 2) * config.noise * 12;
        } else if (config.preset === "dna") {
          const wiggle = Math.sin(p.y * 0.04 + noiseTime * 3) * config.noise * 15;
          rx += Math.cos(p.phase) * wiggle;
          rz += Math.sin(p.phase) * wiggle;
        }
      }

      const x1 = rx * cosY - rz * sinY;
      const z1 = rx * sinY + rz * cosY;
      const y2 = ry * cosX - z1 * sinX;
      const z2 = ry * sinX + z1 * cosX;
      const x3 = x1 * cosZ - y2 * sinZ;
      const y3 = x1 * sinZ + y2 * cosZ;

      const zoom = config.perspective;
      const dist = zoom + z2;
      if (dist <= 10) continue;

      const scale = zoom / dist;
      const px = centerX + x3 * scale;
      const py = centerY + y3 * scale;

      const maxDepth = config.radius * 1.5;
      const normalizedZ = Math.max(-maxDepth, Math.min(maxDepth, z2));
      const opacity = 0.2 + (1.0 - (normalizedZ + maxDepth) / (maxDepth * 2)) * 0.8;

      projected.push({
        px,
        py,
        z: z2,
        scale,
        opacity: Math.max(0.05, Math.min(1.0, opacity)),
        color: p.colorOverride || config.color,
        origIndex: i,
      });
    }

    projected.sort((a, b) => b.z - a.z);

    if (config.connectionLines && projected.length > 1) {
      ctx.lineWidth = 0.45;
      if (config.preset === "dna") {
        const baseMap = new Map<number, ProjectedParticle>();
        projected.forEach((p) => baseMap.set(p.origIndex, p));
        baseMap.forEach((p, index) => {
          if (index % 2 === 0) {
            const partner = baseMap.get(index + 1);
            if (partner) {
              const avgOpacity = (p.opacity + partner.opacity) * 0.18;
              ctx.strokeStyle = config.color;
              ctx.globalAlpha = avgOpacity;
              ctx.beginPath();
              ctx.moveTo(p.px, p.py);
              ctx.lineTo(partner.px, partner.py);
              ctx.stroke();
            }
          }
        });
        ctx.globalAlpha = 1.0;
      } else {
        const maxLookups = Math.min(projected.length, 300);
        for (let i = 0; i < maxLookups; i++) {
          const p1 = projected[i];
          const nextCheck = Math.min(projected.length, i + 12);
          for (let j = i + 1; j < nextCheck; j++) {
            const p2 = projected[j];
            const dx = p1.px - p2.px;
            const dy = p1.py - p2.py;
            const d2 = dx * dx + dy * dy;
            const limit = config.connectionDistance;

            if (d2 < limit * limit) {
              const connectionOpacity =
                (1.0 - Math.sqrt(d2) / limit) * ((p1.opacity + p2.opacity) * 0.5) * 0.25;
              ctx.strokeStyle = config.color;
              ctx.globalAlpha = connectionOpacity;
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1.0;
      }
    }

    ctx.shadowBlur = config.glowIntensity;
    ctx.shadowColor = config.glowColor;

    for (let i = 0; i < projected.length; i++) {
      drawParticle(ctx, projected[i], config);
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;

    if (!reducedMotion) {
      frameId = requestAnimationFrame(render);
    }
  };

  render();

  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(frameId);
    },
  };
}
