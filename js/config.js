export const CONFIG = {
  AUDIO: {
    GLOBAL_DEFAULTS: {
      autoplay: false,
      volume: 1.0,
      preload: true,
    },
    SOUNDS: {
      hover: {
        name: "hover",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6943e874ff9f50d638a6cd33_7a01168271dbc7b91c0ee8c4ba7bdd70_btn_hover.mp3",
        volume: 1.0,
      },
      click: {
        name: "click",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6944045763acbfc93eba703d_menu_item_hover.mp3",
        volume: 0.5,
        rate: 2.0,
      },
      switch: {
        name: "switch",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6943e874813e23b235b00634_btn_switch.mp3",
      },
      background: {
        name: "background",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6986e4704028b0a7490363fe_wind-blowing.mp3",
        loop: true,
        autoplay: false,
        preload: true,
      },
      theme: {
        name: "theme",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/698774558bef78c27921d312_crickets.mp3",
        loop: true,
        autoplay: false,
        preload: true,
      },
    },
    VOLUMES: {
      background: 1.0,  // Default background ambient sound volume
      theme: 0.1,       // Default theme (cricket) sounds volume
    },
    // Scroll behavior
    SCROLL: {
      threshold: 0.2,         // Fade background at 20% scroll depth
      fadeTarget: 0.0,        // Target volume when scrolled past threshold
      fadeDuration: 2000,
    },
    MUTE: {
      fadeDuration: 2000,
    },
    THEME_SOUND: {
      fadeDuration: 1000,
      rateRange: [0.8, 1.2],
    },
  },
  ANIMATION: {
    SWITCH: {
      width: 80,
      height: 40, 
      handleSize: 32,
      handlePadding: 0,
      travelDistance: 38,
      toggle: {
        duration: 0.2,
        ease: "power1.out", 
      },
      icon: {
        duration: 0.2, 
        delay: 0.0, 
      },
    },
    LOGO: {
      duration: 0.24,
      ease: "power1.out", 
    },
    SCENE: {
      firstVisitDelay: 2000,  // Initial settling delay for first-time visitors (ms)
      repeatVisitDelay: 100,  // Settling delay for repeat visitors (ms)
      loaderFadeFirst: 0.8,   // Loader fade duration on first visit (seconds)
      loaderFadeRepeat: 0.2,  // Loader fade duration on repeat visit (seconds)
      loaderHideDelay: 500,   // Delay before starting loader fade (ms)
    },
  },
  DOM: {
    CANVAS_ID: "canvas3d",
    LOADER_ID: "loader-overlay",
    SWITCH_IDS: {
      theme: "theme-switch",
      sound: "sound-switch",
    },
    EVENT_SELECTORS: {
      hover: '[data-sound="hover"]',      // Elements that trigger hover sound on mouseenter
      click: '[data-sound-2="click"]',    // Elements that trigger click sound on click
      switch: '[data-sound-3="switch"]',  // Elements that trigger switch sound on click
    },
    LOGO_SELECTORS: {
      dark: ".logo-img-blue",
      light: ".logo-img-black",
    },
  },
  STORAGE: {
    THEME_KEY: "theme", 
    SCENE_LOADED_KEY: "splineSceneLoaded",
  },
  SPLINE: {
    SCENE_URL: "https://prod.spline.design/At-lvMDyYgqgQz2B/scene.splinecode",
    THEME_STATE_VAR: "ThemeState",
    RUNTIME_URL: "https://unpkg.com/@splinetool/runtime",
  },
  getAudioFilesArray() {
    return Object.values(this.AUDIO.SOUNDS);
  },
};
