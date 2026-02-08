/**
 * ThemeManager - Handles theme persistence and application
 * Supports dark and light themes with persistent storage
 * Dependencies: CONFIG, utils
 */

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
    // Apply the theme and update logos on initialization
    this.applyTheme(this.isDark);
  }

  /**
   * Get current theme state
   */
  getIsDark() {
    return this.isDark;
  }

  /**
   * Apply theme to DOM and persist preference
   */
  applyTheme(darkModeActive) {
    this.isDark = darkModeActive;
    const theme = darkModeActive ? "dark" : "light";
    this.body.setAttribute("data-theme", theme);
    localStorage.setItem(this.config.STORAGE.THEME_KEY, theme);
    this.updateLogos(darkModeActive);
  }

  /**
   * Update logos with fade transitions.
   * - When light: fade in `.logo-img-black` (display -> inline-block)
   * - When dark: fade in `.logo-img-blue` and fade out `.logo-img-black`
   */
  updateLogos(dark) {
    const logoSelectors = this.config.DOM.LOGO_SELECTORS;
    const darkLogos = document.querySelectorAll(logoSelectors.dark);
    const lightLogos = document.querySelectorAll(logoSelectors.light);

    const { duration, ease } = this.config.ANIMATION.LOGO;

    if (window.gsap) {
      const show = (el) => {
        if (!el) return;
        gsap.killTweensOf(el);
        gsap.set(el, { display: 'inline-block', opacity: 0 });
        animateGSAP(el, duration, ease, { opacity: 1 });
      };

      const hide = (el) => {
        if (!el) return;
        gsap.killTweensOf(el);
        animateGSAP(el, duration, ease, { opacity: 0 }, {
          onComplete: () => gsap.set(el, { display: 'none' }),
        });
      };

      if (dark) {
        darkLogos.forEach((el) => show(el));
        lightLogos.forEach((el) => hide(el));
      } else {
        lightLogos.forEach((el) => show(el));
        darkLogos.forEach((el) => hide(el));
      }
    } else {
      // Fallback to CSS-based transitions if GSAP isn't available
      const durationMs = duration * 1000;
      
      const fadeIn = (el) => {
        if (!el) return;
        el.style.transition = `opacity ${durationMs}ms ease`;
        el.style.display = 'inline-block';
        el.style.opacity = '0';
        requestAnimationFrame(() => (el.style.opacity = '1'));
      };

      const fadeOut = (el) => {
        if (!el) return;
        if (getComputedStyle(el).display === 'none') return;
        el.style.transition = `opacity ${durationMs}ms ease`;
        el.style.opacity = '0';
        const onEnd = () => {
          el.style.display = 'none';
          el.removeEventListener('transitionend', onEnd);
        };
        el.addEventListener('transitionend', onEnd, { once: true });
      };

      if (dark) {
        darkLogos.forEach((el) => fadeIn(el));
        lightLogos.forEach((el) => fadeOut(el));
      } else {
        lightLogos.forEach((el) => fadeIn(el));
        darkLogos.forEach((el) => fadeOut(el));
      }
    }
  }

  /**
   * Toggle theme and return new state
   */
  toggleTheme() {
    this.applyTheme(!this.isDark);
    return this.isDark;
  }
}
