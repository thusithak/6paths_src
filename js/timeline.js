const initTimeline = () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP or ScrollTrigger not found, retrying...");
    setTimeout(initTimeline, 100);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const milestones = gsap.utils.toArray(".milestone");
  const scrollLine = document.getElementById("scrollLine");

  gsap.to(scrollLine, {
    attr: { y2: 100 },
    ease: "none",
    scrollTrigger: {
      trigger: "#mainTimeline",
      start: "top 50%",
      end: "bottom 70%",
      scrub: 0.5,
    },
  });

  milestones.forEach((milestone, i) => {
    const isProf = milestone.classList.contains("professional");
    const targetColor = isProf
      ? "var(--timeline-prof-color)"
      : "var(--timeline-pers-color)";

    ScrollTrigger.create({
      trigger: milestone,
      start: "top center",
      end: "bottom center",
      onEnter: () =>
        gsap.to(scrollLine, {
          stroke: targetColor,
          filter: `drop-shadow(0 0 12px ${targetColor})`,
          duration: 0.4,
        }),
      onEnterBack: () =>
        gsap.to(scrollLine, {
          stroke: targetColor,
          filter: `drop-shadow(0 0 12px ${targetColor})`,
          duration: 0.4,
        }),
    });

    const card = milestone.querySelector(".card");
    const node = milestone.querySelector(".node");
    const connector = milestone.querySelector(".connector");
    const isMobile = window.innerWidth < 768;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: milestone,
        start: "top 70%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(milestone, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
      .to(
        node,
        {
          scale: 1,
          backgroundColor: targetColor,
          borderColor: targetColor,
          duration: 0.3,
          delay: 0.2,
          ease: "back.out(2)",
        },
        "-=0.6",
      )
      .to(
        connector,
        {
          width: isMobile ? "30px" : "6%",
          duration: 0.4,
          delay: 0.2,
          backgroundColor: targetColor,
          ease: "power1.inOut",
        },
        "-=0.3",
      )
      .to(
        card,
        {
          borderColor: targetColor,
          x: 0,
          duration: 0.2,
          delay: 0.2,
        },
        "-=0.2",
      );
  });

  milestones.forEach((m) => {
    const card = m.querySelector(".card");
    gsap.to(card, {
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: m,
        start: "top 70%",
        end: "bottom 75",
        scrub: true,
      },
    });
  });
};

if (document.readyState === "complete") {
  initTimeline();
} else {
  window.addEventListener("load", initTimeline);
}
