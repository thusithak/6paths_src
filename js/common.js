import "./main.js";

function runAdhocIntegrations() {
  if (
    typeof window.gsap === "undefined" ||
    typeof window.ScrollTrigger === "undefined"
  ) {
    console.warn(
      "GSAP or ScrollTrigger is not available. Skipping ad-hoc integrations.",
    );
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const navTl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: () => `top+=${window.innerHeight * 0.8} top`,
      end: "+=100",
      scrub: 0.7,
      onUpdate: (self) => {
        const navbarContainer = document.querySelector(".navbar-container");
        if (!navbarContainer) return;
        navbarContainer.classList.toggle("scrolled", self.progress > 0.1);
      },
      invalidateOnRefresh: true,
    },
  });

  navTl.to(".navbar-container", {
    maxWidth: "960px",
    duration: 0.5,
  });


    // Attach all global event listeners in a single function
    function attachGlobalEvents() {
      // Tooltip events
      document.addEventListener(
        "mouseenter",
        (e) => {
          if (!(e.target instanceof Element)) return;
          const trigger = e.target.closest("[data-tooltip]");
          if (!trigger) return;
          const tooltip = document.getElementById("tooltip");
          if (!tooltip) return;
          tooltip.innerHTML = trigger.getAttribute("data-tooltip");
          tooltip.className = "funky-tooltip";
          const activeThemeClass = Array.from(trigger.classList).find((cls) =>
            cls.startsWith("theme-")
          );
          if (activeThemeClass) {
            tooltip.classList.add(`tooltip-${activeThemeClass}`);
          }
          gsap.set(tooltip, {
            x: e.clientX - 0,
            y: e.clientY - 50,
          });
          gsap.to(tooltip, {
            scale: 1,
            opacity: 1,
            rotation: gsap.utils.random(-15, 5),
            duration: 0.8,
            ease: "elastic.out(1.2, 0.4)",
            overwrite: "auto",
          });
        },
        true
      );

      document.addEventListener(
        "mousemove",
        (e) => {
          if (!(e.target instanceof Element)) return;
          const trigger = e.target.closest("[data-tooltip]");
          if (!trigger) return;
          const tooltip = document.getElementById("tooltip");
          if (!tooltip) return;
          if (!window._moveX || !window._moveY) {
            window._moveX = gsap.quickTo(tooltip, "x", {
              duration: 0.15,
              ease: "power3.out",
            });
            window._moveY = gsap.quickTo(tooltip, "y", {
              duration: 0.15,
              ease: "power3.out",
            });
          }
          window._moveX(e.clientX - 0);
          window._moveY(e.clientY - 50);
        },
        true
      );

      document.addEventListener(
        "mouseleave",
        (e) => {
          if (!(e.target instanceof Element)) return;
          const trigger = e.target.closest("[data-tooltip]");
          if (!trigger) return;
          const tooltip = document.getElementById("tooltip");
          if (!tooltip) return;
          gsap.to(tooltip, {
            scale: 0,
            opacity: 0,
            rotation: 0,
            duration: 0.3,
            ease: "back.in(1.5)",
            overwrite: "auto",
          });
        },
        true
      );

      // Jump animation for images with class "app_logo_list img"
      document.body.addEventListener('mouseenter', function(event) {
        if (event.target.matches('.app_logo_list img')) {
          console.log('Element hovered via delegation:', event.target.alt);
          const img = event.target;
          gsap.set(img, { transformOrigin: "50% 100%" });
          const tl = gsap.timeline();
          tl.to(img, {
            duration: 0.1,
            scaleX: 1.05,
            scaleY: 0.95,
            ease: "power1.inOut",
          })
            .to(img, {
              duration: 0.1,
              y: -20, // Height of the jump
              scaleX: 0.8,
              scaleY: 1.2,
              ease: "power2.out",
            })
            .to(img, {
              duration: 0.1,
              y: 0,
              scaleX: 1.1,
              scaleY: 0.9,
              ease: "power2.in",
            })
            .to(img, {
              duration: 0.2,
              scaleX: 1,
              scaleY: 1,
              ease: "elastic.out(1, 0.3)", // The "jello" settle effect
            });
        }
      });

      // Setup copy email functionality
      const copyBtn = document.getElementById('copyEmailBtn');
      const copyWrapper = document.querySelector('.copy-wrapper');
  
      copyBtn.addEventListener('click', async () => {
          // A. Grab the email address
          const emailToCopy = copyBtn.getAttribute('data-email');
  
          try {
              // B. Write to clipboard
              await navigator.clipboard.writeText(emailToCopy);
              
              // C. Trigger Confetti Burst from the button's position
              triggerConfetti(copyBtn);
  
              // D. Trigger GSAP "1up" Animation
              trigger1UpAnimation(copyWrapper);
              
          } catch (err) {
              console.error('Failed to copy: ', err);
              alert('Failed to copy email.');
          }
      });
  
      // --- Helper Functions ---
  
      function triggerConfetti(element) {
          // Calculate coordinates relative to the screen for origin
          const rect = element.getBoundingClientRect();
          const xOrigin = (rect.left + rect.width / 2) / window.innerWidth;
          const yOrigin = (rect.top + rect.height / 2) / window.innerHeight;
  
          confetti({
              particleCount: 100,
              spread: 70,
              origin: { x: xOrigin, y: yOrigin },
              disableForReducedMotion: true // Respect user accessibility settings
          });
      }
  
      function trigger1UpAnimation(wrapperElement) {
          // 1. Create the element dynamically so multiple clicks create multiple animations
          const oneUp = document.createElement('span');
          oneUp.classList.add('one-up-text');
          oneUp.innerText = 'Copied!';
          wrapperElement.appendChild(oneUp);
  
          // 2. Set initial position (just above the button)
          gsap.set(oneUp, { y: -10, opacity: 0 });
  
          // 3. Run the GSAP timeline (floats up while fading out)
          gsap.to(oneUp, {
              y: -60,            // Distance to float upwards
              opacity: 1,       // Quick fade in
              duration: 0.4,    // Animation length
              ease: "power2.out",
              // Chain the fade out immediately after the peak
              onComplete: () => {
                  gsap.to(oneUp, {
                      opacity: 0,
                      duration: 0.8,
                      ease: "power2.in",
                      // Remove the element from DOM after the full animation
                      onComplete: () => {
                          oneUp.remove();
                      }
                  });
              }
          });
      }


    }

    // Attach all global events (tooltips, logo jump, etc.)

    attachGlobalEvents();


}




if (document.readyState === "complete") {
  runAdhocIntegrations();
} else {
  window.addEventListener("load", runAdhocIntegrations, { once: true });
}


// No exports here; integrations will be managed by Application in main.js


