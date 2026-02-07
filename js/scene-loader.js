/**
 * SceneLoader - Handles 3D scene reveal and loading animation
 */
export class SceneLoader {
  constructor(canvasId, loaderOverlayId) {
    this.canvas = document.getElementById(canvasId);
    this.loader = document.getElementById(loaderOverlayId);
    this.sceneRevealed = false;
    this.isRepeatVisit = sessionStorage.getItem("splineSceneLoaded") === "true";
    this.SETTLING_DELAY = this.isRepeatVisit ? 100 : 2000;
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

    // Fade in canvas
    this.canvas.style.opacity = "1";

    // Schedule loader removal
    setTimeout(() => {
      this.loader.style.transition = this.isRepeatVisit
        ? "opacity 0.2s ease"
        : "opacity 0.8s ease";
      this.loader.style.opacity = "0";

      setTimeout(() => {
        this.loader.style.display = "none";
      }, this.isRepeatVisit ? 100 : 800);
    }, 500);
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
