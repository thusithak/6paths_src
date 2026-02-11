

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Create the smoother instance
let smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1.5,               // Time (seconds) it takes to "catch up" to the scroll
  effects: true,             // Look for data-speed and data-lag attributes
  smoothTouch: 0.1,          // Optional: enable smooth scroll on touch devices
});