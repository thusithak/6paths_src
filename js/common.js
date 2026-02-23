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
      onEnter: () =>
        document.querySelector(".main-nav").classList.add("scrolled"),
      onLeaveBack: () =>
        document.querySelector(".main-nav").classList.remove("scrolled"),
      invalidateOnRefresh: true,
    },
  });

  navTl
    .to(".main-nav", {
      backgroundColor: "rgba(255, 255, 255, 0)", // transparent
      borderColor: "rgba(0, 0, 0, 0)", // transparent
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
