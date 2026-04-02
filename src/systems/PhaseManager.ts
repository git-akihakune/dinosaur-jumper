import Phaser from "phaser";
import {
  THRESHOLD_COLOR_TINT,
  THRESHOLD_SKY_COLOR,
  THRESHOLD_PLATFORMS,
  THRESHOLD_FLYING_ENEMIES,
  THRESHOLD_FULL_COLOR,
  THRESHOLD_COLLECTIBLES,
  THRESHOLD_POWERUPS,
  THRESHOLD_LANES,
  THRESHOLD_BOSS_PATTERNS,
} from "../config/constants";

export type PhaseEvent =
  | "unlock:colorTint"
  | "unlock:skyColor"
  | "unlock:platforms"
  | "unlock:flyingEnemies"
  | "unlock:fullColor"
  | "unlock:collectibles"
  | "unlock:powerups"
  | "unlock:lanes"
  | "unlock:bossPatterns";

interface Milestone {
  threshold: number;
  event: PhaseEvent;
}

const MILESTONES: Milestone[] = [
  { threshold: THRESHOLD_COLOR_TINT, event: "unlock:colorTint" },
  { threshold: THRESHOLD_SKY_COLOR, event: "unlock:skyColor" },
  { threshold: THRESHOLD_PLATFORMS, event: "unlock:platforms" },
  { threshold: THRESHOLD_FLYING_ENEMIES, event: "unlock:flyingEnemies" },
  { threshold: THRESHOLD_FULL_COLOR, event: "unlock:fullColor" },
  { threshold: THRESHOLD_COLLECTIBLES, event: "unlock:collectibles" },
  { threshold: THRESHOLD_POWERUPS, event: "unlock:powerups" },
  { threshold: THRESHOLD_LANES, event: "unlock:lanes" },
  { threshold: THRESHOLD_BOSS_PATTERNS, event: "unlock:bossPatterns" },
];

export class PhaseManager {
  private emitter: Phaser.Events.EventEmitter;
  private unlocked: Set<PhaseEvent> = new Set();

  constructor() {
    this.emitter = new Phaser.Events.EventEmitter();
  }

  on(event: PhaseEvent, callback: () => void): void {
    this.emitter.on(event, callback);
  }

  isUnlocked(event: PhaseEvent): boolean {
    return this.unlocked.has(event);
  }

  colorProgress(score: number): number {
    if (score < THRESHOLD_COLOR_TINT) return 0;
    if (score >= THRESHOLD_FULL_COLOR) return 1;
    return (score - THRESHOLD_COLOR_TINT) / (THRESHOLD_FULL_COLOR - THRESHOLD_COLOR_TINT);
  }

  update(score: number): void {
    for (const m of MILESTONES) {
      if (score >= m.threshold && !this.unlocked.has(m.event)) {
        this.unlocked.add(m.event);
        this.emitter.emit(m.event);
      }
    }
  }

  reset(): void {
    this.unlocked.clear();
  }
}
