/**
 * ThemeManager - Handles theme persistence and application
 */
export class ThemeManager {
  constructor() {
    this.body = document.body;
    this.savedTheme = localStorage.getItem("theme");
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
    localStorage.setItem("theme", theme);
    this.updateLogos(darkModeActive);
  }

  /**
   * Update logos with fade transitions.
   * - When light: fade in `.logo-img-black` (display -> inline-block)
   * - When dark: fade in `.logo-img-blue` and fade out `.logo-img-black`
   */
  updateLogos(dark) {
    const blackLogos = document.querySelectorAll('.logo-img-black');
    const blueLogos = document.querySelectorAll('.logo-img-blue');

    const duration = 0.24;

    if (window.gsap) {
      const show = (el) => {
        if (!el) return;
        gsap.killTweensOf(el);
        gsap.set(el, { display: 'inline-block', opacity: 0 });
        gsap.to(el, { duration, opacity: 1, ease: 'power1.out' });
      };

      const hide = (el) => {
        if (!el) return;
        gsap.killTweensOf(el);
        gsap.to(el, {
          duration,
          opacity: 0,
          ease: 'power1.out',
          onComplete: () => gsap.set(el, { display: 'none' }),
        });
      };

      if (dark) {
        blueLogos.forEach((el) => show(el));
        blackLogos.forEach((el) => hide(el));
      } else {
        blackLogos.forEach((el) => show(el));
        blueLogos.forEach((el) => hide(el));
      }
    } else {
      // Fallback to CSS-based transitions if GSAP isn't available
      const fadeIn = (el) => {
        if (!el) return;
        el.style.transition = `opacity ${duration * 1000}ms ease`;
        el.style.display = 'inline-block';
        el.style.opacity = '0';
        requestAnimationFrame(() => (el.style.opacity = '1'));
      };

      const fadeOut = (el) => {
        if (!el) return;
        if (getComputedStyle(el).display === 'none') return;
        el.style.transition = `opacity ${duration * 1000}ms ease`;
        el.style.opacity = '0';
        const onEnd = () => {
          el.style.display = 'none';
          el.removeEventListener('transitionend', onEnd);
        };
        el.addEventListener('transitionend', onEnd, { once: true });
      };

      if (dark) {
        blueLogos.forEach((el) => fadeIn(el));
        blackLogos.forEach((el) => fadeOut(el));
      } else {
        blackLogos.forEach((el) => fadeIn(el));
        blueLogos.forEach((el) => fadeOut(el));
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
