/* =========================================================
   result.js — Diagnosis result page interactions:
   video play + reveal on scroll
   ========================================================= */
(function () {
  "use strict";

  const init = () => {
    // Lazy video load
    const thumb = document.querySelector("[data-video-thumb]");
    const embed = document.querySelector("[data-video-embed]");
    if (thumb && embed) {
      thumb.addEventListener("click", () => {
        const iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube-nocookie.com/embed/4mNfTczF5PQ?rel=0&autoplay=1&modestbranding=1";
        iframe.title = "診断タイプ別メッセージ";
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share");
        iframe.setAttribute("allowfullscreen", "");
        embed.appendChild(iframe);
        embed.hidden = false;
        thumb.style.opacity = "0";
        thumb.style.pointerEvents = "none";
      }, { once: true });
    }

    // Gentle reveal on scroll for result sections
    if (!window.gsap || !window.ScrollTrigger) return;

    const els = document.querySelectorAll(".result-section, .result-hero, .result-cta");
    els.forEach((el) => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            once: true,
          },
        }
      );
    });

    // Strength cards - stagger
    const strengths = document.querySelectorAll(".result-strength");
    if (strengths.length) {
      gsap.fromTo(strengths,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1,
          stagger: 0.12,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: strengths[0].parentElement,
            start: "top 75%",
            once: true,
          },
        }
      );
    }

    // Traps - sequential
    const traps = document.querySelectorAll(".result-trap");
    if (traps.length) {
      gsap.fromTo(traps,
        { x: -28, opacity: 0 },
        {
          x: 0, opacity: 1,
          stagger: 0.15,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: traps[0].parentElement,
            start: "top 75%",
            once: true,
          },
        }
      );
    }

    // Actions - sequential from left
    const actions = document.querySelectorAll(".result-action");
    if (actions.length) {
      gsap.fromTo(actions,
        { x: -24, opacity: 0 },
        {
          x: 0, opacity: 1,
          stagger: 0.14,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: actions[0].parentElement,
            start: "top 78%",
            once: true,
          },
        }
      );
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    document.addEventListener("app:ready", init, { once: true });
    setTimeout(init, 320);
  }
})();
