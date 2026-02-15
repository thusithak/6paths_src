import { CONFIG } from "./config.js";
import { animateGSAP, fadeElement, safeCall } from "./utils.js";

export class ThemeManager {
  constructor(config = CONFIG) {
    this.config = config;
    this.body = document.body;
    this.savedTheme = localStorage.getItem(this.config.STORAGE.THEME_KEY);
    this.systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    this.isDark = this.savedTheme
      ? this.savedTheme === "dark"
      : this.systemPrefersDark;
    
    // If we're using system preference, immediately save it to localStorage
    if (!this.savedTheme) {
      localStorage.setItem(this.config.STORAGE.THEME_KEY, this.isDark ? "dark" : "light");
    }

    // Listen for system preference changes
    this.setupSystemPreferenceListener();

    this.applyTheme(this.isDark);
  }

  setupSystemPreferenceListener() {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    darkModeQuery.addEventListener("change", (e) => {
      // Only respond to system preference change if user hasn't explicitly set a theme
      const userOverride = localStorage.getItem(this.config.STORAGE.THEME_KEY);
      if (!userOverride) {
        this.applyTheme(e.matches);
        console.log("System theme preference changed; updated to:", e.matches ? "dark" : "light");
      }
    });
  }

  getIsDark() {
    return this.isDark;
  }

  applyTheme(darkModeActive) {
    this.isDark = darkModeActive;
    const theme = darkModeActive ? "dark" : "light";
    this.body.setAttribute("data-theme", theme);
    localStorage.setItem(this.config.STORAGE.THEME_KEY, theme);
    this.updateLogos(darkModeActive);
    this.updateMask(darkModeActive);
  }

  updateLogos(dark) {
    const logoSelectors = this.config.DOM.LOGO_SELECTORS;
    const darkLogos = document.querySelectorAll(logoSelectors.dark);
    const lightLogos = document.querySelectorAll(logoSelectors.light);

    const { duration, ease } = this.config.ANIMATION.LOGO;
    const toShow = dark ? darkLogos : lightLogos;
    const toHide = dark ? lightLogos : darkLogos;
    const durationSeconds = duration / 1000;

    // Kill any existing animations
    gsap.killTweensOf([...toShow, ...toHide]);

    // Create timeline for coordinated animation
    const tl = gsap.timeline();

    // Prepare elements to show (make them visible but invisible)
    gsap.set(toShow, { display: 'inline-block', opacity: 0 });

    // Fade out and hide current logos
    tl.to(
      toHide,
      {
        opacity: 0,
        duration: durationSeconds,
        ease: ease,
      },
      0
    );

    // Fade in new logos (runs in parallel)
    tl.to(
      toShow,
      {
        opacity: 1,
        duration: durationSeconds,
        ease: ease,
      },
      0
    );

    // After animation completes, hide the old logos
    tl.add(() => {
      gsap.set(toHide, { display: 'none' });
    });
  }

  updateMask(dark) {
    const masks = document.querySelectorAll('.mask');
    if (masks.length === 0) return;

    const { duration, ease } = this.config.ANIMATION.LOGO;
    const durationSeconds = duration / 1000;

    // Kill any existing animations on masks
    gsap.killTweensOf(masks);

    // Create timeline for coordinated animation
    const tl = gsap.timeline();

    // Fade out current mask
    tl.to(
      masks,
      {
        opacity: 0,
        duration: durationSeconds,
        ease: ease,
      },
      0
    );

    // Change background image mid-fade
    tl.add(() => {
      masks.forEach((mask) => {
        const newImage = dark
          ? 'url("https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/699163a5cfe2e5e38a40dd34_5561b9136a42a2aeb6752e7cd778cb8a_clip_mask_dark.png")'
          : 'url("https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/698d9d95fae33977cec7254f_241ceb745f610faf74a45a7d6ef4a4b6_clip_mask_light.png")';
        mask.style.backgroundImage = newImage;
      });
    }, durationSeconds / 2);

    // Fade in new mask
    tl.to(
      masks,
      {
        opacity: 1,
        duration: durationSeconds,
        ease: ease,
      },
      durationSeconds / 2
    );
  }

  toggleTheme() {
    this.applyTheme(!this.isDark);
    return this.isDark;
  }
}
