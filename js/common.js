import "./main.js";

function runAdhocIntegrations() {
  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
    console.warn("GSAP or ScrollTrigger is not available. Skipping ad-hoc integrations.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.to(".main-nav", {
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "+=50",
      scrub: true,
    },
    backgroundColor: "transparent",
    borderColor: "transparent",
    ease: "none",
  });

  gsap.to(".navbar-container", {
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "+=50",
      scrub: true,
    },
    maxWidth: "960px",
    backgroundColor: "#000000",
    ease: "none",
  });
}

if (document.readyState === "complete") {
  runAdhocIntegrations();
} else {
  window.addEventListener("load", runAdhocIntegrations, { once: true });
}
