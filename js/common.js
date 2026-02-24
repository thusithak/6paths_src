import "./main.js";

function runAdhocIntegrations() {
  if (
    typeof window.gsap === "undefined" ||
    typeof window.ScrollTrigger === "undefined"
  ) {
    console.warn(
      "GSAP or ScrollTrigger is not available. Skipping ad-hoc integrations.",
    );
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // One timeline to rule them all
  const navTl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: () => `top+=${window.innerHeight * 0.9} top`,
      end: "+=150",
      scrub: 0.5,
      onUpdate: (self) => {
        const navbarContainer = document.querySelector(".navbar-container");
        if (!navbarContainer) return;
        navbarContainer.classList.toggle("scrolled", self.progress > 0.1);
      },
      invalidateOnRefresh: true,
    },
  });

  navTl.to(".navbar-container", {
    maxWidth: "960px",
    duration: 0.5,
  });
}

if (document.readyState === "complete") {
  runAdhocIntegrations();
} else {
  window.addEventListener("load", runAdhocIntegrations, { once: true });
}
