export type ParticlePreset = "sphere" | "vortex" | "dna" | "galaxy" | "atom";
export type ParticleShape = "circle" | "square" | "sparkle";

export interface ParticleLoaderConfig {
  preset: ParticlePreset;
  particleCount: number;
  particleSize: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  radius: number;
  color: string;
  glowColor: string;
  glowIntensity: number;
  noise: number;
  noiseSpeed: number;
  perspective: number;
  particleShape: ParticleShape;
  backgroundColor: string;
  connectionLines: boolean;
  connectionDistance: number;
  trailEffect: number;
}

export const DEFAULT_PARTICLE_LOADER_CONFIG: ParticleLoaderConfig = {
  preset: "sphere",
  particleCount: 650,
  particleSize: 0.9,
  speedX: -1,
  speedY: 0.8,
  speedZ: 0.05,
  radius: 95,
  color: "#ffffff",
  glowColor: "#ffffff",
  glowIntensity: 0,
  noise: 0,
  noiseSpeed: 0,
  perspective: 370,
  particleShape: "circle",
  backgroundColor: "#000000",
  connectionLines: false,
  connectionDistance: 51,
  trailEffect: 0.1,
};
