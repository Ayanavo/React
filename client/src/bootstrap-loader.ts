import "./components/particle-loader/particle-loader.css";
import { startParticleLoader } from "./components/particle-loader/engine";

const canvas = document.getElementById("loaderCanvas") as HTMLCanvasElement | null;

if (canvas) {
  startParticleLoader(canvas);
}
