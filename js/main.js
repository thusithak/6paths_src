/**
 * Main Entry Point - Orchestrates all modules
 * Handles initialization and coordination between components
 */

import { FrostedSwitch } from "./frosted-switch.js";
import { ThemeManager } from "./theme-manager.js";
import { AudioManager } from "./audio-manager.js";
import { SplineManager } from "./spline-manager.js";
import { SceneLoader } from "./scene-loader.js";

class Application {
  constructor() {
    this.themeManager = new ThemeManager();
    this.audioManager = new AudioManager();
    this.sceneLoader = new SceneLoader("canvas3d", "loader-overlay");
    this.splineManager = new SplineManager("canvas3d");
    this.themeSwitch = null;
    this.soundSwitch = null;
  }

  /**
   * Initialize application when DOM is ready
   */
  async initialize() {
    this.setupUI();
    await this.loadScene();
    this.setupSwitches();
  }

  /**
   * Setup initial UI state
   */
  setupUI() {
    this.sceneLoader.initializeLoader();
    this.themeManager.applyTheme(this.themeManager.getIsDark());
    this.sceneLoader.onLoaderClick(() => {
      this.audioManager.setMute(false);
      this.audioManager.playWithDelay("background", 500);
    });
  }

  /**
   * Load Spline 3D scene
   */
  async loadScene() {
    try {
      const SCENE_URL =
        "https://prod.spline.design/At-lvMDyYgqgQz2B/scene.splinecode";
      await this.splineManager.load(SCENE_URL);

      // Sync initial theme with Spline
      this.splineManager.ensureSync(this.themeManager.getIsDark());

      // Schedule scene reveal
      setTimeout(() => {
        this.splineManager.ensureSync(this.themeManager.getIsDark());
        this.sceneLoader.revealScene();
      }, this.sceneLoader.getSettlingDelay());
    } catch (error) {
      console.error("Failed to initialize scene:", error);
    }
  }

  /**
   * Setup theme and sound toggle switches
   */
  setupSwitches() {
    this.themeSwitch = new FrostedSwitch("theme-switch", {
      onToggle: (isActive) => {
        this.themeManager.applyTheme(isActive);
        this.splineManager.setVariable("ThemeState", isActive);
      },
    });

    this.soundSwitch = new FrostedSwitch("sound-switch", {
      onToggle: (isActive) => {
        const isMuted = !isActive;
        this.audioManager.setMute(isMuted);
      },
    });

    // Initialize sound switch to off
    this.soundSwitch.toggle(false);
  }

  /**
   * Get manager instances (for debugging/external access)
   */
  getManagers() {
    return {
      theme: this.themeManager,
      audio: this.audioManager,
      spline: this.splineManager,
      loader: this.sceneLoader,
    };
  }
}

// Initialize application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new Application();
  app.initialize();

  // Expose app for debugging if needed
  window.__app = app;
});
