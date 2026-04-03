import { Dino } from "../entities/Dino";
import { Obstacle } from "../entities/Obstacle";
import { DINO_X, AUTOPLAY_REACT_MS, AUTOPLAY_UNLOCK_SCORE } from "../config/constants";

export class AutoPlayAI {
  private permanentlyUnlocked = false;
  private permanentMode = false;

  constructor() {
    this.permanentlyUnlocked = localStorage.getItem("autoplayUnlocked") === "true";
  }

  get isActive(): boolean {
    return this.permanentMode;
  }

  get isUnlocked(): boolean {
    return this.permanentlyUnlocked;
  }

  checkUnlock(score: number): void {
    if (!this.permanentlyUnlocked && score >= AUTOPLAY_UNLOCK_SCORE) {
      this.permanentlyUnlocked = true;
      localStorage.setItem("autoplayUnlocked", "true");
    }
  }

  togglePermanentMode(): void {
    if (this.permanentlyUnlocked) {
      this.permanentMode = !this.permanentMode;
    }
  }

  decide(
    dino: Dino,
    obstacles: Obstacle[],
    speed: number,
  ): { jump: boolean; duck: boolean } {
    const result = { jump: false, duck: false };

    let nearest: Obstacle | null = null;
    let nearestDist = Infinity;
    for (const obs of obstacles) {
      const dist = obs.sprite.x - DINO_X;
      if (dist > -20 && dist < nearestDist) {
        nearest = obs;
        nearestDist = dist;
      }
    }

    if (!nearest) return result;

    const timeMs = (nearestDist / speed) * 1000;

    if (timeMs < AUTOPLAY_REACT_MS) {
      if (nearest.kind === "bird-lo") {
        result.duck = true;
      } else if (!dino.isOnGround) {
        // Already in the air, do nothing
      } else {
        result.jump = true;
      }
    }

    return result;
  }
}
