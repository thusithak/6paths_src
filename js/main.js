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
    this.sceneLoader = new SceneLoader(
      config.DOM.CANVAS_ID,
      config.DOM.LOADER_ID,
      config,
    );
    this.splineManager = new SplineManager(config.DOM.CANVAS_ID, config);
    this.themeSwitch = null;
    this.soundSwitch = null;
  }

  async initialize() {
    this.setupUI();
    this.setupSwitches();
    await this.loadScene();
  }

  setupUI() {
    this.sceneLoader.initializeLoader();
    this.themeManager.applyTheme(this.themeManager.getIsDark());
    this.sceneLoader.onLoaderClick(() => {
      this.audioManager.unlockAudioPlayback();
      this.audioManager.setMute(false);
      try {
        if (this.soundSwitch) this.soundSwitch.toggle(true);
      } catch (e) {}
    });

    document.addEventListener(
      "click",
      () => {
        if (!this.audioManager.audioUnlocked) {
          this.audioManager.unlockAudioPlayback();
        }
      },
      { once: true },
    );
  }

  async loadScene() {
    try {
      await this.splineManager.load(this.config.SPLINE.SCENE_URL);

      const appTheme = this.themeManager.getIsDark();

      if (appTheme) {
        this.audioManager.fadeInThemeSound();
      } else {
        this.audioManager.fadeOutThemeSound();
      }

      setTimeout(() => {
        this.splineManager.ensureSync(appTheme);
      }, 200);

      setTimeout(() => {
        this.splineManager.ensureSync(this.themeManager.getIsDark());
        console.log("Scene loaded and synced with theme state.");
        this.sceneLoader.revealScene();
      }, this.sceneLoader.getSettlingDelay());
    } catch (error) {
      console.error("Failed to initialize scene:", error);
    }
  }

  setupSwitches() {
    this.themeSwitch = new FrostedSwitch(
      this.config.DOM.SWITCH_IDS.theme,
      {
        initialState: this.themeManager.getIsDark(),
        onToggle: (isActive) => {
          this.themeManager.applyTheme(isActive);
          this.splineManager.ensureSync(isActive);

          if (isActive) {
            this.audioManager.fadeInThemeSound();
          } else {
            this.audioManager.fadeOutThemeSound();
          }
        },
      },
      this.config,
    );

    this.soundSwitch = new FrostedSwitch(
      this.config.DOM.SWITCH_IDS.sound,
      {
        initialState: !this.audioManager.isMuted,
        onToggle: (isActive) => {
          const isMuted = !isActive;
          this.audioManager.setMute(isMuted);
        },
      },
      this.config,
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

function startApp() {
  const app = new Application();
  app
    .initialize()
    .catch((err) => console.error("App initialization failed:", err));

  window.__app = app;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
