import { CONFIG } from "./config.js";
import { validateDOM, safeCall } from "./utils.js";

export class SceneLoader {
  constructor(canvasId, loaderOverlayId, config = CONFIG) {
    this.config = config;
    this.canvas = validateDOM(canvasId) || document.getElementById(canvasId);
    this.loader = validateDOM(loaderOverlayId) || document.getElementById(loaderOverlayId);
    this.sceneRevealed = false;
    this.isRepeatVisit = sessionStorage.getItem(this.config.STORAGE.SCENE_LOADED_KEY) === "true";
    this.SETTLING_DELAY = this.isRepeatVisit 
      ? this.config.ANIMATION.SCENE.repeatVisitDelay
      : this.config.ANIMATION.SCENE.firstVisitDelay;
  }

  initializeLoader() {
    if (this.loader) {
      this.loader.style.opacity = "1";
    }
  }

  revealScene() {
    if (this.sceneRevealed || !this.canvas || !this.loader) return;

    this.sceneRevealed = true;

    safeCall(() => {
      // Fade in canvas
      this.canvas.style.opacity = "1";

      // Schedule loader removal
      setTimeout(() => {
        const fadeDuration = this.isRepeatVisit
          ? this.config.ANIMATION.SCENE.loaderFadeRepeat
          : this.config.ANIMATION.SCENE.loaderFadeFirst;
        this.loader.style.transition = `opacity ${fadeDuration}s ease`;
        this.loader.style.opacity = "0";

        setTimeout(() => {
          this.loader.style.display = "none";
        }, fadeDuration * 1000);
      }, this.config.ANIMATION.SCENE.loaderHideDelay);
    });
  }

  getSettlingDelay() {
    return this.SETTLING_DELAY;
  }

  getIsRepeatVisit() {
    return this.isRepeatVisit;
  }

  onLoaderClick(callback) {
    if (this.loader) {
      this.loader.addEventListener("click", callback);
    }
  }
}
