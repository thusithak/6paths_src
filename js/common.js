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

  //funky tooltip, use with data-tooltip attribute on any element to show tooltip text on hover
  const tooltip = document.getElementById("tooltip");
  const triggers = document.querySelectorAll("[data-tooltip]");
  const moveX = gsap.quickTo(tooltip, "x", {
    duration: 0.15,
    ease: "power3.out",
  });
  const moveY = gsap.quickTo(tooltip, "y", {
    duration: 0.15,
    ease: "power3.out",
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", (e) => {
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
        y: e.clientY - 120,
      });
      gsap.to(tooltip, {
        scale: 1,
        opacity: 1,
        rotation: gsap.utils.random(-15, 5),
        duration: 0.8,
        ease: "elastic.out(1.2, 0.4)",
        overwrite: "auto",
      });
    });
    trigger.addEventListener("mousemove", (e) => {
      moveX(e.clientX - 0);
      moveY(e.clientY - 80);
    });
    trigger.addEventListener("mouseleave", () => {
      gsap.to(tooltip, {
        scale: 0,
        opacity: 0,
        rotation: 0,
        duration: 0.3,
        ease: "back.in(1.5)",
        overwrite: "auto",
      });
    });
  });
}

if (document.readyState === "complete") {
  runAdhocIntegrations();
} else {
  window.addEventListener("load", runAdhocIntegrations, { once: true });
}
