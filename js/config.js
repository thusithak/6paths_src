export const CONFIG = {
  // Audio
  AUDIO: {
    GLOBAL_DEFAULTS: {
      autoplay: false,
      volume: 2.0,
      preload: true,
    },
    // Sound file definitions
    SOUNDS: {
      hover: {
        name: "hover",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6943e874ff9f50d638a6cd33_7a01168271dbc7b91c0ee8c4ba7bdd70_btn_hover.mp3",
        volume: 3.0,
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
        volume: 1.0,
        preload: true,
      },
      theme: {
        name: "theme",
        src: "https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/698774558bef78c27921d312_crickets.mp3",
        loop: true,
        autoplay: false,
        volume: 0.2,
        preload: true,
      },
    },
    // Volume configuration
    VOLUMES: {
      background: 1.0,  // Default background ambient sound volume
      theme: 0.2,       // Default theme (cricket) sounds volume
    },
    // Scroll behavior
    SCROLL: {
      threshold: 0.2,         // Fade background at 20% scroll depth
      fadeTarget: 0.0,        // Target volume when scrolled past threshold
      fadeDuration: 600,      // Duration of scroll fade transition (ms)
    },
    // Mute behavior
    MUTE: {
      fadeDuration: 800,      // Duration of fade when muting/unmuting (ms)
    },
    // Theme sound (cricket) fade
    THEME_SOUND: {
      fadeDuration: 1000,     // Duration to fade in/out theme sound (ms)
      rateRange: [0.8, 1.2],  // Playback rate randomization for natural sound
    },
  },
  // Animation
  ANIMATION: {
    // Switch toggle animation
    SWITCH: {
      // Dimensions (must match custom.css --switch-width, --switch-height, --handle-size)
      width: 80,              // Switch container width (pixels)
      height: 40,             // Switch container height (pixels)
      handleSize: 32,         // Circular handle diameter (pixels)
      handlePadding: 0,       // Padding around handle during layout
      travelDistance: 38,     // Distance handle travels (width - handleSize - 10)

      // Toggle animation timing
      toggle: {
        duration: 0.5,        // Handle animation duration (seconds)
        ease: "back.out(0.8)", // GSAP easing function
      },

      // Icon animation (active/inactive state indicators)
      icon: {
        duration: 0.3,        // Icon fade/glow duration (seconds)
        delay: 0.1,           // Delay before icon animation starts (seconds)
      },
    },
    // Logo fade transition
    LOGO: {
      duration: 0.24,         // Logo crossfade duration (seconds)
      ease: "power1.out",     // GSAP easing function
    },
    // Scene loading animation
    SCENE: {
      firstVisitDelay: 2000,  // Initial settling delay for first-time visitors (ms)
      repeatVisitDelay: 100,  // Settling delay for repeat visitors (ms)
      loaderFadeFirst: 0.8,   // Loader fade duration on first visit (seconds)
      loaderFadeRepeat: 0.2,  // Loader fade duration on repeat visit (seconds)
      loaderHideDelay: 500,   // Delay before starting loader fade (ms)
    },
  },
  // DOM selectors
  DOM: {
    // Canvas and loader IDs
    CANVAS_ID: "canvas3d",
    LOADER_ID: "loader-overlay",

    // Switch IDs
    SWITCH_IDS: {
      theme: "theme-switch",
      sound: "sound-switch",
    },

    // Event selectors for audio
    EVENT_SELECTORS: {
      hover: '[data-sound="hover"]',      // Elements that trigger hover sound on mouseenter
      click: '[data-sound-2="click"]',    // Elements that trigger click sound on click
      switch: '[data-sound-3="switch"]',  // Elements that trigger switch sound on click
    },

    // Logo images
    LOGO_SELECTORS: {
      dark: ".logo-img-blue",             // Logo shown in dark theme
      light: ".logo-img-black",           // Logo shown in light theme
    },
  },
  // Storage
  STORAGE: {
    // localStorage keys
    THEME_KEY: "theme",                   // Stores "dark" or "light"
    
    // sessionStorage keys
    SCENE_LOADED_KEY: "splineSceneLoaded", // Marks scene as loaded for this session
  },
  // Spline scene
  SPLINE: {
    // Spline scene URL - the main 3D environment
    SCENE_URL: "https://prod.spline.design/At-lvMDyYgqgQz2B/scene.splinecode",
    
    // Variable name for theme state synchronization
    THEME_STATE_VAR: "ThemeState",
    
    // Spline runtime import URL
    RUNTIME_URL: "https://unpkg.com/@splinetool/runtime",
  },
  getAudioFilesArray() {
    return Object.values(this.AUDIO.SOUNDS);
  },
};
