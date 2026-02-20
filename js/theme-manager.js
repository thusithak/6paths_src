import { CONFIG } from "./config.js";
import { animateGSAP, fadeElement, safeCall } from "./utils.js";

export class ThemeManager {
  constructor(config = CONFIG) {
    this.config = config;
    this.body = document.body;
    this.savedTheme = localStorage.getItem(this.config.STORAGE.THEME_KEY);
    this.systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    this.isDark = this.savedTheme
      ? this.savedTheme === "dark"
      : this.systemPrefersDark;

    if (!this.savedTheme) {
      localStorage.setItem(
        this.config.STORAGE.THEME_KEY,
        this.isDark ? "dark" : "light",
      );
    }

    this.setupSystemPreferenceListener();

    this.applyTheme(this.isDark);
  }

  setupSystemPreferenceListener() {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    darkModeQuery.addEventListener("change", (e) => {
      const userOverride = localStorage.getItem(this.config.STORAGE.THEME_KEY);
      if (!userOverride) {
        this.applyTheme(e.matches);
        console.log(
          "System theme preference changed; updated to:",
          e.matches ? "dark" : "light",
        );
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

    gsap.killTweensOf([...toShow, ...toHide]);

    const tl = gsap.timeline();

    gsap.set(toShow, { display: "inline-block", opacity: 0 });

    tl.to(
      toHide,
      {
        opacity: 0,
        duration: durationSeconds,
        ease: ease,
      },
      0,
    );

    tl.to(
      toShow,
      {
        opacity: 1,
        duration: durationSeconds,
        ease: ease,
      },
      0,
    );

    tl.add(() => {
      gsap.set(toHide, { display: "none" });
    });
  }

  updateMask(dark) {
    const masks = document.querySelectorAll(".mask");
    if (masks.length === 0) return;

    const { duration, ease } = this.config.ANIMATION.LOGO;
    const durationSeconds = duration / 1000;

    gsap.killTweensOf(masks);

    const tl = gsap.timeline();

    tl.to(
      masks,
      {
        opacity: 0,
        duration: durationSeconds,
        ease: ease,
      },
      0,
    );

    tl.add(() => {
      masks.forEach((mask) => {
        const newImage = dark
          ? 'url("https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/699163a5cfe2e5e38a40dd34_5561b9136a42a2aeb6752e7cd778cb8a_clip_mask_dark.png")'
          : 'url("https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/698d9d95fae33977cec7254f_8fceb39423dab8918c2b51fcd80d5ed5_clip_mask_light.png")';
        mask.style.backgroundImage = newImage;
      });
    }, durationSeconds / 2);

    tl.to(
      masks,
      {
        opacity: 1,
        duration: durationSeconds,
        ease: ease,
      },
      durationSeconds / 2,
    );
  }

  toggleTheme() {
    this.applyTheme(!this.isDark);
    return this.isDark;
  }
}
