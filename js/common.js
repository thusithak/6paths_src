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
    });
    trigger.addEventListener("mousemove", (e) => {
      moveX(e.clientX - 0);
      moveY(e.clientY - 50);
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

// Jump animation for the image with class "app_logo_list img"
const logos = document.querySelectorAll(".app_logo_list img");
logos.forEach((img) => {
  gsap.set(img, { transformOrigin: "50% 100%" });
  img.addEventListener("mouseenter", () => {
    if (gsap.isTweening(img)) return;
    const tl = gsap.timeline();
    tl.to(img, {
      duration: 0.1,
      scaleX: 1.25,
      scaleY: 0.75,
      ease: "power1.inOut",
    })
      .to(img, {
        duration: 0.3,
        y: -40, // Height of the jump
        scaleX: 0.3,
        scaleY: 1.2,
        ease: "power2.out",
      })
      .to(img, {
        duration: 0.2,
        y: 0,
        scaleX: 1.1,
        scaleY: 0.9,
        ease: "power2.in",
      })
      .to(img, {
        duration: 0.5,
        scaleX: 1,
        scaleY: 1,
        ease: "elastic.out(1, 0.3)", // The "jello" settle effect
      });
  });
});

gsap.from(".app_logo_list img", {
  duration: 0.2,
  opacity: 0,
  y: 20,
  stagger: 0.1,
  ease: "back.out(1.7)",
});
