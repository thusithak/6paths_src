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

  const navTl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      toggleClass: { targets: ".main-nav", className: "scrolled" },
      start: () => `top+=${window.innerHeight * 0.9} top`,
      end: "+=200",
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  navTl
    .to(".main-nav", {
      backgroundColor: "transparent",
      borderColor: "transparent",
      duration: 1,
    })
    .to(
      ".navbar-container",
      {
        maxWidth: "960px",
        backgroundColor: "#000000",
        duration: 1,
      },
      0,
    );
}

if (document.readyState === "complete") {
  runAdhocIntegrations();
} else {
  window.addEventListener("load", runAdhocIntegrations, { once: true });
}
