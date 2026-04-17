/* =========================================================
   hero.js — Hero intro, mouse parallax on photo, video reveal
   ========================================================= */
(function () {
  "use strict";

  const init = () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const reduced = window.__reducedMotion;
    const isTouch = window.__isTouch;

    /* --- Hero title: char-by-char reveal (kinetic) --- */
    const titleEl = document.querySelector(".hero__title-line");
    if (titleEl) {
      const text = titleEl.textContent;
      titleEl.textContent = "";
      const frag = document.createDocumentFragment();
      for (const ch of text) {
        const s = document.createElement("span");
        s.className = "char";
        s.textContent = ch === " " ? "\u00A0" : ch;
        frag.appendChild(s);
      }
      titleEl.appendChild(frag);

      const chars = titleEl.querySelectorAll(".char");
      if (reduced) {
        gsap.set(chars, { y: 0, opacity: 1 });
      } else {
        gsap.fromTo(chars,
          { y: "110%", opacity: 0, rotateX: -60 },
          {
            y: "0%", opacity: 1, rotateX: 0,
            stagger: 0.055,
            duration: 1.15,
            ease: "expo.out",
            delay: 0.6,
          }
        );
      }
    }

    /* --- Mouse reactive parallax on hero photo --- */
    const photo = document.querySelector("[data-photo-parallax]");
    if (photo && !reduced && !isTouch) {
      const quickX = gsap.quickTo(photo, "x", { duration: 1.0, ease: "expo.out" });
      const quickY = gsap.quickTo(photo, "y", { duration: 1.0, ease: "expo.out" });
      const quickScale = gsap.quickTo(photo, "scale", { duration: 1.4, ease: "expo.out" });

      window.addEventListener("pointermove", (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;   // -0.5..0.5
        const ny = e.clientY / window.innerHeight - 0.5;
        quickX(-nx * 26);
        quickY(-ny * 22);
      });
    }

    /* --- Scroll parallax: photo scale + opacity --- */
    const visual = document.querySelector(".hero__visual");
    if (visual && !reduced) {
      gsap.to(visual, {
        yPercent: 10,
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    /* --- Title block parallax --- */
    const content = document.querySelector(".hero__content");
    if (content && !reduced) {
      gsap.to(content, {
        yPercent: -22,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    /* --- Message section reveal --- */
    const videoSec = document.querySelector(".message");
    const videoFrame = document.querySelector("[data-video]");
    if (videoSec && videoFrame) {
      ScrollTrigger.create({
        trigger: videoSec,
        start: "top 68%",
        once: true,
        onEnter: () => videoFrame.classList.add("is-in"),
      });
    }

    /* --- Play button → inject iframe --- */
    const thumb = document.querySelector("[data-video-thumb]");
    const embed = document.querySelector("[data-video-embed]");
    if (thumb && embed) {
      thumb.addEventListener("click", () => {
        const iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube-nocookie.com/embed/4mNfTczF5PQ?rel=0&autoplay=1&modestbranding=1";
        iframe.title = "奥山からのメッセージ";
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share");
        iframe.setAttribute("allowfullscreen", "");
        embed.appendChild(iframe);
        embed.hidden = false;
        thumb.style.opacity = "0";
        thumb.style.pointerEvents = "none";
      }, { once: true });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    document.addEventListener("app:ready", init, { once: true });
    setTimeout(init, 340);
  }
})();
