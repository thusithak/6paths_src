/**
 * FrostedSwitch - An animated toggle switch component
 * Handles state management and smooth animations
 */
export class FrostedSwitch {
  constructor(elementId, options = {}) {
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
   * Configure animation parameters
   */
  configureAnimation() {
    this.width = 90;
    this.handleSize = 34;
    this.padding = 8;
    this.travelDist = this.width - this.handleSize - this.padding - 2;
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
      gsap.to(this.handle, {
        x: xPos,
        duration: duration,
        ease: "back.out(1.7)",
      });
    }
  }

  /**
   * Animate active icon (glow)
   */
  animateActiveIcon(icon, duration) {
    if (window.gsap && icon) {
      gsap.to(icon, {
        color: "rgba(255,255,255,1)",
        filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))",
        duration: 0.3,
        delay: duration > 0 ? 0.1 : 0,
      });
    }
  }

  /**
   * Animate inactive icon (dim)
   */
  animateInactiveIcon(icon, duration) {
    if (window.gsap && icon) {
      gsap.to(icon, {
        color: "rgba(255,255,255,0.4)",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
        duration: 0.3,
      });
    }
  }
}
