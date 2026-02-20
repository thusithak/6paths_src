import { CONFIG } from "./config.js";
import {
  fadeAudio,
  safeCall,
  isAudioPlaying,
  playAudio,
  stopAudio,
  setAudioMute,
  attachEventListeners,
  getAudioVolume,
  setAudioRate,
  randomInRange,
} from "./utils.js";

export class AudioManager {
  constructor(config = CONFIG) {
    this.config = config;
    this.library = {};
    this.isMuted = true;
    this.backgroundVolume = this.config.AUDIO.VOLUMES.background;
    this.themeVolume = this.config.AUDIO.VOLUMES.theme;
    this.bgScrollFaded = false;
    this.themeActive = false;
    this.audioUnlocked = false;
    this.setupAudioLibrary();
    this.setupEventListeners();
  }

  setupAudioLibrary() {
    if (!window.Howler) {
      console.warn("Howler.js not loaded");
      return;
    }

    const audioFiles = this.config.getAudioFilesArray();
    const globalDefaults = this.config.AUDIO.GLOBAL_DEFAULTS;

    audioFiles.forEach((file) => {
      this.library[file.name] = new Howl({
        ...globalDefaults,
        ...file,
      });
    });

    if (this.library.background) {
      const bg = this.library.background;
      this.backgroundVolume = this.config.AUDIO.VOLUMES.background;
      safeCall(() => {
        bg.loop(true);
      });
      safeCall(() => {
        bg.play();
      });
      safeCall(() => {
        bg.volume(this.isMuted ? 0 : this.backgroundVolume);
      });
    }

    this.setMute(true);
  }

  setupEventListeners() {
    const selectors = this.config.DOM.EVENT_SELECTORS;
    attachEventListeners(selectors.hover, "mouseenter", () =>
      this.play("hover"),
    );
    attachEventListeners(selectors.click, "click", () => this.play("click"));
    attachEventListeners(selectors.switch, "click", () => this.play("switch"));

    safeCall(() => {
      window.addEventListener("scroll", this.handleScroll.bind(this), {
        passive: true,
      });
    });
  }

  getAudioConfig() {
    return this.config.getAudioFilesArray();
  }

  handleScroll() {
    const bg = this.library.background;
    const theme = this.library.theme;
    if (!bg) return;
    if (this.isMuted) return;

    const scrollRatio =
      (window.scrollY || window.pageYOffset) /
      (window.innerHeight || document.documentElement.clientHeight || 1);
    const { threshold, fadeTarget, fadeDuration } = this.config.AUDIO.SCROLL;

    if (scrollRatio >= threshold && !this.bgScrollFaded) {
      const current = getAudioVolume(bg, this.backgroundVolume);
      fadeAudio(bg, current, fadeTarget, fadeDuration);

      if (theme && this.themeActive) {
        const currentThemeVol = getAudioVolume(theme, this.themeVolume);
        fadeAudio(theme, currentThemeVol, fadeTarget, fadeDuration);
      }

      this.bgScrollFaded = true;
    } else if (scrollRatio < threshold && this.bgScrollFaded) {
      const current = getAudioVolume(bg, fadeTarget);
      fadeAudio(bg, current, this.backgroundVolume, fadeDuration);

      if (theme && this.themeActive) {
        const current = getAudioVolume(theme, fadeTarget);
        fadeAudio(theme, current, this.themeVolume, fadeDuration);
      }

      this.bgScrollFaded = false;
    }
  }

  attachSoundToElements(selector, soundName, eventType) {
    attachEventListeners(selector, eventType, () => this.play(soundName));
  }

  setMute(isMuted) {
    this.isMuted = isMuted;
    if (!window.Howler) return;

    Object.keys(this.library).forEach((key) => {
      const sound = this.library[key];
      if (!sound) return;
      setAudioMute(sound, isMuted);
    });

    const bg = this.library.background;
    const { fadeDuration } = this.config.AUDIO.MUTE;
    if (bg) {
      playAudio(bg);

      const target = isMuted ? 0 : this.backgroundVolume || 1.0;
      const currentVol = getAudioVolume(bg, 0);
      fadeAudio(bg, currentVol, target, fadeDuration);
    }

    if (isMuted && this.themeActive) {
      this.fadeOutThemeSound();
    }

    console.log(isMuted ? "Site Started Muted" : "Site Unmuted");
  }

  toggleMute() {
    this.setMute(!this.isMuted);
    return !this.isMuted;
  }

  fadeInThemeSound() {
    const theme = this.library.theme;
    if (!theme || this.isMuted) return;

    this.themeActive = true;

    safeCall(() => {
      const [minRate, maxRate] = this.config.AUDIO.THEME_SOUND.rateRange;
      const randomRate = randomInRange(minRate, maxRate);
      setAudioRate(theme, randomRate);

      playAudio(theme);

      const { fadeDuration } = this.config.AUDIO.THEME_SOUND;
      fadeAudio(theme, 0, this.themeVolume, fadeDuration);
    });
  }

  fadeOutThemeSound() {
    const theme = this.library.theme;
    if (!theme) return;

    this.themeActive = false;

    safeCall(() => {
      const currentVol = getAudioVolume(theme, this.themeVolume);
      const { fadeDuration } = this.config.AUDIO.THEME_SOUND;
      fadeAudio(theme, currentVol, 0, fadeDuration);

      setTimeout(() => {
        if (theme && !isAudioPlaying(theme)) return;
        stopAudio(theme);
      }, this.config.AUDIO.THEME_SOUND.fadeDuration);
    });
  }

  play(soundName) {
    if (this.library[soundName]) {
      this.library[soundName].stop().play();
    }
  }

  playWithDelay(soundName, ms) {
    setTimeout(() => {
      this.play(soundName);
    }, ms);
  }

  unlockAudioPlayback() {
    if (this.audioUnlocked) return;

    safeCall(() => {
      if (this.library.background) {
        this.library.background.play();
      }
      if (this.library.theme) {
        this.library.theme.play();
      }
      this.audioUnlocked = true;
      console.log("Audio playback unlocked via user gesture");
    });
  }
}
