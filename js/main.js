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

  runAdhocIntegrations() {
    // GSAP/ScrollTrigger integrations and event listeners
    if (
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    ) {
      console.warn(
        "GSAP or ScrollTrigger is not available. Skipping ad-hoc integrations.",
      );
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const navTl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: () => `top+=${window.innerHeight * 0.8} top`,
        end: "+=100",
        scrub: 0.7,
        onUpdate: (self) => {
          const navbarContainer = document.querySelector(".navbar-container");
          if (!navbarContainer) return;
          navbarContainer.classList.toggle("scrolled", self.progress > 0.1);
        },
        invalidateOnRefresh: true,
      },
    });

    navTl.to(".navbar-container", {
      maxWidth: "960px",
      duration: 0.5,
    });

    this.attachGlobalEvents();
  }

  attachGlobalEvents() {
    // Tooltip events
    document.addEventListener(
      "mouseenter",
      (e) => {
        if (!(e.target instanceof Element)) return;
        const trigger = e.target.closest("[data-tooltip]");
        if (!trigger) return;
        const tooltip = document.getElementById("tooltip");
        if (!tooltip) return;
        tooltip.innerHTML = trigger.getAttribute("data-tooltip");
        tooltip.className = "funky-tooltip";
        const activeThemeClass = Array.from(trigger.classList).find((cls) =>
          cls.startsWith("theme-")
        );
        if (activeThemeClass) {
          tooltip.classList.add(`tooltip-${activeThemeClass}`);
        }
        gsap.set(tooltip, {
          x: e.clientX - 0,
          y: e.clientY - 50,
        });
        gsap.to(tooltip, {
          scale: 1,
          opacity: 1,
          rotation: gsap.utils.random(-15, 5),
          duration: 0.8,
          ease: "elastic.out(1.2, 0.4)",
          overwrite: "auto",
        });
      },
      true
    );

    document.addEventListener(
      "mousemove",
      (e) => {
        if (!(e.target instanceof Element)) return;
        const trigger = e.target.closest("[data-tooltip]");
        if (!trigger) return;
        const tooltip = document.getElementById("tooltip");
        if (!tooltip) return;
        if (!window._moveX || !window._moveY) {
          window._moveX = gsap.quickTo(tooltip, "x", {
            duration: 0.15,
            ease: "power3.out",
          });
          window._moveY = gsap.quickTo(tooltip, "y", {
            duration: 0.15,
            ease: "power3.out",
          });
        }
        window._moveX(e.clientX - 0);
        window._moveY(e.clientY - 50);
      },
      true
    );

    document.addEventListener(
      "mouseleave",
      (e) => {
        if (!(e.target instanceof Element)) return;
        const trigger = e.target.closest("[data-tooltip]");
        if (!trigger) return;
        const tooltip = document.getElementById("tooltip");
        if (!tooltip) return;
        gsap.to(tooltip, {
          scale: 0,
          opacity: 0,
          rotation: 0,
          duration: 0.3,
          ease: "back.in(1.5)",
          overwrite: "auto",
        });
      },
      true
    );

    // Jump animation for images with class "app_logo_list img"
    document.addEventListener(
      "mouseenter",
      (e) => {
        if (!(e.target instanceof Element)) return;
        const img = e.target.closest(".app_logo_list img");
        if (!img) return;
        gsap.set(img, { transformOrigin: "50% 100%" });
        const tl = gsap.timeline();
        tl.to(img, {
          duration: 0.1,
          scaleX: 1.05,
          scaleY: 0.95,
          ease: "power1.inOut",
        })
          .to(img, {
            duration: 0.1,
            y: -20, // Height of the jump
            scaleX: 0.8,
            scaleY: 1.2,
            ease: "power2.out",
          })
          .to(img, {
            duration: 0.1,
            y: 0,
            scaleX: 1.1,
            scaleY: 0.9,
            ease: "power2.in",
          })
          .to(img, {
            duration: 0.2,
            scaleX: 1,
            scaleY: 1,
            ease: "elastic.out(1, 0.3)", // The "jello" settle effect
          });
      },
      true
    );
  }
}


function startApp() {
  const app = new Application();
  app
    .initialize()
    .then(() => {
      app.runAdhocIntegrations();
    })
    .catch((err) => console.error("App initialization failed:", err));

  window.__app = app;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
