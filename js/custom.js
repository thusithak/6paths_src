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
            ? "🔄 Refresh detected. Skipping delay."
            : "🆕 First visit. Using full delay.",
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

            if (toggleTheme) {
                toggleTheme.addEventListener("click", () => {
                    isDark = !isDark;
                    applyThemeToDOM(isDark, false);
                    app.setVariable("ThemeState", isDark);
                });
            }
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
            if (iconLight && iconDark) {
            if (skipAnimation) {
                gsap.set(iconLight, { y: -40 });
                gsap.set(iconDark, { y: -20 });
            } else {
                gsap.to(iconLight, {
                y: -40,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                });
                gsap.to(iconDark, {
                y: -20,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                });
            }
            }
        } else {
            body.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
            if (iconLight && iconDark) {
            if (skipAnimation) {
                gsap.set(iconLight, { y: 0 });
                gsap.set(iconDark, { y: 20 });
            } else {
                gsap.to(iconLight, {
                y: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                });
                gsap.to(iconDark, {
                y: 20,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                });
            }
            }
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