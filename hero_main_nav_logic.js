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

});