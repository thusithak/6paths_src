/**
 * Shared utility functions for audio, GSAP, DOM, and state management.
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

export function isAudioPlaying(audio) {
  if (!audio) return false;
  
  return safeCall(() => audio.playing(), () => false);
}

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

export function stopAudio(audio) {
  if (!audio) return false;

  return safeCall(() => {
    audio.stop();
    return true;
  }, () => false);
}

export function setAudioMute(audio, shouldMute) {
  if (!audio) return false;

  return safeCall(() => {
    audio.mute(shouldMute);
    return true;
  }, () => false);
}

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

export function getAudioVolume(audio, defaultValue = 0) {
  if (!audio) return defaultValue;

  return safeCall(() => {
    const vol = typeof audio.volume === 'function' ? audio.volume() : audio.volume;
    return vol !== undefined ? vol : defaultValue;
  }, () => defaultValue);
}

export function setAudioRate(audio, rate) {
  if (!audio || typeof rate !== 'number') return false;

  return safeCall(() => {
    audio.rate(rate);
    return true;
  }, () => false);
}

export function validateDOM(elementOrId) {
  let element;

  if (typeof elementOrId === 'string') {
    element = document.getElementById(elementOrId);
  } else if (elementOrId instanceof HTMLElement) {
    element = elementOrId;
  }

  return (element && document.contains(element)) ? element : null;
}

export function debounce(fn, delay = 300) {
  let timeoutId;
  
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}
