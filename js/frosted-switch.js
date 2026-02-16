import { CONFIG } from "./config.js";
import { animateGSAP, safeCall } from "./utils.js";

export class FrostedSwitch {
  constructor(elementId, options = {}, config = CONFIG) {
    this.config = config;
    this.initializeElements(elementId);
    if (!this.container) {
      console.error(`Switch not found: ${elementId}`);
      return;
    }

    this.configureState(options);
    this.configureAnimation();
    this.initializeVisuals();
    this.setupEventListeners();
    this.setupThemeChangeListener();
  }

  initializeElements(elementId) {
    this.container = document.getElementById(elementId);
    if (!this.container) return;

    this.label = this.container.querySelector(".switch-label");
    this.handle = this.container.querySelector(".switch-handle");
    this.iconLeft = this.container.querySelector(".icon-left");
    this.iconRight = this.container.querySelector(".icon-right");
    this.input = this.container.querySelector('input[type="checkbox"]');
  }

  configureState(options) {
    this.isOn = options.initialState || false;
    this.onToggle = options.onToggle || (() => {});
  }

  configureAnimation() {
    const switchConfig = this.config.ANIMATION.SWITCH;
    this.width = switchConfig.width;
    this.handleSize = switchConfig.handleSize;
    this.padding = switchConfig.handlePadding;
    this.travelDist = switchConfig.travelDistance;
  }

  initializeVisuals() {
    this.setVisualState(this.isOn, 0);
  }

  setupEventListeners() {
    if (this.label) {
      this.label.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggle();
      });
    }
  }

  setupThemeChangeListener() {
    // Watch for data-theme attribute changes on the document element
    const observer = new MutationObserver(() => {
      // Update the icon colors with the new theme values
      this.updateIconColors();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  toggle(forceState) {
    const newState =
      typeof forceState !== "undefined" ? forceState : !this.isOn;

    if (newState === this.isOn) return;

    this.isOn = newState;
    this.syncInput();
    this.onToggle(this.isOn);
    this.setVisualState(this.isOn, 0.5);
  }

  syncInput() {
    if (this.input) {
      this.input.checked = this.isOn;
    }
  }

  setVisualState(active, duration) {
    const xPos = active ? this.travelDist : 0;
    const activeIcon = active ? this.iconRight : this.iconLeft;
    const inactiveIcon = active ? this.iconLeft : this.iconRight;

    this.animateHandle(xPos, duration);
    this.animateActiveIcon(activeIcon, duration);
    this.animateInactiveIcon(inactiveIcon, duration);
  }

  animateHandle(xPos, duration) {
    if (window.gsap && this.handle) {
      const { ease } = this.config.ANIMATION.SWITCH.toggle;
      animateGSAP(this.handle, duration, ease, { x: xPos });
    }
  }

  getCSSVariable(varName) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  }

  updateIconColors() {
    // Determine which icons are currently active/inactive
    const activeIcon = this.isOn ? this.iconRight : this.iconLeft;
    const inactiveIcon = this.isOn ? this.iconLeft : this.iconRight;

    // Kill existing animations
    if (window.gsap) {
      if (activeIcon) gsap.killTweensOf(activeIcon);
      if (inactiveIcon) gsap.killTweensOf(inactiveIcon);
    }

    // Apply the new theme colors directly
    if (activeIcon) {
      const activeColor = this.getCSSVariable("--switch-icon-active-color");
      const activeShadow = this.getCSSVariable("--switch-icon-active-shadow");
      activeIcon.style.color = activeColor;
      activeIcon.style.filter = `drop-shadow(0 0 6px ${activeShadow})`;
    }

    if (inactiveIcon) {
      const inactiveColor = this.getCSSVariable("--switch-icon-inactive-color");
      const inactiveShadow = this.getCSSVariable(
        "--switch-icon-inactive-shadow",
      );
      inactiveIcon.style.color = inactiveColor;
      inactiveIcon.style.filter = `drop-shadow(0 1px 2px ${inactiveShadow})`;
    }
  }

  animateActiveIcon(icon, duration) {
    if (window.gsap && icon) {
      const { duration: iconDuration, delay } =
        this.config.ANIMATION.SWITCH.icon;
      const activeColor = this.getCSSVariable("--switch-icon-active-color");
      const activeShadow = this.getCSSVariable("--switch-icon-active-shadow");
      animateGSAP(
        icon,
        iconDuration,
        "power1.inOut",
        {
          color: activeColor,
          filter: `drop-shadow(0 0 6px ${activeShadow})`,
        },
        {
          onStart: () => {
            if (duration > 0) {
              icon.style.transitionDelay = `${delay}s`;
            }
          },
        },
      );
    }
  }

  animateInactiveIcon(icon, duration) {
    if (window.gsap && icon) {
      const { duration: iconDuration } = this.config.ANIMATION.SWITCH.icon;
      const inactiveColor = this.getCSSVariable("--switch-icon-inactive-color");
      const inactiveShadow = this.getCSSVariable(
        "--switch-icon-inactive-shadow",
      );
      animateGSAP(icon, iconDuration, "power1.inOut", {
        color: inactiveColor,
        filter: `drop-shadow(0 1px 2px ${inactiveShadow})`,
      });
    }
  }
}
