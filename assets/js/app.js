/* =========================================================
   app.js — Common: Lenis smooth scroll, header behavior,
   page progress, reveal-on-scroll, custom cursor,
   reduced-motion + touch detection.
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  const boot = () => {
    if (!window.gsap || !window.ScrollTrigger) {
      return requestAnimationFrame(boot);
    }

    gsap.registerPlugin(ScrollTrigger);

    /* --- Lenis smooth scroll --- */
    let lenis = null;
    if (!prefersReduced && window.Lenis) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2,
      });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    /* --- Page progress bar --- */
    const bar = document.querySelector(".page-progress");
    if (bar) {
      const updateProgress = () => {
        const h = document.documentElement;
        const scrolled = h.scrollTop;
        const total = h.scrollHeight - h.clientHeight;
        const pct = total > 0 ? (scrolled / total) * 100 : 0;
        bar.style.width = pct + "%";
      };
      window.addEventListener("scroll", updateProgress, { passive: true });
      window.addEventListener("resize", updateProgress);
      updateProgress();
    }

    /* --- Header --- */
    const header = document.querySelector("[data-header]");
    if (header) {
      const setScrolled = () => {
        header.setAttribute("data-scrolled", window.scrollY > 20 ? "true" : "false");
      };
      setScrolled();
      window.addEventListener("scroll", setScrolled, { passive: true });

      const darkSections = Array.from(document.querySelectorAll(".hero, .message, .diagnosis__stage"));
      const detectDark = () => {
        const headerY = 24;
        let onDark = false;
        for (const sec of darkSections) {
          const r = sec.getBoundingClientRect();
          if (r.top <= headerY && r.bottom > headerY) {
            if (sec.classList.contains("diagnosis__stage")) {
              if (sec.getAttribute("data-phase") === "copy") onDark = true;
            } else {
              onDark = true;
            }
            break;
          }
        }
        header.setAttribute("data-on-dark", onDark ? "true" : "false");
      };
      detectDark();
      window.addEventListener("scroll", detectDark, { passive: true });
      window.addEventListener("resize", detectDark);
      const stage = document.querySelector("[data-diagnosis-stage]");
      if (stage) {
        const mo = new MutationObserver(detectDark);
        mo.observe(stage, { attributes: true, attributeFilter: ["data-phase"] });
      }
    }

    /* --- Generic reveal --- */
    const toReveal = document.querySelectorAll("[data-reveal]");
    toReveal.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => el.classList.add("is-in"),
      });
    });

    /* --- Scroll velocity distortion --- */
    if (!prefersReduced) initScrollVelocity();

    /* --- Custom Cursor --- */
    if (!isTouch && !prefersReduced) {
      initCursor();
    }

    window.__lenis = lenis;
    window.__reducedMotion = prefersReduced;
    window.__isTouch = isTouch;

    document.dispatchEvent(new CustomEvent("app:ready"));
  };

  function initScrollVelocity() {
    const target = document.querySelector("[data-velocity-target]") || document.querySelector("main");
    if (!target) return;

    let lastY = window.scrollY;
    let velocity = 0;       // instantaneous
    let smooth = 0;         // eased displayed value
    const root = document.documentElement;

    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      const d = Math.abs(y - lastY);
      velocity = Math.min(velocity + d, 200);
      lastY = y;
    }, { passive: true });

    const tick = () => {
      smooth += (velocity - smooth) * 0.18;
      velocity *= 0.86;
      const norm = Math.min(smooth / 80, 1); // 0..1
      // Soft curve so small scrolls don't distort
      const curve = Math.pow(norm, 1.6);
      root.style.setProperty("--scroll-speed", curve.toFixed(3));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function initCursor() {
    const cursor = document.querySelector("[data-cursor]");
    if (!cursor) return;
    const dot = cursor.querySelector(".cursor__dot");
    const ring = cursor.querySelector(".cursor__ring");
    const label = cursor.querySelector("[data-cursor-label]");

    const quickDotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const quickDotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    const quickRingX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "expo.out" });
    const quickRingY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "expo.out" });
    const quickLblX = gsap.quickTo(label, "x", { duration: 0.3, ease: "expo.out" });
    const quickLblY = gsap.quickTo(label, "y", { duration: 0.3, ease: "expo.out" });

    let shown = false;
    window.addEventListener("pointermove", (e) => {
      quickDotX(e.clientX);
      quickDotY(e.clientY);
      quickRingX(e.clientX);
      quickRingY(e.clientY);
      quickLblX(e.clientX + 18);
      quickLblY(e.clientY + 18);
      if (!shown) {
        cursor.classList.add("is-visible");
        shown = true;
      }
    });

    window.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
    window.addEventListener("mouseenter", () => cursor.classList.add("is-visible"));

    // Hover detection (delegated)
    const hoverables = "a, button, [role='button'], [data-magnetic], [data-hoverable]";
    const buttons = "[data-magnetic], .message__video-thumb";

    const isMatch = (el, sel) => el && el.matches && el.matches(sel);

    document.addEventListener("pointerover", (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const btn = t.closest(buttons);
      const hov = t.closest(hoverables);
      if (btn) {
        cursor.classList.add("is-hovering-btn");
        cursor.classList.remove("is-hovering");
      } else if (hov) {
        cursor.classList.add("is-hovering");
      }
      // Data-label cursor enhancement
      const labelEl = t.closest("[data-cursor-text]");
      if (labelEl) {
        label.textContent = labelEl.getAttribute("data-cursor-text") || "";
        cursor.classList.add("has-label");
      }
    });
    document.addEventListener("pointerout", (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      if (t.closest(buttons)) cursor.classList.remove("is-hovering-btn");
      if (t.closest(hoverables)) cursor.classList.remove("is-hovering");
      if (t.closest("[data-cursor-text]")) cursor.classList.remove("has-label");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
