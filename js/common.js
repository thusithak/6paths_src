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
      start: () => `top+=${window.innerHeight * 0.8} top`,
      end: "+=100",
      scrub: 0.7,
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

  //funky tooltip, use with data-tooltip attribute on any element to show tooltip text on hover
  const tooltip = document.getElementById("tooltip");
  const moveX = gsap.quickTo(tooltip, "x", {
    duration: 0.15,
    ease: "power3.out",
  });
  const moveY = gsap.quickTo(tooltip, "y", {
    duration: 0.15,
    ease: "power3.out",
  });

  // Use event delegation for dynamic elements
  document.addEventListener("mouseenter", (e) => {
    const trigger = e.target.closest("[data-tooltip]");
    if (!trigger) return;

    tooltip.innerHTML = trigger.getAttribute("data-tooltip");
    tooltip.className = "funky-tooltip";
    const activeThemeClass = Array.from(trigger.classList).find((cls) =>
      cls.startsWith("theme-"),
    );
    if (activeThemeClass) {
      tooltip.classList.add(`tooltip-${activeThemeClass}`);
    }
    gsap.set(tooltip, {
      x: e.clientX - 0,
      y: e.clientY - 50,
    });
    gsap.to(tooltip, {
      scale: 1,
      opacity: 1,
      rotation: gsap.utils.random(-15, 5),
      duration: 0.8,
      ease: "elastic.out(1.2, 0.4)",
      overwrite: "auto",
    });
  }, true);

  document.addEventListener("mousemove", (e) => {
    const trigger = e.target.closest("[data-tooltip]");
    if (!trigger) return;
    moveX(e.clientX - 0);
    moveY(e.clientY - 50);
  }, true);

  document.addEventListener("mouseleave", (e) => {
    const trigger = e.target.closest("[data-tooltip]");
    if (!trigger) return;
    gsap.to(tooltip, {
      scale: 0,
      opacity: 0,
      rotation: 0,
      duration: 0.3,
      ease: "back.in(1.5)",
      overwrite: "auto",
    });
  }, true);
}

if (document.readyState === "complete") {
  runAdhocIntegrations();
} else {
  window.addEventListener("load", runAdhocIntegrations, { once: true });
}

// Jump animation for images with class "app_logo_list img" - using event delegation
document.addEventListener("mouseenter", (e) => {
  const img = e.target.closest(".app_logo_list img");
  if (!img) return;

  gsap.set(img, { transformOrigin: "50% 100%" });
  const tl = gsap.timeline();
  tl.to(img, {
    duration: 0.1,
    scaleX: 1.05,
    scaleY: 0.95,
    ease: "power1.inOut",
  })
    .to(img, {
      duration: 0.1,
      y: -20, // Height of the jump
      scaleX: 0.8,
      scaleY: 1.2,
      ease: "power2.out",
    })
    .to(img, {
      duration: 0.1,
      y: 0,
      scaleX: 1.1,
      scaleY: 0.9,
      ease: "power2.in",
    })
    .to(img, {
      duration: 0.2,
      scaleX: 1,
      scaleY: 1,
      ease: "elastic.out(1, 0.3)", // The "jello" settle effect
    });
}, true);
