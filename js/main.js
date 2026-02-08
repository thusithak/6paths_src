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
      // If switches are initialized, reflect the change in the UI
      try {
        if (this.soundSwitch) this.soundSwitch.toggle(true);
      } catch (e) {}
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
   * Initialize switches to reflect actual application state (single source of truth)
   */
  setupSwitches() {
    // Theme switch: initialize to current theme state (isDark is source of truth)
    this.themeSwitch = new FrostedSwitch("theme-switch", {
      initialState: this.themeManager.getIsDark(),
      onToggle: (isActive) => {
        this.themeManager.applyTheme(isActive);
        this.splineManager.setVariable("ThemeState", isActive);
        
        // Fade theme sound in/out based on dark theme state
        if (isActive) {
          this.audioManager.fadeInThemeSound();
        } else {
          this.audioManager.fadeOutThemeSound();
        }
      },
    });

    // Sound switch: initialize to opposite of muted state (isMuted is source of truth)
    // Switch ON = audio unmuted, Switch OFF = audio muted
    this.soundSwitch = new FrostedSwitch("sound-switch", {
      initialState: !this.audioManager.isMuted,
      onToggle: (isActive) => {
        const isMuted = !isActive;
        this.audioManager.setMute(isMuted);
      },
    });
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
