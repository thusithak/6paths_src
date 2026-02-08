/**
 * utils.js - Shared Utility Functions
 * 
 * Reusable helpers for:
 * - Audio fading and playback
 * - GSAP animations
 * - DOM event handling
 * - Error handling
 * - State management
 */

/**
 * Safely fade audio from one volume to another using Howler.js
 * Falls back to immediate volume set if fade is unavailable
 * 
 * @param {Howl} audio - Howler.js audio instance
 * @param {number} fromVolume - Starting volume (0-1)
 * @param {number} toVolume - Target volume (0-1)
 * @param {number} duration - Fade duration in milliseconds
 */
export function fadeAudio(audio, fromVolume, toVolume, duration) {
  if (!audio) return;

  safeCall(() => {
    // Attempt to use Howler's fade method for smooth transitions
    audio.fade(fromVolume, toVolume, duration);
  }, () => {
    // Fallback: Set volume immediately if fade method unavailable
    safeCall(() => {
      audio.volume(toVolume);
    });
  });
}

/**
 * Safely fade DOM element from one opacity to another using GSAP
 * Falls back to CSS transitions if GSAP unavailable
 * 
 * @param {HTMLElement} element - DOM element to animate
 * @param {number} fromOpacity - Starting opacity (0-1)
 * @param {number} toOpacity - Target opacity (0-1)
 * @param {number} duration - Fade duration in seconds
 * @param {Object} options - Additional GSAP options
 */
export function fadeElement(element, fromOpacity, toOpacity, duration, options = {}) {
  if (!element) return;

  if (window.gsap) {
    gsap.to(element, {
      opacity: toOpacity,
      duration,
      ...options,
    });
  } else {
    // CSS fallback
    element.style.transition = `opacity ${duration}s ease`;
    element.style.opacity = toOpacity.toString();
  }
}

/**
 * Safely execute a function with error handling
 * Optionally execute a fallback function on error
 * 
 * @param {Function} fn - Primary function to execute
 * @param {Function} fallback - Optional fallback function if primary fails
 * @returns {*} Result of the executed function
 */
export function safeCall(fn, fallback = null) {
  try {
    return fn();
  } catch (error) {
    if (fallback && typeof fallback === 'function') {
      try {
        return fallback();
      } catch (fallbackError) {
        // Silently fail if both fail
      }
    }
    // Optionally log error for debugging (uncomment as needed):
    // console.warn('Safe call failed:', error);
  }
}

/**
 * Check if a Howler.js audio instance is currently playing
 * 
 * @param {Howl} audio - Howler.js audio instance
 * @returns {boolean} True if audio is actively playing, false otherwise
 */
export function isAudioPlaying(audio) {
  if (!audio) return false;
  
  return safeCall(() => audio.playing(), () => false);
}

/**
 * Safely play a Howler.js audio instance
 * Ensures the sound isn't already playing before starting
 * 
 * @param {Howl} audio - Howler.js audio instance
 * @returns {boolean} True if audio was started, false if already playing or failed
 */
export function playAudio(audio) {
  if (!audio) return false;

  return safeCall(() => {
    // Only play if not already playing
    if (!isAudioPlaying(audio)) {
      audio.play();
      return true;
    }
    return false;
  }, () => false);
}

/**
 * Safely stop a Howler.js audio instance
 * 
 * @param {Howl} audio - Howler.js audio instance
 * @returns {boolean} True if stop was called, false if failed
 */
export function stopAudio(audio) {
  if (!audio) return false;

  return safeCall(() => {
    audio.stop();
    return true;
  }, () => false);
}

/**
 * Safely set mute state on a Howler.js audio instance
 * 
 * @param {Howl} audio - Howler.js audio instance
 * @param {boolean} shouldMute - True to mute, false to unmute
 * @returns {boolean} True if mute was set, false if failed
 */
export function setAudioMute(audio, shouldMute) {
  if (!audio) return false;

  return safeCall(() => {
    audio.mute(shouldMute);
    return true;
  }, () => false);
}

/**
 * Attach event listeners to multiple DOM elements matching a selector
 * Useful for eliminating repeated query + forEach patterns
 * 
 * @param {string} selector - CSS selector for target elements
 * @param {string} eventType - Event type (e.g., "click", "mouseenter")
 * @param {Function} callback - Function to call when event fires
 * @param {Object} options - Event listener options (e.g., { passive: true })
 * @returns {number} Number of elements event listener was attached to
 */
export function attachEventListeners(selector, eventType, callback, options = {}) {
  const elements = document.querySelectorAll(selector);
  let count = 0;

  safeCall(() => {
    elements.forEach((el) => {
      el.addEventListener(eventType, callback, options);
      count++;
    });
  });

  return count;
}

/**
 * Create a strongly-typed GSAP animation with consistent error handling
 * 
 * @param {HTMLElement} element - DOM element to animate
 * @param {number} duration - Animation duration in seconds
 * @param {string} ease - GSAP easing function (e.g., "power1.out")
 * @param {Object} properties - Animation properties (opacity, x, y, etc.)
 * @param {Object} callbacks - Optional callbacks ({ onStart, onComplete })
 * @returns {Object} GSAP tween object or null if failed
 */
export function animateGSAP(element, duration, ease, properties, callbacks = {}) {
  if (!element || !window.gsap) return null;

  return safeCall(() => {
    return gsap.to(element, {
      duration,
      ease,
      ...properties,
      onStart: callbacks.onStart,
      onComplete: callbacks.onComplete,
    });
  }, () => {
    // CSS fallback for basic properties
    if (properties.opacity !== undefined) {
      element.style.transition = `opacity ${duration}s ${ease.split('(')[0]}`;
      element.style.opacity = properties.opacity.toString();
    }
    return null;
  });
}

/**
 * Get the current volume from a Howler.js audio instance
 * Handles both function and property accessors
 * 
 * @param {Howl} audio - Howler.js audio instance
 * @param {number} defaultValue - Default if retrieval fails (default: 0)
 * @returns {number} Current volume (0-1) or default value
 */
export function getAudioVolume(audio, defaultValue = 0) {
  if (!audio) return defaultValue;

  return safeCall(() => {
    const vol = typeof audio.volume === 'function' ? audio.volume() : audio.volume;
    return vol !== undefined ? vol : defaultValue;
  }, () => defaultValue);
}

/**
 * Safely set audio rate (playback speed) on a Howler.js instance
 * 
 * @param {Howl} audio - Howler.js audio instance
 * @param {number} rate - Playback rate (0.5 = half speed, 1.0 = normal, 2.0 = double)
 * @returns {boolean} True if rate was set, false if failed
 */
export function setAudioRate(audio, rate) {
  if (!audio || typeof rate !== 'number') return false;

  return safeCall(() => {
    audio.rate(rate);
    return true;
  }, () => false);
}

/**
 * Validate DOM element exists and is connected to document
 * 
 * @param {string|HTMLElement} elementOrId - Element ID string or HTMLElement
 * @returns {HTMLElement|null} Element if valid, null otherwise
 */
export function validateDOM(elementOrId) {
  let element;

  if (typeof elementOrId === 'string') {
    element = document.getElementById(elementOrId);
  } else if (elementOrId instanceof HTMLElement) {
    element = elementOrId;
  }

  return (element && document.contains(element)) ? element : null;
}

/**
 * Debounce a function to prevent excessive calls
 * Useful for scroll, resize, and input events
 * 
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Generate a random number within a range
 * Useful for randomizing audio playback rates, animation delays, etc.
 * 
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random number between min and max
 */
export function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}
