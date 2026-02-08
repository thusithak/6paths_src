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

  toggleTheme() {
    this.applyTheme(!this.isDark);
    return this.isDark;
  }
}
