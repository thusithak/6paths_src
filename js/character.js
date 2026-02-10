// --- CONFIGURATION & CONSTANTS ---
const CONFIG = {
  frameRate: 200, // Speed of animation loop
  dragLimitX: 100, // Max horizontal drag
  dragLimitY: -100, // Max vertical drag (upwards)
  shakeThreshold: 30, // Pixels to register a shake
  shakeCountTrigger: 4, // Shakes needed for dizzy
  spamClickLimit: 3, // Clicks before messing mode
  messingDuration: 6000, // How long cursor stays hidden
  shadowMaxBlur: 8,
  shadowMinBlur: 2,
};

// Speech Texts Library
const speechTexts = {
  center: ["I see you.", "Hi There...", "Hmm?", "Hello!", "What's Up?"],
  left: ["What's there?", "Over there?", "Hmm... Looking", "That way?"],
  right: ["Right!!!", "What's that?", "Over here?", "Checking..."],
  up: ["Up high?", "Ceiling?", "The sky looks nice today", "Up Up Up!"],
  down: ["Hmm..!", "This is it I guess!?", "What are you doing?", "Err..."],
  poke: ["Ouch!", "Hey!", "Cut it out!", "That hurts!"],
  angry: ["STOP IT!", "STOP!!!", "GRRR!", "THAT'S ENOUGH."],
  dizzy: [
    "Whoa... Don't do it again!",
    "Ok, I'm spinning.",
    "I tihnk i'm going to be sick...",
  ],
  messing: [
    "Ahahah Can't poke me now!",
    "Hehehehee!",
    "Anything wrong?",
    "Try again!",
  ],
};

// DOM Elements
const container = document.getElementById("charContainer");
const hitbox = document.getElementById("hitbox");
const speechBubble = document.getElementById("speechBubble");
const thudEffect = document.getElementById("thudEffect");
const charShadow = document.getElementById("charShadow");

// We scan the DOM for images with data-pose attributes to build our state map
const poses = {};
document.querySelectorAll(".frame").forEach((img) => {
  const pose = img.dataset.pose;
  if (!poses[pose]) poses[pose] = [];
  poses[pose].push(img);
});

// --- STATE VARIABLES ---

// Character State
let currentState = null;
let currentlyVisibleFrame = null;
let isInteracting = false;

// Timers
let interactionTimer = null;
let speechTimer = null;
let spamResetTimer = null;
let shakeTimer = null;

// Mouse & Input Tracking
let lastMouseX = 0;
let shakeCount = 0;
let lastDirection = 0;
let spamClickCount = 0;
let isCursorHidden = false;

// Dragging Logic
let isDragging = false;
let dragActive = false;
let dragStart = { x: 0, y: 0 };
let blockClick = false;

// --- RENDER LOGIC ---

function renderCurrentPose() {
  // Get all images for the current pose
  const frames = poses[currentState];
  if (!frames || frames.length === 0) return;

  // Randomly select a frame index ONCE when state changes
  const randomIndex = Math.floor(Math.random() * frames.length);
  const nextFrame = frames[randomIndex];

  // Only update DOM if the frame actually changed
  if (currentlyVisibleFrame !== nextFrame) {
    document
      .querySelectorAll(".frame")
      .forEach((el) => (el.style.display = "none"));
    nextFrame.style.display = "block";
    currentlyVisibleFrame = nextFrame;
  }
}

// --- STATE MANAGEMENT ---

function setPose(poseName) {
  // Priority checks
  if (isCursorHidden && poseName !== "messing") return;
  if (
    isInteracting &&
    !isCursorHidden &&
    !isDragging &&
    ["center", "left", "right", "up", "down"].includes(poseName)
  )
    return;
  if (currentState === poseName) return;

  currentState = poseName;

  // Immediate render
  renderCurrentPose();

  // Update Text
  updateSpeech(poseName);

  // NOTE: Removed the bouncing animation on container per request
}

function updateSpeech(poseName) {
  const texts = speechTexts[poseName] || ["..."];
  const text = texts[Math.floor(Math.random() * texts.length)];
  speechBubble.innerText = text;

  // Random Reveal using Scale (No Opacity Fade)
  gsap.killTweensOf(speechBubble);

  // Random start scale slightly to vary the pop
  const startScale = Math.random() * 0.3;

  gsap.fromTo(
    speechBubble,
    { scale: startScale },
    { scale: 1, duration: 0.4, ease: "back.out(1.7)" },
  );

  clearTimeout(speechTimer);
  let duration = 2000;
  if (poseName === "messing") duration = 1500;

  // Scale out to hide (No Opacity Fade)
  speechTimer = setTimeout(() => {
    gsap.to(speechBubble, { scale: 0, duration: 0.25, ease: "back.in(1.7)" });
  }, duration);
}

function resetInteraction(delay = 1000) {
  clearTimeout(interactionTimer);
  interactionTimer = setTimeout(() => {
    isInteracting = false;
    if (isCursorHidden) {
      setPose("messing");
    } else {
      setPose("center");
    }
  }, delay);
}

// --- DRAG LOGIC ---

hitbox.addEventListener("mousedown", (e) => {
  if (isCursorHidden) return;

  isDragging = true;
  dragActive = false; // Hasn't moved yet
  dragStart = { x: e.clientX, y: e.clientY };

  // Note: We don't set pose 'down' yet. We wait for movement.
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;

  isDragging = false;

  if (dragActive) {
    // Was dragging, so snap back
    gsap.to(container, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });

    // Snap shadow back
    gsap.to(charShadow, {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });

    dragActive = false;
    isInteracting = false;
    setPose("center");

    // Prevent the subsequent 'click' event
    blockClick = true;
    setTimeout(() => {
      blockClick = false;
    }, 50);
  }
});

// --- GLOBAL MOUSE LOGIC (Tracking + Dragging) ---

document.addEventListener("mousemove", (e) => {
  if (isCursorHidden) return;

  // 1. Handle Dragging
  if (isDragging) {
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    // Threshold to start visual dragging (prevents jitter on clicks)
    if (!dragActive && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      dragActive = true;
      isInteracting = true; // Lock other animations
      setPose("down"); // Set "picked up" pose
    }

    if (dragActive) {
      // Clamp Movement
      const clampedX = Math.max(
        -CONFIG.dragLimitX,
        Math.min(CONFIG.dragLimitX, dx),
      );
      const clampedY = Math.max(CONFIG.dragLimitY, Math.min(0, dy)); // Negative goes up

      gsap.set(container, { x: clampedX, y: clampedY });

      // Shadow Logic:
      // 1. Shadow stays at y=0 (relative to parent), so if container goes UP (-Y), shadow goes DOWN (+Y) to compensate.
      // 2. Shadow shrinks as container goes higher.

      // Calculate height ratio (0 at ground, 1 at max height)
      const heightRatio = Math.abs(clampedY) / Math.abs(CONFIG.dragLimitY);

      // Shadow stays on "floor" by negating container movement
      const shadowY = -clampedY;

      // Scale shrinks from 1.0 down to 0.5
      const shadowScale = 1 - heightRatio * 0.5;

      // Opacity reduces slightly
      const shadowOpacity = 1 - heightRatio * 0.4;

      gsap.set(charShadow, {
        y: shadowY,
        scale: shadowScale,
        opacity: shadowOpacity,
      });
    }
    return; // Stop here if dragging
  }

  // 2. Handle Shake (Only if not interacting)
  handleShakeDetection(e.clientX);

  if (isInteracting) return;

  // 3. Look At Logic
  const rect = container.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 50) {
    setPose("center");
    return;
  }

  // Swapped Left/Right logic per request
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) setPose("right");
    else setPose("left");
  } else {
    if (dy < 0) setPose("up");
    else setPose("down");
  }
});

// --- WAVE / SHAKE ---
function handleShakeDetection(currentX) {
  const dx = currentX - lastMouseX;
  const direction = Math.sign(dx);

  if (direction !== lastDirection && Math.abs(dx) > CONFIG.shakeThreshold) {
    shakeCount++;
    lastDirection = direction;
    clearTimeout(shakeTimer);
    shakeTimer = setTimeout(() => {
      shakeCount = 0;
    }, 300);
  }

  if (shakeCount > CONFIG.shakeCountTrigger) {
    triggerDizzy();
    shakeCount = 0;
  }

  lastMouseX = currentX;
}

function triggerDizzy() {
  if (currentState === "dizzy" || isCursorHidden || isDragging) return;
  isInteracting = true;
  setPose("dizzy");
  gsap.to(container, {
    rotation: 360,
    duration: 1,
    ease: "elastic.out(1, 0.3)",
  });
  gsap.to(container, { rotation: 0, duration: 0, delay: 1 });
  resetInteraction(2000);
}

// --- CLICK INTERACTIONS ---

function triggerThudEffect(x, y) {
  const size = 60;
  thudEffect.style.left = x - size / 2 + "px";
  thudEffect.style.top = y - size / 2 + "px";

  gsap.killTweensOf(thudEffect);

  // Random rotation between -30 and 30
  const randomRotation = Math.random() * 60 - 30;

  // Random Reveal Scale (No Opacity Fade)
  gsap.fromTo(
    thudEffect,
    { scale: 0, rotation: randomRotation },
    {
      scale: 1.2,
      duration: 0.15,
      ease: "back.out(3)", // High intensity pop
      onComplete: () => {
        // Quick scale out
        gsap.to(thudEffect, {
          scale: 0,
          duration: 0.2,
          delay: 0.1,
          ease: "power2.in",
        });
      },
    },
  );
}

hitbox.addEventListener("click", (e) => {
  if (blockClick) {
    blockClick = false;
    return;
  }

  handleSpamProtection();
  if (isCursorHidden) return;

  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  triggerThudEffect(x, y);

  if (currentState !== "angry") {
    isInteracting = true;
    setPose("poke");
    resetInteraction(800);
  }
});

hitbox.addEventListener("dblclick", (e) => {
  if (isCursorHidden) return;

  // Double click might still fire after a drag if browser is quirky,
  // but blockClick usually catches the single click component.

  isInteracting = true;
  setPose("angry");

  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  triggerThudEffect(x, y);

  gsap.to(container, { x: -5, duration: 0.05, yoyo: true, repeat: 5 });
  gsap.to(container, { x: 0, duration: 0.1, delay: 0.3 });

  resetInteraction(1500);
});

// --- SPAM PROTECTION ---

function handleSpamProtection() {
  if (isCursorHidden) return;
  spamClickCount++;
  clearTimeout(spamResetTimer);
  spamResetTimer = setTimeout(() => {
    spamClickCount = 0;
  }, 800);

  if (spamClickCount > CONFIG.spamClickLimit) {
    startMessingMode();
    spamClickCount = 0;
  }
}

function startMessingMode() {
  isCursorHidden = true;
  document.body.classList.add("cursor-hidden");
  setPose("messing");
  container.style.opacity = "0.8";

  // Force reset any drags
  isDragging = false;
  dragActive = false;
  gsap.to(container, { x: 0, y: 0, duration: 0.2 });

  setTimeout(() => {
    document.body.classList.remove("cursor-hidden");
    container.style.opacity = "1";
    isCursorHidden = false;
    isInteracting = false;
    setPose("center");
  }, CONFIG.messingDuration);
}

// Initialize state
setPose("center");
