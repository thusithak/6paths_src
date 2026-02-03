import { Application } from "https://unpkg.com/@splinetool/runtime";

document.addEventListener("DOMContentLoaded", function () {

    const canvas = document.getElementById("canvas3d");
    const app = new Application(canvas);
    const loader = document.getElementById("loader-overlay");
    loader.addEventListener("click", () => {
        enableAudio();
    });
    const toggleTheme = document.getElementById("toggle-theme");
    const iconLight = toggleTheme ? toggleTheme.querySelector(".icon-light") : null;
    const iconDark = toggleTheme ? toggleTheme.querySelector(".icon-dark") : null;
    const body = document.body;
    let sceneRevealed = false;
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches;
    let isDark = savedTheme ? savedTheme === "dark" : systemPrefersDark;
    const isRepeatVisit = sessionStorage.getItem("splineSceneLoaded") === "true";
    const SETTLING_DELAY = isRepeatVisit ? 100 : 2000;
    console.log(
        isRepeatVisit
            ? "Refresh detected. Skipping delay."
            : "First visit. Using full delay.",
    );

    loader.style.opacity = "1";
    applyThemeToDOM(isDark, true);

    app
        .load("https://prod.spline.design/At-lvMDyYgqgQz2B/scene.splinecode")
        .then(() => {
            ensureSplineIsSynced(isDark);
            setTimeout(() => {
                canvas.style.opacity = "1";
                setTimeout(() => {
                    if (loader && !sceneRevealed) {
                        ensureSplineIsSynced(isDark);
                        sceneRevealed = true;
                        loader.style.transition = isRepeatVisit
                            ? "opacity 0.2s ease"
                            : "opacity 0.8s ease";
                        loader.style.opacity = "0";
                        setTimeout(
                            () => {
                                loader.style.display = "none";
                            },
                            isRepeatVisit ? 100 : 800,
                        );
                    }
                }, 500);
            }, SETTLING_DELAY);

            const themeToggle = new FrostedSwitch('theme-switch', {
                initialState: false, // Start on 'Sun' (Left)
                onToggle: (isActive) => {
                    if (isActive) {
                        console.log("Dark Mode Activated");
                        isDark = true;
                        applyThemeToDOM(isDark, true);
                    } else {
                        console.log("Light Mode Activated");
                        isDark = true;
                        applyThemeToDOM(isDark, true);
                    }
                    app.setVariable("ThemeState", isDark);
                }
            });

            /*if (toggleTheme) {
                toggleTheme.addEventListener("change", (event) => {
                    if (event.target.checked) {
                        
                    }
                    else {
                        applyThemeToDOM(isDark, true);
                    }
                    
                });
            }*/
        });

    function ensureSplineIsSynced(targetState) {
        const variables = app.getVariables();
        console.log(variables);
        if (!variables) return;
        let currentSplineValue;

        if (Array.isArray(variables)) {
            const v = variables.find((v) => v.name === "ThemeState");
            currentSplineValue = v ? v.value : undefined;
        } else if (typeof variables === "object") {
            currentSplineValue = variables["ThemeState"];
        }

        if (currentSplineValue !== undefined) {
            if (currentSplineValue !== targetState) {
                app.setVariable("ThemeState", targetState);
            } else {
            }
        } else {
            console.error(
                "Could not find variable 'ThemeState' in the Spline scene.",
            );
        }
    }

    function applyThemeToDOM(darkModeActive, skipAnimation = false) {
        if (darkModeActive) {
            body.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        } else {
            body.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
        }
    }


    //Sound 
    const toggleSound = document.getElementById("toggle-sound");
    if (window.Howler) {
        window.Howler.mute(true);
    }
    const enableAudio = () => {
        if (window.Howler) {
            window.Howler.mute(false);
            console.log("Site Unmuted");
        }
        toggleSound.removeEventListener('click', enableAudio);
    };
    toggleSound.addEventListener('click', enableAudio);

    const hoverElements = document.querySelectorAll('[data-sound="hover"]');
    const clickElements = document.querySelectorAll('[data-sound-2="click"]');
    const switchElements = document.querySelectorAll('[data-sound-3="switch"]');
    const audioFiles = [
        { name: 'hover', src: 'https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6943e874ff9f50d638a6cd33_7a01168271dbc7b91c0ee8c4ba7bdd70_btn_hover.mp3', volume: 3.0 },
        { name: 'click', src: 'https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6944045763acbfc93eba703d_menu_item_hover.mp3', volume: 0.5, rate: 2.0 }, // Ensure this path is correct
        { name: 'switch', src: 'https://cdn.prod.website-files.com/692c70d38a895bed7a284c58/6943e874813e23b235b00634_btn_switch.mp3' }
    ];

    const globalDefaults = {
        autoplay: false,
        volume: 2.0,
        preload: true
    };

    const library = {};
    audioFiles.forEach(file => {
        library[file.name] = new Howl({
            ...globalDefaults,
            ...file
        });
    });

    hoverElements.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            library.hover.stop().play();
        });
    });

    clickElements.forEach(btn => {
        btn.addEventListener('click', () => {
            library.click.stop().play();
        });
    });

    switchElements.forEach(el => {
        el.addEventListener('click', () => {
            library.switch.stop().play();
        });
    });
    function playWithDelay(soundName, ms) {
        setTimeout(() => {
            if (library[soundName]) {
                library[soundName].stop().play();
            }
        }, ms);
    }

});





const soundToggle = new FrostedSwitch('sound-switch', {
    initialState: true, // Start on 'Sound On' (Right)
    onToggle: (isActive) => {
        if (isActive) {
            console.log("Unmuted");
            // videoElement.muted = false;
        } else {
            console.log("Muted");
            // videoElement.muted = true;
        }
    }
});

class FrostedSwitch {
    constructor(elementId, options = {}) {
        // 1. Setup DOM Elements
        this.container = document.getElementById(elementId);
        if (!this.container) return console.error(`Switch not found: ${elementId}`);

        this.label = this.container.querySelector('.switch-label');
        this.handle = this.container.querySelector('.switch-handle');
        this.iconLeft = this.container.querySelector('.icon-left');
        this.iconRight = this.container.querySelector('.icon-right');
        this.input = this.container.querySelector('input[type="checkbox"]');

        // 2. Setup Configuration
        this.isOn = options.initialState || false;
        this.onToggle = options.onToggle || function () { }; // Empty function if none provided

        // Animation Config
        this.width = 96;
        this.handleSize = 36;
        this.padding = 8;
        this.travelDist = this.width - this.handleSize - this.padding;

        // 3. Initialize State (Set initial positions without animation)
        this.setVisualState(this.isOn, 0);

        // 4. Add Event Listener
        this.label.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });
    }

    toggle(forceState) {
        // Determine new state
        const newState = (typeof forceState !== 'undefined') ? forceState : !this.isOn;
        if (newState === this.isOn) return; // No change needed

        this.isOn = newState;

        // 1. Update Input (for forms)
        if (this.input) this.input.checked = this.isOn;

        // 2. Run Logic Callback
        this.onToggle(this.isOn);

        // 3. Animate Visuals
        this.setVisualState(this.isOn, 0.5);
    }

    setVisualState(active, duration) {
        // Determine which icon is active based on state
        // If ON: Handle moves Right, Right Icon glows.
        // If OFF: Handle moves Left, Left Icon glows.

        const xPos = active ? this.travelDist : 0;
        const activeIcon = active ? this.iconRight : this.iconLeft;
        const inactiveIcon = active ? this.iconLeft : this.iconRight;

        // Animate Handle
        gsap.to(this.handle, {
            x: xPos,
            duration: duration,
            ease: "back.out(1.7)"
        });

        // Animate Active Icon (Glow)
        gsap.to(activeIcon, {
            color: "rgba(255,255,255,1)",
            filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))",
            duration: 0.3,
            delay: duration > 0 ? 0.1 : 0 // slight delay only if animating
        });

        // Animate Inactive Icon (Dim)
        gsap.to(inactiveIcon, {
            color: "rgba(255,255,255,0.4)",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
            duration: 0.3
        });
    }
}