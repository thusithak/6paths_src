/**
 * SceneLoader - Handles 3D scene reveal and loading animation
 * Manages loader overlay and canvas transitions
 * Dependencies: CONFIG, utils
 */

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

  /**
   * Initialize loader UI
   */
  initializeLoader() {
    if (this.loader) {
      this.loader.style.opacity = "1";
    }
  }

  /**
   * Show canvas and hide loader with transition
   */
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

  /**
   * Get settling delay for scene initialization
   */
  getSettlingDelay() {
    return this.SETTLING_DELAY;
  }

  /**
   * Check if this is a repeat visit
   */
  getIsRepeatVisit() {
    return this.isRepeatVisit;
  }

  /**
   * Attach click listener to loader (enable audio)
   */
  onLoaderClick(callback) {
    if (this.loader) {
      this.loader.addEventListener("click", callback);
    }
  }
}
