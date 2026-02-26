gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

let smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 0.5,
  effects: true,
  smoothTouch: 0.1,
});

const setupWebflowAnchorSync = () => {
  if (window.__anchorSyncInitialized) return;
  window.__anchorSyncInitialized = true;

  const parseOffset = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const debugEnabledByUrl =
    new URLSearchParams(window.location.search).get("anchorDebug") === "1";
  const debugEnabledByStorage = localStorage.getItem("anchorDebug") === "1";
  let debugEnabled = debugEnabledByUrl || debugEnabledByStorage;

  const setDebugEnabled = (enabled) => {
    debugEnabled = enabled;
    localStorage.setItem("anchorDebug", enabled ? "1" : "0");
  };

  let debugOverlay = null;
  let debugText = null;
  let debugGuide = null;

  const ensureDebugOverlay = () => {
    if (debugOverlay) return;

    debugOverlay = document.createElement("div");
    debugOverlay.setAttribute("data-anchor-debugger", "true");
    Object.assign(debugOverlay.style, {
      position: "fixed",
      right: "12px",
      bottom: "12px",
      zIndex: "99999",
      width: "320px",
      maxWidth: "calc(100vw - 24px)",
      background: "rgba(0,0,0,0.78)",
      color: "#fff",
      fontFamily: "monospace",
      fontSize: "12px",
      lineHeight: "1.35",
      borderRadius: "8px",
      padding: "10px 12px",
      pointerEvents: "none",
      whiteSpace: "pre-wrap",
    });

    const title = document.createElement("div");
    title.textContent = "Anchor Debugger (Ctrl+Shift+A toggle)";
    title.style.fontWeight = "700";
    title.style.marginBottom = "6px";

    debugText = document.createElement("div");
    debugText.textContent = "Waiting for anchor click...";

    debugGuide = document.createElement("div");
    Object.assign(debugGuide.style, {
      position: "fixed",
      left: "0",
      right: "0",
      height: "0",
      borderTop: "2px dashed #ff4d6d",
      zIndex: "99998",
      pointerEvents: "none",
    });

    debugOverlay.appendChild(title);
    debugOverlay.appendChild(debugText);
    document.body.appendChild(debugGuide);
    document.body.appendChild(debugOverlay);
  };

  const removeDebugOverlay = () => {
    if (debugOverlay) {
      debugOverlay.remove();
      debugOverlay = null;
      debugText = null;
    }
    if (debugGuide) {
      debugGuide.remove();
      debugGuide = null;
    }
  };

  const updateDebugOverlay = (payload) => {
    if (!debugEnabled) return;
    ensureDebugOverlay();
    const {
      hash,
      targetId,
      navbarOffset,
      rootOffset,
      sectionOffset,
      totalOffset,
      rawTargetY,
      destination,
      currentY,
      targetViewportTop,
    } = payload;

    if (debugGuide) {
      debugGuide.style.top = `${Math.max(0, totalOffset)}px`;
    }

    if (debugText) {
      debugText.textContent = [
        `hash: ${hash}`,
        `target: #${targetId}`,
        `navbarOffset: ${navbarOffset.toFixed(2)}`,
        `rootOffset: ${rootOffset.toFixed(2)}`,
        `sectionOffset: ${sectionOffset.toFixed(2)}`,
        `totalOffset: ${totalOffset.toFixed(2)}`,
        `rawTargetY: ${rawTargetY.toFixed(2)}`,
        `destinationY: ${destination.toFixed(2)}`,
        `currentY: ${currentY.toFixed(2)}`,
        `targetViewportTop(now): ${targetViewportTop.toFixed(2)}`,
      ].join("\n");
    }
  };

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
      setDebugEnabled(!debugEnabled);
      if (!debugEnabled) {
        removeDebugOverlay();
      } else {
        ensureDebugOverlay();
      }
    }
  });

  if (debugEnabled) {
    ensureDebugOverlay();
  }

  const getRootAnchorOffset = () => {
    const rootStyle = getComputedStyle(document.documentElement);
    return parseOffset(rootStyle.getPropertyValue("--anchor-offset"));
  };

  const getNavbarOffset = () => {
    const navbar =
      document.querySelector(".navbar-container") ||
      document.querySelector(".navbar") ||
      document.querySelector(".w-nav");

    if (!navbar) return 0;
    return navbar.getBoundingClientRect().height;
  };

  const getAnchorOffsetParts = (section) => {
    const navbarOffset = getNavbarOffset();
    const rootOffset = getRootAnchorOffset();
    const sectionOffset = parseOffset(section?.dataset?.anchorOffset);
    const totalOffset = navbarOffset + rootOffset + sectionOffset;
    return {
      navbarOffset,
      rootOffset,
      sectionOffset,
      totalOffset,
    };
  };

  const waitForScrollSettle = (onSettled) => {
    let previousY = smoother.scrollTop();
    let stableFrames = 0;
    let attempts = 0;
    const maxAttempts = 180;
    const stabilityThreshold = 0.35;
    const requiredStableFrames = 8;

    const check = () => {
      const currentY = smoother.scrollTop();
      const delta = Math.abs(currentY - previousY);
      previousY = currentY;
      attempts += 1;

      if (delta < stabilityThreshold) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
      }

      if (stableFrames >= requiredStableFrames || attempts >= maxAttempts) {
        onSettled();
        return;
      }

      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  };

  const correctSectionAlignment = (section, hash = "") => {
    const { navbarOffset, rootOffset, sectionOffset, totalOffset } =
      getAnchorOffsetParts(section);
    const beforeCorrectionY = smoother.scrollTop();
    const viewportTopBefore = section.getBoundingClientRect().top;
    const alignmentError = viewportTopBefore - totalOffset;

    if (Math.abs(alignmentError) > 0.75) {
      const correctedDestination = Math.max(
        0,
        beforeCorrectionY + alignmentError,
      );
      smoother.scrollTo(correctedDestination, false);
    }

    const finalY = smoother.scrollTop();
    const viewportTopAfter = section.getBoundingClientRect().top;

    updateDebugOverlay({
      hash,
      targetId: section.id || "(no-id)",
      navbarOffset,
      rootOffset,
      sectionOffset,
      totalOffset,
      rawTargetY: beforeCorrectionY + viewportTopBefore,
      destination: finalY,
      currentY: finalY,
      targetViewportTop: viewportTopAfter,
    });
  };

  const scrollToSection = (section, smooth = true, hash = "") => {
    const { navbarOffset, rootOffset, sectionOffset, totalOffset } =
      getAnchorOffsetParts(section);
    const rawTargetY = smoother.offset(section, "top top");
    const destination = Math.max(0, rawTargetY - totalOffset);
    smoother.scrollTo(destination, smooth);

    updateDebugOverlay({
      hash,
      targetId: section.id || "(no-id)",
      navbarOffset,
      rootOffset,
      sectionOffset,
      totalOffset,
      rawTargetY,
      destination,
      currentY: smoother.scrollTop(),
      targetViewportTop: section.getBoundingClientRect().top,
    });

    if (smooth) {
      waitForScrollSettle(() => {
        correctSectionAlignment(section, hash);
      });
    } else {
      requestAnimationFrame(() => {
        correctSectionAlignment(section, hash);
      });
    }
  };

  const resolveHashTarget = (href) => {
    if (!href || href === "#") return null;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return null;
    }

    if (!url.hash || url.hash === "#") return null;

    const sameOrigin = url.origin === window.location.origin;
    const normalizePath = (path) => path.replace(/\/?$/, "");
    const samePath =
      normalizePath(url.pathname) === normalizePath(window.location.pathname);

    if (!sameOrigin || !samePath) return null;

    const rawId = decodeURIComponent(url.hash.slice(1));
    if (!rawId) return null;

    const section = document.getElementById(rawId);
    if (!section) return null;

    return {
      hash: `#${rawId}`,
      section,
      id: rawId,
    };
  };

  const hashLinks = Array.from(
    document.querySelectorAll('a[href*="#"]'),
  ).filter((link) => {
    const href = link.getAttribute("href");
    return Boolean(resolveHashTarget(href));
  });

  if (!hashLinks.length) return;

  const sectionToLinks = new Map();
  const uniqueSections = new Set();

  hashLinks.forEach((link) => {
    if (link.dataset.anchorSyncBound === "1") return;

    const href = link.getAttribute("href");
    const target = resolveHashTarget(href);
    if (!target) return;

    const { hash, section } = target;

    uniqueSections.add(section);

    const existingLinks = sectionToLinks.get(section) || [];
    existingLinks.push(link);
    sectionToLinks.set(section, existingLinks);

    link.dataset.anchorSyncBound = "1";

    link.addEventListener("click", (event) => {
      event.preventDefault();
      requestAnimationFrame(() => {
        scrollToSection(section, true, hash);
        history.replaceState(null, "", hash);
      });
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
    const initialTarget = resolveHashTarget(window.location.href);
    if (initialTarget?.section) {
      requestAnimationFrame(() => {
        scrollToSection(initialTarget.section, false, initialTarget.hash);
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
