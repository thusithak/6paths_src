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

  toggleTheme() {
    this.applyTheme(!this.isDark);
    return this.isDark;
  }
}
