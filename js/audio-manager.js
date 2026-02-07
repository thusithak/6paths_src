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
    window.Howler.mute(isMuted);
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
