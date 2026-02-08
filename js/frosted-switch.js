/**
 * FrostedSwitch - An animated toggle switch component
 * Handles state management and smooth GSAP animations
 * Dependencies: CONFIG, utils
 */

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
  }

  /**
   * Query and cache DOM elements
   */
  initializeElements(elementId) {
    this.container = document.getElementById(elementId);
    if (!this.container) return;

    this.label = this.container.querySelector(".switch-label");
    this.handle = this.container.querySelector(".switch-handle");
    this.iconLeft = this.container.querySelector(".icon-left");
    this.iconRight = this.container.querySelector(".icon-right");
    this.input = this.container.querySelector('input[type="checkbox"]');
  }

  /**
   * Set initial state and callback
   */
  configureState(options) {
    this.isOn = options.initialState || false;
    this.onToggle = options.onToggle || (() => {});
  }

  /**
   * Configure animation parameters from CONFIG
   */
  configureAnimation() {
    const switchConfig = this.config.ANIMATION.SWITCH;
    this.width = switchConfig.width;
    this.handleSize = switchConfig.handleSize;
    this.padding = switchConfig.handlePadding;
    this.travelDist = switchConfig.travelDistance;
  }

  /**
   * Set initial visual state without animation
   */
  initializeVisuals() {
    this.setVisualState(this.isOn, 0);
  }

  /**
   * Attach click listener to toggle
   */
  setupEventListeners() {
    if (this.label) {
      this.label.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggle();
      });
    }
  }

  /**
   * Toggle the switch state
   */
  toggle(forceState) {
    const newState =
      typeof forceState !== "undefined" ? forceState : !this.isOn;
    
    if (newState === this.isOn) return;

    this.isOn = newState;
    this.syncInput();
    this.onToggle(this.isOn);
    this.setVisualState(this.isOn, 0.5);
  }

  /**
   * Update associated input element
   */
  syncInput() {
    if (this.input) {
      this.input.checked = this.isOn;
    }
  }

  /**
   * Animate handle and icons based on state
   */
  setVisualState(active, duration) {
    const xPos = active ? this.travelDist : 0;
    const activeIcon = active ? this.iconRight : this.iconLeft;
    const inactiveIcon = active ? this.iconLeft : this.iconRight;

    this.animateHandle(xPos, duration);
    this.animateActiveIcon(activeIcon, duration);
    this.animateInactiveIcon(inactiveIcon, duration);
  }

  /**
   * Animate handle position
   */
  animateHandle(xPos, duration) {
    if (window.gsap && this.handle) {
      const { ease } = this.config.ANIMATION.SWITCH.toggle;
      animateGSAP(this.handle, duration, ease, { x: xPos });
    }
  }

  /**
   * Animate active icon (glow)
   */
  animateActiveIcon(icon, duration) {
    if (window.gsap && icon) {
      const { duration: iconDuration, delay } = this.config.ANIMATION.SWITCH.icon;
      animateGSAP(icon, iconDuration, "power1.inOut", {
        color: "rgba(255,255,255,1)",
        filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))",
      }, {
        onStart: () => {
          if (duration > 0) {
            icon.style.transitionDelay = `${delay}s`;
          }
        },
      });
    }
  }

  /**
   * Animate inactive icon (dim)
   */
  animateInactiveIcon(icon, duration) {
    if (window.gsap && icon) {
      const { duration: iconDuration } = this.config.ANIMATION.SWITCH.icon;
      animateGSAP(icon, iconDuration, "power1.inOut", {
        color: "rgba(255,255,255,0.4)",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
      });
    }
  }
}
