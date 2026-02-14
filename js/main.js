import { CONFIG } from "./config.js";
import { FrostedSwitch } from "./frosted-switch.js";
import { ThemeManager } from "./theme-manager.js";
import { AudioManager } from "./audio-manager.js";
import { SplineManager } from "./spline-manager.js";
import { SceneLoader } from "./scene-loader.js";

class Application {
  constructor(config = CONFIG) {
    this.config = config;
    this.themeManager = new ThemeManager(config);
    this.audioManager = new AudioManager(config);
    this.sceneLoader = new SceneLoader(config.DOM.CANVAS_ID, config.DOM.LOADER_ID, config);
    this.splineManager = new SplineManager(config.DOM.CANVAS_ID, config);
    this.themeSwitch = null;
    this.soundSwitch = null;
  }

  async initialize() {
    this.setupUI();
    // Initialize switches early so loader clicks can update their visuals
    // even if the scene hasn't finished loading yet.
    this.setupSwitches();
    await this.loadScene();
  }

  setupUI() {
    this.sceneLoader.initializeLoader();
    this.themeManager.applyTheme(this.themeManager.getIsDark());
    this.sceneLoader.onLoaderClick(() => {
      // Unlock audio playback immediately (requires user gesture like click)
      this.audioManager.unlockAudioPlayback();
      // Unmute and enable audio
      this.audioManager.setMute(false);
      // If switches are initialized, reflect the change in the UI
      try {
        if (this.soundSwitch) this.soundSwitch.toggle(true);
      } catch (e) {}
    });
    
    // Fallback: unlock audio on any page click if not already unlocked
    // This ensures audio can be controlled even if user clicks page after loading
    document.addEventListener('click', () => {
      if (!this.audioManager.audioUnlocked) {
        this.audioManager.unlockAudioPlayback();
      }
    }, { once: true });
  }

  async loadScene() {
    try {
      await this.splineManager.load(this.config.SPLINE.SCENE_URL);

      const appTheme = this.themeManager.getIsDark();

      // Ensure audio matches the current theme
      if (appTheme) {
        this.audioManager.fadeInThemeSound();
      } else {
        this.audioManager.fadeOutThemeSound();
      }

      // Use a delay to ensure Spline's variable system is fully initialized
      // Then sync the theme state from app to Spline
      setTimeout(() => {
        this.splineManager.ensureSync(appTheme);
      }, 200);

      // Schedule scene reveal
      setTimeout(() => {
        // Re-sync to ensure consistency
        this.splineManager.ensureSync(this.themeManager.getIsDark());
        console.log("Scene loaded and synced with theme state.");
        this.sceneLoader.revealScene();
      }, this.sceneLoader.getSettlingDelay());
    } catch (error) {
      console.error("Failed to initialize scene:", error);
    }
  }

  setupSwitches() {
    // Theme switch: initialize to current theme state (isDark is source of truth)
    this.themeSwitch = new FrostedSwitch(
      this.config.DOM.SWITCH_IDS.theme,
      {
        initialState: this.themeManager.getIsDark(),
        onToggle: (isActive) => {
          this.themeManager.applyTheme(isActive);
          // Use ensureSync for properly validated variable setting
          this.splineManager.ensureSync(isActive);
          
          // Fade theme sound in/out based on dark theme state
          if (isActive) {
            this.audioManager.fadeInThemeSound();
          } else {
            this.audioManager.fadeOutThemeSound();
          }
        },
      },
      this.config
    );

    // Sound switch: initialize to opposite of muted state (isMuted is source of truth)
    // Switch ON = audio unmuted, Switch OFF = audio muted
    this.soundSwitch = new FrostedSwitch(
      this.config.DOM.SWITCH_IDS.sound,
      {
        initialState: !this.audioManager.isMuted,
        onToggle: (isActive) => {
          const isMuted = !isActive;
          this.audioManager.setMute(isMuted);
        },
      },
      this.config
    );
  }

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
function startApp() {
  const app = new Application();
  // Ensure we surface initialization errors
  app.initialize().catch((err) => console.error("App initialization failed:", err));

  // Expose app for debugging if needed
  window.__app = app;
}

// If the DOM is already ready, start immediately; otherwise wait for the event.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
