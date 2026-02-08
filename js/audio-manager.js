/**
 * AudioManager - Handles audio setup and playback
 */
export class AudioManager {
  constructor() {
    this.library = {};
    this.isMuted = true; // SOURCE OF TRUTH for mute state
    this.backgroundVolume = 1.0; // SOURCE OF TRUTH for intended background volume
    this.themeVolume = 0.2; // SOURCE OF TRUTH for intended theme volume
    // scroll fade controls
    this.bgScrollFaded = false;
    this.scrollThreshold = 0.2; // 20% of viewport
    this.scrollFadeVolume = 0.0; // target volume when scrolled down
    this.themeActive = false;
    this.themeFadeDuration = 1000; // ms
    this.setupAudioLibrary();
    this.setupEventListeners();
  }

  /**
   * Initialize audio library with all sound files
   */
  setupAudioLibrary() {
    if (!window.Howler) {
      console.warn("Howler.js not loaded");
      return;
    }

    const audioFiles = this.getAudioConfig();
    const globalDefaults = {
      autoplay: false,
      volume: 2.0,
      preload: true,
    };

    audioFiles.forEach((file) => {
      this.library[file.name] = new Howl({
        ...globalDefaults,
        ...file,
      });
    });

    // If a background track exists, remember its configured volume and ensure it loops/plays
    if (this.library.background) {
      const bg = this.library.background;
      // Restore intended background volume from config (source of truth)
      const bgConfig = audioFiles.find(f => f.name === 'background');
      this.backgroundVolume = bgConfig?.volume || 1.0;
      // ensure loop is enabled on the background track
      try {
        bg.loop(true);
      } catch (e) {
        // ignore if loop not supported
      }
      // Try to play the background immediately (browsers may block autoplay until user interaction)
      try {
        bg.play();
      } catch (e) {
        // play may be blocked by browser; that's fine
      }
      // set initial background volume according to current mute state
      try {
        bg.volume(this.isMuted ? 0 : this.backgroundVolume);
      } catch (e) {
        // ignore
      }
    }

    // Start muted
    this.setMute(true);
  }

  /**
   * Get audio file configuration
   */
  getAudioConfig() {
    return [
      {
        name: "hover",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6943e874ff9f50d638a6cd33_7a01168271dbc7b91c0ee8c4ba7bdd70_btn_hover.mp3",
        volume: 3.0,
      },
      {
        name: "click",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6944045763acbfc93eba703d_menu_item_hover.mp3",
        volume: 0.5,
        rate: 2.0,
      },
      {
        name: "switch",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6943e874813e23b235b00634_btn_switch.mp3",
      },
      {
        name: "background",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6986e4704028b0a7490363fe_wind-blowing.mp3",
        loop: true,
        autoplay: false,
        volume: 1.0,
        preload: true,
      },
      {
        name: "theme",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/698774558bef78c27921d312_crickets.mp3",
        loop: true,
        autoplay: false,
        volume: 0.2,
        preload: true,
      },
    ];
  }

  /**
   * Attach event listeners to audio-triggered elements
   */
  setupEventListeners() {
    this.attachSoundToElements('[data-sound="hover"]', "hover", "mouseenter");
    this.attachSoundToElements('[data-sound-2="click"]', "click", "click");
    this.attachSoundToElements('[data-sound-3="switch"]', "switch", "click");
    // Fade background based on scroll position
    try {
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    } catch (e) {}
  }

  /**
   * Handle window scroll to fade background and theme when past threshold
   */
  handleScroll() {
    const bg = this.library.background;
    const theme = this.library.theme;
    if (!bg) return;
    // If site is muted, background should remain muted
    if (this.isMuted) return;

    const scrollRatio = (window.scrollY || window.pageYOffset) / (window.innerHeight || document.documentElement.clientHeight || 1);
    const fadeDuration = 600;

    if (scrollRatio >= this.scrollThreshold && !this.bgScrollFaded) {
      // fade down to low volume
      try {
        const current = (typeof bg.volume === 'function') ? bg.volume() : (this.backgroundVolume || 1.0);
        bg.fade(current, this.scrollFadeVolume, fadeDuration);
      } catch (e) {
        try { bg.volume(this.scrollFadeVolume); } catch (err) {}
      }
      
      // Also fade out theme sound during scroll
      if (theme && this.themeActive) {
        try {
          const currentVol = typeof theme.volume === 'function' ? theme.volume() : this.themeVolume;
          theme.fade(currentVol, this.scrollFadeVolume, fadeDuration);
        } catch (e) {
          try { theme.volume(this.scrollFadeVolume); } catch (err) {}
        }
      }
      
      this.bgScrollFaded = true;
    } else if (scrollRatio < this.scrollThreshold && this.bgScrollFaded) {
      // fade back up to intended background volume
      try {
        const current = (typeof bg.volume === 'function') ? bg.volume() : this.scrollFadeVolume;
        bg.fade(current, (this.backgroundVolume || 1.0), fadeDuration);
      } catch (e) {
        try { bg.volume(this.backgroundVolume || 1.0); } catch (err) {}
      }
      
      // Also fade back in theme sound when scrolling back up
      if (theme && this.themeActive) {
        try {
          const current = (typeof theme.volume === 'function') ? theme.volume() : this.scrollFadeVolume;
          theme.fade(current, this.themeVolume, fadeDuration);
        } catch (e) {
          try { theme.volume(this.themeVolume); } catch (err) {}
        }
      }
      
      this.bgScrollFaded = false;
    }
  }

  /**
   * Attach sound to elements with event
   */
  attachSoundToElements(selector, soundName, eventType) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      el.addEventListener(eventType, () => {
        this.play(soundName);
      });
    });
  }

  /**
   * Set mute state
   */
  setMute(isMuted) {
    this.isMuted = isMuted;
    if (!window.Howler) return;
    
    // Mute all sounds including background and theme
    Object.keys(this.library).forEach((key) => {
      const sound = this.library[key];
      if (!sound) return;
      try {
        sound.mute(isMuted);
      } catch (e) {
        // ignore
      }
    });

    // Fade background in/out for smoother muting experience
    const bg = this.library.background;
    const fadeDuration = 800; // ms
    if (bg) {
      // ensure playing so fade is audible
      try {
        if (!bg.playing()) bg.play();
      } catch (e) {}

      const target = isMuted ? 0 : (this.backgroundVolume || 1.0);
      try {
        const currentVol = typeof bg.volume === 'function' ? bg.volume() : 0;
        bg.fade(currentVol, target, fadeDuration);
      } catch (e) {
        // fallback to immediate set
        try { bg.volume(target); } catch (err) {}
      }
    }

    // Fade out theme sound if site is muted
    if (isMuted && this.themeActive) {
      this.fadeOutThemeSound();
    }

    console.log(isMuted ? "Site Started Muted" : "Site Unmuted");
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.setMute(!this.isMuted);
    return !this.isMuted;
  }

  /**
   * Fade in theme sound when dark theme activates
   */
  fadeInThemeSound() {
    const theme = this.library.theme;
    if (!theme || this.isMuted) return;

    this.themeActive = true;

    try {
      // Randomize playback rate (time signature) between 0.8 and 1.2
      const randomRate = 0.8 + Math.random() * 0.4;
      theme.rate(randomRate);

      // Ensure theme sound is playing
      if (!theme.playing()) {
        theme.play();
      }

      // Fade in from 0 to stored target volume (this.themeVolume is source of truth)
      theme.fade(0, this.themeVolume, this.themeFadeDuration);
    } catch (e) {
      console.warn("Error fading in theme sound:", e);
    }
  }

  /**
   * Fade out theme sound when dark theme deactivates
   */
  fadeOutThemeSound() {
    const theme = this.library.theme;
    if (!theme) return;

    this.themeActive = false;

    try {
      // Get current volume or use stored target volume
      const currentVol = typeof theme.volume === 'function' ? theme.volume() : this.themeVolume;
      theme.fade(currentVol, 0, this.themeFadeDuration);

      // Stop playing after fade completes
      setTimeout(() => {
        if (theme && !theme.playing()) return;
        try { theme.stop(); } catch (e) {}
      }, this.themeFadeDuration);
    } catch (e) {
      console.warn("Error fading out theme sound:", e);
    }
  }

  /**
   * Play a sound
   */
  play(soundName) {
    if (this.library[soundName]) {
      this.library[soundName].stop().play();
    }
  }

  /**
   * Play sound with delay
   */
  playWithDelay(soundName, ms) {
    setTimeout(() => {
      this.play(soundName);
    }, ms);
  }
}
