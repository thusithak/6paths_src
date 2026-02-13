 // Ensure GSAP is initialized correctly after dependencies load
  const initTimeline = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not found, retrying...');
      setTimeout(initTimeline, 100);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 1. Initial State Setup
    const milestones = gsap.utils.toArray('.milestone');
    const scrollLine = document.getElementById('scrollLine');

    // 2. Animate the Main Spine Progress
    gsap.to(scrollLine, {
      attr: { y2: 100 },
      ease: "none",
      scrollTrigger: {
        trigger: "#mainTimeline",
        start: "top 50%",
        end: "bottom 70%",
        scrub: 0.5
      }
    });

    // 3. Dynamic Color Changing for the Spine
    milestones.forEach((milestone, i) => {
      const isProf = milestone.classList.contains('professional');
      const targetColor = isProf ? '#63adf2' : '#63adf2';

      ScrollTrigger.create({
        trigger: milestone,
        start: "top center",
        end: "bottom center",
        onEnter: () => gsap.to(scrollLine, { stroke: targetColor, filter: `drop-shadow(0 0 12px ${targetColor})`, duration: 0.4 }),
        onEnterBack: () => gsap.to(scrollLine, { stroke: targetColor, filter: `drop-shadow(0 0 12px ${targetColor})`, duration: 0.4 })
      });

      // 4. Milestone Animations
      const card = milestone.querySelector('.card');
      const node = milestone.querySelector('.node');
      const connector = milestone.querySelector('.connector');
      const isMobile = window.innerWidth < 768;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: milestone,
          start: "top 70%", // Trigger slightly before it hits center to align with line
          toggleActions: "play none none reverse"
        }
      });

      tl.to(milestone, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
        .to(node, { 
        scale: 1, 
        backgroundColor: targetColor, // Fill effect
        borderColor: targetColor,
        duration: 0.3, 
        delay: 0.2,
        ease: "back.out(2)" 
      }, "-=0.6")
        .to(connector, { 
        width: isMobile ? "30px" : "8%", 
        duration: 0.4,
        delay: 0.2, 
        backgroundColor: targetColor, 
        ease: "power1.inOut" 
      }, "-=0.3")
        .to(card, { 
        borderColor: "rgba(255,255,255,0.2)", 
        x: 0, 
        duration: 0.2,
        delay: 0.2, 
      }, "-=0.2");
    });

    // 5. Parallax effect for cards
    milestones.forEach(m => {
      const card = m.querySelector('.card');
      gsap.to(card, {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: m,
          start: "top 70%",
          end: "bottom 75",
          scrub: true
        }
      });
    });
  };

  // Start initialization process
  if (document.readyState === 'complete') {
    initTimeline();
  } else {
    window.addEventListener('load', initTimeline);
  }