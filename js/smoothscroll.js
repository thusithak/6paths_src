gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

let smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 0.5,
  effects: true,
  smoothTouch: 0.1,
});

const setupWebflowAnchorSync = () => {
  const parseOffset = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getRootAnchorOffset = () =>
    parseOffset(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--anchor-offset",
      ),
    );

  const getNavbarOffset = () => {
    const navbar =
      document.querySelector(".navbar-container") ||
      document.querySelector(".navbar") ||
      document.querySelector(".w-nav");

    if (!navbar) return 0;
    return navbar.getBoundingClientRect().height;
  };

  const getAnchorOffsetForSection = (section) => {
    const sectionOffset = parseOffset(section?.dataset?.anchorOffset);
    return getNavbarOffset() + getRootAnchorOffset() + sectionOffset;
  };

  const scrollToSection = (section, smooth = true) => {
    const offset = getAnchorOffsetForSection(section);
    const destination = Math.max(0, smoother.offset(section, "top top") - offset);
    smoother.scrollTo(destination, smooth);
  };

  const hashLinks = Array.from(
    document.querySelectorAll('a[href*="#"]'),
  ).filter((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return false;
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return false;

    const pathPart = href.slice(0, hashIndex);
    if (!pathPart) return true;

    const normalizedPath = pathPart.replace(/\/?$/, "");
    const currentPath = window.location.pathname.replace(/\/?$/, "");
    return normalizedPath === currentPath;
  });

  if (!hashLinks.length) return;

  const sectionToLinks = new Map();
  const uniqueSections = new Set();

  hashLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const hash = href.slice(href.indexOf("#"));
    if (!hash || hash === "#") return;

    const section = document.querySelector(hash);
    if (!section) return;

    uniqueSections.add(section);

    const existingLinks = sectionToLinks.get(section) || [];
    existingLinks.push(link);
    sectionToLinks.set(section, existingLinks);

    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToSection(section, true);
      history.replaceState(null, "", hash);
    });
  });

  if (!uniqueSections.size) return;

  const allSectionLinks = Array.from(sectionToLinks.values()).flat();

  const setCurrentLinks = (activeSection) => {
    allSectionLinks.forEach((link) => link.classList.remove("w--current"));
    const activeLinks = sectionToLinks.get(activeSection) || [];
    activeLinks.forEach((link) => link.classList.add("w--current"));
  };

  uniqueSections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      onEnter: () => setCurrentLinks(section),
      onEnterBack: () => setCurrentLinks(section),
    });
  });

  if (window.location.hash) {
    const initialTarget = document.querySelector(window.location.hash);
    if (initialTarget) {
      requestAnimationFrame(() => {
        scrollToSection(initialTarget, false);
      });
    }
  }
};

setupWebflowAnchorSync();

const modalWrapper =
  document.getElementById("modal-wrapper") ||
  document.querySelector(".modal-wrapper");
const modalBackdrop = document.querySelector(".modal-backdrop");
const modalContent = document.querySelector(".modal-content-container");
const closeBtn = document.querySelector(".close-btn");
const triggers = document.querySelectorAll(".case-study");

if (
  modalWrapper &&
  modalBackdrop &&
  modalContent &&
  closeBtn &&
  triggers.length
) {
  let isTransitioning = false;
  let isModalOpen = false;
  let closeFallbackTimer = null;

  const clearCloseFallback = () => {
    if (closeFallbackTimer) {
      clearTimeout(closeFallbackTimer);
      closeFallbackTimer = null;
    }
  };

  const restoreClosedState = () => {
    clearCloseFallback();
    isTransitioning = false;
    isModalOpen = false;
    gsap.set(modalWrapper, { display: "none", pointerEvents: "none" });
    document.body.classList.remove("modal-open");
    smoother.paused(false);
  };

  gsap.set(modalWrapper, { display: "none", pointerEvents: "none" });
  gsap.set(modalBackdrop, { opacity: 0 });
  gsap.set(modalContent, { yPercent: 100 });

  const modalTL = gsap.timeline({
    paused: true,
    onComplete: () => {
      clearCloseFallback();
      isTransitioning = false;
      isModalOpen = true;
    },
    onReverseComplete: restoreClosedState,
  });

  modalTL
    .set(modalWrapper, { display: "block", pointerEvents: "auto" })
    .to(modalBackdrop, { opacity: 1, duration: 0.3, ease: "power2.out" })
    .to(
      modalContent,
      { yPercent: 0, duration: 0.5, ease: "power3.out" },
      "<0.1",
    );

  const openModal = (e) => {
    if (isTransitioning || isModalOpen) return;
    const trigger = e.currentTarget;
    const targetId = trigger.getAttribute("data-target");
    if (targetId) {
      document.querySelectorAll(".case-study-container").forEach((el) => {
        el.style.display = "none";
      });
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.style.display = "block";
      }
    }

    clearCloseFallback();
    isTransitioning = true;
    document.body.classList.add("modal-open");
    modalContent.scrollTop = 0;
    smoother.paused(true);
    modalTL.play();
  };

  const closeModal = () => {
    if (isTransitioning || !isModalOpen) return;

    isTransitioning = true;
    modalTL.reverse();

    closeFallbackTimer = setTimeout(() => {
      if (isTransitioning) {
        restoreClosedState();
      }
    }, 800);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", openModal);
  });

  closeBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalTL.progress() > 0 && !modalTL.reversed()) {
      closeModal();
    }
  });
}
