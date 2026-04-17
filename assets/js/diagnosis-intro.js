/* =========================================================
   diagnosis-intro.js
   Cinematic scroll orchestration with kinetic typography:
   - Title phase: text pinned center
   - Copy phase (dark, particles): 3 lines each enter from below,
     settle at center, then drift up and fade as scroll continues
   - CTA phase: final call-to-action
   ========================================================= */
(function () {
  "use strict";

  let particleStarted = false;

  const initPhases = () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const reduced = window.__reducedMotion;

    const section = document.querySelector(".diagnosis");
    const stage = document.querySelector("[data-diagnosis-stage]");
    if (!section || !stage) return;

    const titleLayer = stage.querySelector("[data-layer='title']");
    const copyLayer = stage.querySelector("[data-layer='copy']");
    const ctaLayer = stage.querySelector("[data-layer='cta']");
    const lines = Array.from(stage.querySelectorAll(".diagnosis__line"));
    const rails = Array.from(stage.querySelectorAll(".diagnosis__rail-dot"));

    titleLayer.classList.add("is-active");

    // Split title into chars with playful random seeds
    const splitTarget = stage.querySelector("[data-title-split]");
    const titleChars = [];
    if (splitTarget) {
      splitTarget.querySelectorAll(".dline").forEach((line, lineIdx) => {
        const text = line.textContent;
        line.textContent = "";
        for (const ch of text) {
          const s = document.createElement("span");
          s.className = "dchar";
          s.textContent = ch === " " ? "\u00A0" : ch;
          // Seed entry (from various directions — bias from top/sides)
          const entryAngle = Math.random() * Math.PI * 2;
          const entryDist = 200 + Math.random() * 260;
          s._ex = Math.cos(entryAngle) * entryDist;
          s._ey = Math.sin(entryAngle) * entryDist - 60; // slight upward bias
          s._er = (Math.random() - 0.5) * 160;
          s._es = 0.3 + Math.random() * 0.3;
          // Seed exit (different random path)
          const exitAngle = Math.random() * Math.PI * 2;
          const exitDist = 260 + Math.random() * 300;
          s._xx = Math.cos(exitAngle) * exitDist;
          s._xy = Math.sin(exitAngle) * exitDist + 60; // slight downward bias
          s._xr = (Math.random() - 0.5) * 180;
          s._xs = 0.2 + Math.random() * 0.3;
          // Per-char delay offset for stagger
          s._offset = (lineIdx * 6 + (s.parentElement ? s.parentElement.children.length : 0)) * 0.006;
          line.appendChild(s);
          titleChars.push(s);
        }
      });
    }

    // Phase boundaries along diagnosis section scroll (0..1)
    // 0.00 - 0.18  -> title
    // 0.22 - 0.82  -> copy (with 3 lines over this span)
    // 0.86 - 1.00  -> cta
    // Between: brief transitions (handled via CSS)

    const TITLE_END   = 0.18;
    const COPY_START  = 0.22;
    const COPY_END    = 0.82;
    const CTA_START   = 0.86;

    // Each line gets its own sub-range with generous dwell time
    // Copy span is 0.60 (=0.82-0.22); split into 3 overlapping windows
    const COPY_SPAN = COPY_END - COPY_START;
    const lineRanges = [
      // Each line: [appear, settle-in-center, start-exit, fully-gone]
      [ COPY_START + COPY_SPAN * 0.00,
        COPY_START + COPY_SPAN * 0.18,
        COPY_START + COPY_SPAN * 0.24,
        COPY_START + COPY_SPAN * 0.40 ],
      [ COPY_START + COPY_SPAN * 0.34,
        COPY_START + COPY_SPAN * 0.50,
        COPY_START + COPY_SPAN * 0.58,
        COPY_START + COPY_SPAN * 0.72 ],
      [ COPY_START + COPY_SPAN * 0.66,
        COPY_START + COPY_SPAN * 0.82,
        COPY_START + COPY_SPAN * 0.90,
        COPY_START + COPY_SPAN * 1.00 ],
    ];

    const setPhase = (phase) => {
      if (stage.getAttribute("data-phase") === phase) return;
      stage.setAttribute("data-phase", phase);
      titleLayer.classList.toggle("is-active", phase === "title");
      copyLayer.classList.toggle("is-active", phase === "copy");
      ctaLayer.classList.toggle("is-active", phase === "cta");
    };

    setPhase("title");

    // Smooth ease helpers
    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const easeInExpo = (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10));
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const easeInCubic = (t) => t * t * t;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const mapRange = (v, a, b) => clamp01((v - a) / (b - a));

    // Title char assembly/disassembly ranges (within whole section progress 0..1)
    // Assemble: 0.00 -> 0.10
    // Settled:  0.10 -> 0.14
    // Disassemble: 0.14 -> 0.22
    const TITLE_ASSEMBLE_END = 0.10;
    const TITLE_STABLE_END   = 0.14;
    const TITLE_EXIT_END     = 0.22;

    const updateTitleChars = (p) => {
      if (!titleChars.length) return;
      titleChars.forEach((c, i) => {
        const off = i * 0.004;
        if (p < TITLE_ASSEMBLE_END + off) {
          // Assembling
          const t = clamp01((p - off) / TITLE_ASSEMBLE_END);
          const k = easeOutCubic(t);
          const inv = 1 - k;
          c.style.transform =
            `translate(${(c._ex * inv).toFixed(1)}px, ${(c._ey * inv).toFixed(1)}px) ` +
            `rotate(${(c._er * inv).toFixed(1)}deg) ` +
            `scale(${(c._es + (1 - c._es) * k).toFixed(3)})`;
          c.style.opacity = k.toFixed(3);
          c.style.filter = `blur(${((1 - k) * 8).toFixed(2)}px)`;
        } else if (p < TITLE_STABLE_END) {
          // Settled
          c.style.transform = "translate(0,0) rotate(0) scale(1)";
          c.style.opacity = "1";
          c.style.filter = "blur(0)";
        } else if (p < TITLE_EXIT_END + off) {
          // Disassembling
          const t = clamp01((p - TITLE_STABLE_END) / (TITLE_EXIT_END - TITLE_STABLE_END));
          const k = easeInCubic(t);
          c.style.transform =
            `translate(${(c._xx * k).toFixed(1)}px, ${(c._xy * k).toFixed(1)}px) ` +
            `rotate(${(c._xr * k).toFixed(1)}deg) ` +
            `scale(${(1 - (1 - c._xs) * k).toFixed(3)})`;
          c.style.opacity = (1 - k).toFixed(3);
          c.style.filter = `blur(${(k * 8).toFixed(2)}px)`;
        } else {
          c.style.opacity = "0";
        }
      });
    };

    // Per-line playful entry/exit directions (different angles for each line)
    const linePaths = [
      // [enterX, enterY, enterRot, exitX, exitY, exitRot]
      [  180, 120,  -14,  -220, -100,   18 ],
      [ -220,  80,   10,   200,  120,  -16 ],
      [  140, -100,  18,  -180,  140,  -12 ],
    ];

    const updateLine = (lineEl, progress, range, lineIdx) => {
      const [apStart, apEnd, exStart, exEnd] = range;
      const path = linePaths[lineIdx] || [0, 80, 0, 0, -80, 0];
      const [exX, exY, exR, xxX, xxY, xxR] = path;

      const appearP = mapRange(progress, apStart, apEnd);
      const exitP = mapRange(progress, exStart, exEnd);

      let tx = 0, ty = 0, rot = 0, opacity, blur, scale;
      if (progress < apStart) {
        tx = exX; ty = exY; rot = exR; opacity = 0; blur = 10; scale = 0.92;
      } else if (progress < apEnd) {
        const t = easeOutExpo(appearP);
        const inv = 1 - t;
        tx = exX * inv; ty = exY * inv; rot = exR * inv;
        opacity = t; blur = 10 * inv; scale = 0.92 + 0.08 * t;
      } else if (progress < exStart) {
        tx = 0; ty = 0; rot = 0; opacity = 1; blur = 0; scale = 1;
      } else if (progress < exEnd) {
        const t = easeInExpo(exitP);
        tx = xxX * t; ty = xxY * t; rot = xxR * t;
        opacity = 1 - t; blur = 10 * t; scale = 1 - 0.08 * t;
      } else {
        tx = xxX; ty = xxY; rot = xxR; opacity = 0; blur = 10; scale = 0.92;
      }

      lineEl.style.transform =
        `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      lineEl.style.opacity = opacity.toFixed(3);
      lineEl.style.filter = blur > 0 ? `blur(${blur.toFixed(2)}px)` : "";

      const isCenter = progress >= apEnd && progress < exStart;
      lineEl.classList.toggle("is-center", isCenter);
      return isCenter;
    };

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        // Determine phase
        if (p < TITLE_END + 0.02) setPhase("title");
        else if (p < CTA_START) setPhase("copy");
        else setPhase("cta");

        // Title chars playful assembly/disassembly
        updateTitleChars(p);

        // Update each copy line
        let activeIndex = -1;
        lines.forEach((ln, i) => {
          const centered = updateLine(ln, p, lineRanges[i], i);
          if (centered) activeIndex = i;
        });

        // Rail dots
        rails.forEach((r, i) => {
          r.classList.toggle("is-active", i === activeIndex);
        });

        // Start particles when entering copy phase
        if (p >= COPY_START - 0.05 && !particleStarted && !reduced) {
          particleStarted = true;
          startParticles();
        }
      },
    });

    // Initial state: chars fully scattered (before any scroll)
    updateTitleChars(0);

    // Mouse parallax on chars: subtle per-char drift based on pointer
    if (!reduced && !window.__isTouch && titleChars.length) {
      titleChars.forEach((c) => {
        c._pxf = (Math.random() - 0.5) * 0.08;
        c._pyf = (Math.random() - 0.5) * 0.08;
      });
      let mx = 0, my = 0;
      let targetMx = 0, targetMy = 0;

      window.addEventListener("pointermove", (e) => {
        targetMx = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMy = (e.clientY / window.innerHeight - 0.5) * 2;
      });

      const paraTick = () => {
        mx += (targetMx - mx) * 0.08;
        my += (targetMy - my) * 0.08;
        const rect = stage.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (inView) {
          const currentPhase = stage.getAttribute("data-phase");
          if (currentPhase === "title") {
            titleChars.forEach((c) => {
              const existing = c.style.transform || "";
              const px = mx * c._pxf * 60;
              const py = my * c._pyf * 60;
              // Apply parallax as additional translation layer
              c.style.setProperty("--px", `${px.toFixed(2)}px`);
              c.style.setProperty("--py", `${py.toFixed(2)}px`);
            });
          }
        }
        requestAnimationFrame(paraTick);
      };
      requestAnimationFrame(paraTick);
    }
  };

  /* ---------- Magnetic button ---------- */
  const initMagnetic = () => {
    if (window.__reducedMotion || window.__isTouch) return;
    const btn = document.querySelector("[data-magnetic]");
    if (!btn || !window.gsap) return;

    const strength = 0.3;
    const reset = 0.55;
    const quickX = gsap.quickTo(btn, "x", { duration: reset, ease: "power3.out" });
    const quickY = gsap.quickTo(btn, "y", { duration: reset, ease: "power3.out" });

    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      quickX((e.clientX - cx) * strength);
      quickY((e.clientY - cy) * strength);
    });
    btn.addEventListener("pointerleave", () => {
      quickX(0);
      quickY(0);
    });

    btn.addEventListener("click", () => {
      btn.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0.96)" }, { transform: "scale(1)" }],
        { duration: 240, easing: "ease-out" }
      );
      // Ink wipe transition to quiz
      const wipe = document.createElement("div");
      wipe.style.cssText = "position:fixed;inset:0;background:#06131A;z-index:9998;transform:scaleY(0);transform-origin:bottom;transition:transform 620ms cubic-bezier(0.76,0,0.24,1);pointer-events:none;";
      document.body.appendChild(wipe);
      requestAnimationFrame(() => {
        wipe.style.transform = "scaleY(1)";
      });
      setTimeout(() => { window.location.href = "quiz/index.html"; }, 620);
    });
  };

  /* ---------- WebGL particles ---------- */
  function startParticles() {
    if (!window.THREE) return;
    const canvas = document.querySelector("[data-particles]");
    if (!canvas) return;

    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const dprAware = () => {
      const { clientWidth, clientHeight } = canvas;
      renderer.setSize(clientWidth, clientHeight, false);
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 50);
    camera.position.z = 8;

    const isMobile = matchMedia("(max-width: 640px)").matches;
    const count = isMobile ? 700 : 2000;

    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 18;
      positions[i3 + 1] = (Math.random() - 0.5) * 12;
      positions[i3 + 2] = (Math.random() - 0.5) * 6 - 1;

      velocities[i3]     = (Math.random() - 0.5) * 0.0022;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.0022 + 0.0008;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;

      sizes[i] = 0.015 + Math.random() * 0.06;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(0x7FD4D8) },
        uColor2: { value: new THREE.Color(0x2E9BA1) },
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.3 + position.y * 0.4) * 0.1;
          p.y += cos(uTime * 0.25 + position.x * 0.3) * 0.08;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = size * (320.0 / -mv.z);
          vAlpha = smoothstep(0.0, 1.0, size * 10.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        uniform vec3 uColor;
        uniform vec3 uColor2;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.0, d);
          vec3 col = mix(uColor2, uColor, a);
          gl_FragColor = vec4(col, a * vAlpha * 0.85);
        }
      `,
    });

    const pts = new THREE.Points(geom, mat);
    scene.add(pts);

    let lastTime = performance.now();
    let running = true;

    const tick = (now) => {
      if (!running) return;
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      mat.uniforms.uTime.value += delta;

      const posAttr = geom.getAttribute("position");
      const posArr = posAttr.array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        posArr[i3]     += velocities[i3];
        posArr[i3 + 1] += velocities[i3 + 1];
        posArr[i3 + 2] += velocities[i3 + 2];

        if (posArr[i3 + 1] > 7) {
          posArr[i3 + 1] = -7;
          posArr[i3]     = (Math.random() - 0.5) * 18;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dprAware();
    };
    window.addEventListener("resize", resize);
    resize();

    requestAnimationFrame(tick);

    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) { lastTime = performance.now(); requestAnimationFrame(tick); }
    });
  }

  const boot = () => {
    initPhases();
    initMagnetic();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    document.addEventListener("app:ready", boot, { once: true });
    setTimeout(boot, 340);
  }
})();
