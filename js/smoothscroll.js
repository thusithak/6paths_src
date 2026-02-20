gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Create the smoother instance
let smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 0.5, // Time (seconds) it takes to "catch up" to the scroll
  effects: true, // Look for data-speed and data-lag attributes
  smoothTouch: 0.1, // Optional: enable smooth scroll on touch devices
});

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

  const openModal = () => {
    if (isTransitioning || isModalOpen) return;

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
