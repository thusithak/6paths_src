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
    this.applyTheme(this.isDark);
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

    // Record current state for FLIP animation
    gsap.killTweensOf(toShow);
    gsap.killTweensOf(toHide);

    // Set up elements that will be shown
    toShow.forEach((el) => {
      gsap.set(el, { display: 'inline-block', opacity: 0 });
    });

    // Use FLIP plugin to smoothly animate layout changes
    const flip = gsap.FLIP.getState([...toShow, ...toHide]);

    // Update visibility in DOM
    toHide.forEach((el) => {
      el.style.visibility = 'hidden';
    });

    // Play FLIP animation with opacity transitions
    gsap.FLIP.from(flip, {
      duration: duration / 1000,
      ease: ease,
      onUpdate: () => {
        toShow.forEach((el) => {
          gsap.set(el, { opacity: 1 });
        });
      },
    });

    // Animate opacity for hidden elements
    gsap.to(toHide, {
      opacity: 0,
      duration: duration / 1000,
      ease: ease,
      onComplete: () => {
        toHide.forEach((el) => {
          gsap.set(el, { display: 'none', visibility: 'visible' });
        });
      },
    });
  }

  toggleTheme() {
    this.applyTheme(!this.isDark);
    return this.isDark;
  }
}
