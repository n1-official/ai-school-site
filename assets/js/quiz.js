/* =========================================================
   quiz.js — AI Adaptability Diagnosis Quiz
   12 questions -> 4-axis scoring -> 1 of 8 types
   ========================================================= */
(function () {
  "use strict";

  /* ---- Axis definitions ----
     ax1: +1 Creative    / -1 Efficiency
     ax2: +1 Solo        / -1 Collaborative
     ax3: +1 Generalist  / -1 Specialist
     ax4: +1 Short-term  / -1 Long-term
  ---------------------------- */

  // Each option contributes deltas on the 4 axes (any subset).
  const QUESTIONS = [
    {
      title: "AIを使っていて、一番ワクワクする瞬間はどれですか？",
      options: [
        { text: "ゼロから新しいものが生まれた瞬間", d: { ax1:  1 } },
        { text: "退屈な作業が一瞬で終わった瞬間",   d: { ax1: -1 } },
        { text: "誰かに「すごい」と褒められた瞬間", d: { ax2: -0.7 } },
        { text: "その作業が売上に直結した瞬間",     d: { ax4:  0.8, ax1: -0.3 } },
      ],
    },
    {
      title: "休日の過ごし方として、気分が上がるのはどれですか？",
      options: [
        { text: "何かを作る・書く・描く",       d: { ax1:  1, ax2: 0.4 } },
        { text: "家や仕事を整理・仕組み化する", d: { ax1: -1, ax3: -0.3 } },
        { text: "誰かと会って話す",             d: { ax2: -1 } },
        { text: "気になるテーマを一日中調べる", d: { ax3: -0.8, ax2: 0.5 } },
      ],
    },
    {
      title: "仕事のスタイルとして、一番自分に合うのはどれですか？",
      options: [
        { text: "一人で黙々と深く集中したい",         d: { ax2:  1 } },
        { text: "チームで議論しながら進めたい",       d: { ax2: -1 } },
        { text: "相手に合わせて柔軟に形を変えたい",   d: { ax2: -0.6, ax3: 0.4 } },
        { text: "一人でも仲間とでも状況次第でOK",     d: { ax3:  0.3 } },
      ],
    },
    {
      title: "新しいスキルを学ぶとき、最初に選ぶ方法はどれですか？",
      options: [
        { text: "本や動画で一人でじっくり学ぶ",       d: { ax2:  0.8, ax3: -0.4 } },
        { text: "詳しい人に直接教えてもらう",         d: { ax2: -0.7 } },
        { text: "コミュニティや勉強会に参加する",     d: { ax2: -1,   ax3: 0.3 } },
        { text: "とにかく手を動かしながら学ぶ",       d: { ax4:  0.6 } },
      ],
    },
    {
      title: "興味の持ち方として、自分に近いのはどちらですか？",
      options: [
        { text: "広く浅く、いろんなものに手を出す",   d: { ax3:  1, ax4: 0.5 } },
        { text: "一つのことを、時間をかけて深く掘る", d: { ax3: -1, ax4: -0.5 } },
        { text: "流行に敏感で、新しいものに飛びつく", d: { ax3:  0.8, ax4: 1 } },
        { text: "やり始めたら極めずにいられない",     d: { ax3: -1, ax2: 0.4 } },
      ],
    },
    {
      title: "お金を稼ぐなら、どちらが燃えますか？",
      options: [
        { text: "今月すぐに10万円",                   d: { ax4:  1 } },
        { text: "3年後に月100万円の仕組みを作る",     d: { ax4: -1 } },
        { text: "両方大事。まずは短期で結果を作る",   d: { ax4:  0.6 } },
        { text: "両方大事。長期の設計から組み立てる", d: { ax4: -0.7, ax1: -0.3 } },
      ],
    },
    {
      title: "新しいことを始めるときの自分の性格に近いのは？",
      options: [
        { text: "結果が欲しくてすぐ動き出す",       d: { ax4:  0.9 } },
        { text: "準備を整えてから慎重に動く",       d: { ax4: -0.8, ax3: -0.3 } },
        { text: "走りながら考える",                 d: { ax4:  0.7, ax3: 0.5 } },
        { text: "長期ビジョンから逆算して動く",     d: { ax4: -1 } },
      ],
    },
    {
      title: "AIに任せたい仕事として、一番しっくり来るのは？",
      options: [
        { text: "文章の執筆や編集",             d: { ax1:  0.7, ax3: -0.7 } },
        { text: "SNS投稿・画像・動画作成",      d: { ax1:  0.9, ax3:  0.6, ax4: 0.5 } },
        { text: "リサーチ・情報整理・分析",     d: { ax1: -0.6, ax3: -0.5, ax2: 0.3 } },
        { text: "業務の自動化・スクリプト",     d: { ax1: -1,   ax3:  0.4 } },
      ],
    },
    {
      title: "10年後、どんな姿で働いていたいですか？",
      options: [
        { text: "一人で作品を生み続けている",         d: { ax2:  0.9, ax3: -0.7 } },
        { text: "チームと事業を運営している",         d: { ax2: -1,   ax4: -0.6 } },
        { text: "SNSなどで影響力を持っている",        d: { ax2: -0.6, ax4:  0.7, ax3: 0.5 } },
        { text: "自分のAIサービスや製品を持っている", d: { ax1: -0.5, ax2: -0.5, ax4: -0.8 } },
      ],
    },
    {
      title: "誰かにAIの使い方を教える機会があったら？",
      options: [
        { text: "教えるのが楽しい、誰かの役に立つ喜びを感じる", d: { ax1:  0.5, ax2: -1 } },
        { text: "教えるより、自分で手を動かしたい",             d: { ax1:  0.6, ax2:  1 } },
        { text: "教えながら自分も学びたい",                     d: { ax2: -0.6, ax3:  0.5 } },
        { text: "興味はあるが、進んで引き受けはしない",         d: { ax2:  0.3 } },
      ],
    },
    {
      title: "好きなデザインの傾向として、近いものは？",
      options: [
        { text: "シンプルで上品、長く残るもの",       d: { ax4: -1, ax1: -0.3 } },
        { text: "ポップで派手、一瞬で惹きつけるもの", d: { ax4:  1, ax1:  0.7 } },
        { text: "機能美、無駄がないもの",             d: { ax1: -0.8, ax3: -0.5 } },
        { text: "独自性があり、誰もやっていないもの", d: { ax1:  0.9, ax2:  0.5 } },
      ],
    },
    {
      title: "最後の質問。あなたの「勝ち筋」として、納得感があるのは？",
      options: [
        { text: "一つの分野を極めて、代わりがきかない人になる", d: { ax3: -1, ax2:  0.5 } },
        { text: "多くの人を巻き込み、ムーブメントを作る",       d: { ax2: -1, ax3:  0.5, ax4: 0.3 } },
        { text: "誰も見ていない数字や構造を見抜き戦略で勝つ",   d: { ax1: -0.7, ax3: -0.5 } },
        { text: "自分の手で作品やプロダクトを残す",             d: { ax1:  0.6, ax2:  0.4, ax4: -0.4 } },
      ],
    },
  ];

  /* ---- 8 types: target coordinates in 4D space + slug ---- */
  const TYPES = [
    { slug: "writer",      name: "ライティング職人",         v: [  1,  1, -1, -1 ] },
    { slug: "sns",         name: "SNS運用プロデューサー",    v: [  1, -1,  1,  1 ] },
    { slug: "strategist",  name: "AIビジネス戦略家",         v: [ -1, -1, -1, -1 ] },
    { slug: "creator",     name: "AIクリエイター",           v: [  1,  1,  1,  1 ] },
    { slug: "efficiency",  name: "効率化マニア",             v: [ -1,  1,  1,  1 ] },
    { slug: "researcher",  name: "リサーチャー",             v: [ -1,  1, -1, -1 ] },
    { slug: "evangelist",  name: "AI伝道師",                 v: [  1, -1, -1, -1 ] },
    { slug: "builder",     name: "プロダクトビルダー",       v: [ -1, -1,  1, -1 ] },
  ];

  /* ---- State ---- */
  let idx = 0;
  const answers = new Array(QUESTIONS.length).fill(-1);
  const axes = { ax1: 0, ax2: 0, ax3: 0, ax4: 0 };
  let keyboardLock = false;

  /* ---- DOM refs ---- */
  const eyebrow = document.querySelector("[data-qeyebrow]");
  const titleEl = document.querySelector("[data-qtitle]");
  const optionsEl = document.querySelector("[data-qoptions]");
  const question = document.querySelector("[data-quiz-question]");
  const prev = document.querySelector("[data-qprev]");
  const qCurrent = document.querySelector("[data-qcurrent]");
  const qTotal = document.querySelector("[data-qtotal]");
  const bar = document.querySelector("[data-qbar]");
  const resultOverlay = document.querySelector("[data-quiz-result]");
  const resultNote = document.querySelector("[data-qresult-note]");

  /* ---- Rendering ---- */
  const pad2 = (n) => String(n).padStart(2, "0");

  const render = () => {
    const q = QUESTIONS[idx];
    eyebrow.textContent = `Question ${pad2(idx + 1)}`;
    titleEl.textContent = q.title.replace(/"([^"]+)"/g, '「$1」');
    optionsEl.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz__option";
      btn.dataset.index = String(i);
      btn.setAttribute("data-cursor-text", `Option ${i + 1}`);
      if (answers[idx] === i) btn.classList.add("is-selected");
      btn.innerHTML = `
        <span class="quiz__option-num">${i + 1}</span>
        <span class="quiz__option-body">${opt.text}</span>
      `;
      btn.addEventListener("click", () => pick(i));
      optionsEl.appendChild(btn);
    });
    qCurrent.textContent = pad2(idx + 1);
    qTotal.textContent = pad2(QUESTIONS.length);
    const progress = ((idx + 1) / QUESTIONS.length) * 100;
    bar.style.width = `${progress}%`;
    prev.disabled = idx === 0;
  };

  /* ---- Transitions between questions ---- */
  const transitionTo = (newIdx) => {
    if (newIdx < 0 || newIdx > QUESTIONS.length) return;
    keyboardLock = true;
    question.classList.remove("is-in");
    question.classList.add("is-out");
    setTimeout(() => {
      idx = newIdx;
      if (idx >= QUESTIONS.length) {
        complete();
        return;
      }
      render();
      requestAnimationFrame(() => {
        question.classList.remove("is-out");
        question.classList.add("is-in");
        keyboardLock = false;
      });
    }, 340);
  };

  /* ---- Pick an option ---- */
  const pick = (optIdx) => {
    if (keyboardLock) return;
    // Subtract previous contribution if any
    if (answers[idx] !== -1) {
      const prevOpt = QUESTIONS[idx].options[answers[idx]];
      for (const k in prevOpt.d) axes[k] -= prevOpt.d[k];
    }
    // Apply new contribution
    const opt = QUESTIONS[idx].options[optIdx];
    for (const k in opt.d) axes[k] += opt.d[k];
    answers[idx] = optIdx;

    // Highlight the choice briefly
    [...optionsEl.children].forEach((el, i) => {
      el.classList.toggle("is-selected", i === optIdx);
    });

    // Auto-advance after brief moment
    setTimeout(() => {
      transitionTo(idx + 1);
    }, 360);
  };

  /* ---- Complete: compute type, save, redirect ---- */
  const complete = () => {
    // Normalize — each axis is roughly in [-N, +N], bring to unit
    const maxAbs = Math.max(
      Math.abs(axes.ax1), Math.abs(axes.ax2), Math.abs(axes.ax3), Math.abs(axes.ax4), 1
    );
    const user = [
      axes.ax1 / maxAbs,
      axes.ax2 / maxAbs,
      axes.ax3 / maxAbs,
      axes.ax4 / maxAbs,
    ];

    // Find closest type by Euclidean distance
    let best = TYPES[0], bestDist = Infinity;
    for (const t of TYPES) {
      let dist = 0;
      for (let i = 0; i < 4; i++) {
        const d = t.v[i] - user[i];
        dist += d * d;
      }
      if (dist < bestDist) { bestDist = dist; best = t; }
    }

    // Save and redirect
    try {
      localStorage.setItem("n1ai.diagnosis", JSON.stringify({
        type: best.slug,
        name: best.name,
        axes: axes,
        timestamp: Date.now(),
      }));
    } catch (e) { /* ignore */ }

    // Show completion overlay
    resultOverlay.hidden = false;
    requestAnimationFrame(() => {
      resultOverlay.classList.add("is-visible");
      if (resultNote) resultNote.textContent = `あなたは ${best.name} タイプです`;
    });

    setTimeout(() => {
      window.location.href = `../result/${best.slug}.html`;
    }, 2400);
  };

  /* ---- Keyboard ---- */
  window.addEventListener("keydown", (e) => {
    if (keyboardLock) return;
    const key = e.key;
    if (key === "1" || key === "2" || key === "3" || key === "4") {
      const i = parseInt(key, 10) - 1;
      pick(i);
    } else if (key === "ArrowLeft" || key === "Backspace") {
      if (idx > 0) transitionTo(idx - 1);
    }
  });

  prev.addEventListener("click", () => { if (idx > 0) transitionTo(idx - 1); });

  /* ---- Ambient particle background (lightweight 2D canvas) ---- */
  const initAmbient = () => {
    const canvas = document.querySelector("[data-quiz-canvas]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w, h, particles;

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = () => {
      const count = Math.min(120, Math.floor((w * h) / 24000));
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12 + 0.04,
        r: 0.6 + Math.random() * 1.8,
        a: 0.05 + Math.random() * 0.18,
      }));
    };

    resize(); spawn();
    window.addEventListener("resize", () => { resize(); spawn(); });

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y > h + 4) { p.y = -4; p.x = Math.random() * w; }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        ctx.beginPath();
        ctx.fillStyle = `rgba(127,212,216,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---- Boot ---- */
  const boot = () => {
    render();
    requestAnimationFrame(() => question.classList.add("is-in"));
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) initAmbient();
  };

  // Defer scripts run after DOM, but use a small delay to ensure libs are ready
  const start = () => { try { boot(); } catch (e) { console.error("quiz boot error:", e); } };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    setTimeout(start, 0);
  }
})();
