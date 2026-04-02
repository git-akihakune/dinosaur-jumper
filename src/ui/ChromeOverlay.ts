import {
  THRESHOLD_COLOR_TINT,
  THRESHOLD_FULL_COLOR,
} from "../config/constants";

export class ChromeOverlay {
  private el: HTMLElement | null;
  private removed = false;

  constructor() {
    this.el = document.getElementById("chrome-overlay");
  }

  update(score: number): void {
    if (this.removed || !this.el) return;

    if (score >= THRESHOLD_FULL_COLOR) {
      this.el.remove();
      this.removed = true;
      return;
    }

    if (score >= THRESHOLD_COLOR_TINT) {
      const progress = (score - THRESHOLD_COLOR_TINT) / (THRESHOLD_FULL_COLOR - THRESHOLD_COLOR_TINT);
      this.el.style.opacity = String(1 - progress);
    }
  }

  reset(): void {
    if (this.removed) return;
    if (this.el) {
      this.el.style.opacity = "1";
    }
  }
}
