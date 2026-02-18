gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Create the smoother instance
let smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1.5, // Time (seconds) it takes to "catch up" to the scroll
  effects: true, // Look for data-speed and data-lag attributes
  smoothTouch: 0.1, // Optional: enable smooth scroll on touch devices
});

const modalWrapper = document.querySelector(".modal-wrapper");
const modalContent = document.querySelector(".modal-content-container");
const backdrop = document.querySelector(".modal-backdrop");
const closeBtn = document.querySelector(".close-btn");

// 1. Setup the Animation Timeline
const modalTL = gsap.timeline({
  paused: true,
  onReverseComplete: () => {
    gsap.set(modalWrapper, { display: "none" });
    smoother.paused(false); // Re-enable background scroll
  },
});

modalTL
  .set(modalWrapper, { display: "block" })
  .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.5 })
  .fromTo(
    modalContent,
    { yPercent: 100 },
    { yPercent: 0, duration: 0.8, ease: "power4.out" },
    "<", // Starts at the same time as backdrop
  );

// 2. Interaction Functions
function openModal() {
  smoother.paused(true); // Stop the background scroll
  modalTL.play();
}

function closeModal() {
  modalTL.reverse();
}

// 3. Event Listeners
document.querySelectorAll(".case-study").forEach((el) => {
  el.addEventListener("click", openModal);
});

// Close by clicking backdrop OR close button
backdrop.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);
