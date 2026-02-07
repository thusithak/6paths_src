/**
 * AudioManager - Handles audio setup and playback
 */
export class AudioManager {
  constructor() {
    this.library = {};
    this.isMuted = true;
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
      // store intended background volume (fallback to 1.0)
      this.backgroundVolume = (typeof bg._volume !== 'undefined') ? bg._volume : (audioFiles.find(f => f.name === 'background')?.volume || 1.0);
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
      // Background ambient loop — replace the `src` URL with your ambient loop file.
      {
        name: "background",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6986e4704028b0a7490363fe_wind-blowing.mp3",
        loop: true,
        autoplay: true,
        volume: 0.5,
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
    // Mute/unmute all non-background sounds per-instance so we can fade background independently
    Object.keys(this.library).forEach((key) => {
      const sound = this.library[key];
      if (!sound) return;
      if (key === "background") return; // handled separately below
      try {
        sound.mute(isMuted);
      } catch (e) {
        // ignore
      }
    });

    // Fade background in/out rather than hard mute
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
