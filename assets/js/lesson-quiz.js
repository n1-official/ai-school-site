/* =========================================================
   lesson-quiz.js — 入門編 理解度チェッククイズ
   - 5セクション × 各3問 × 4択
   - 全問回答後に一括採点
   - 満点（3/3）で次セクションのロック解除
   - 進捗は localStorage に保存
   ========================================================= */
(function () {
  "use strict";

  /* ---- Quiz data: 5 sections × 3 questions each ---- */
  const QUIZ_DATA = {
    "section-1": {
      title: "AI地図",
      nextSection: "section-2",
      questions: [
        {
          q: "「生成AI」という言葉が一気に広まるきっかけとなったサービスはどれですか？",
          options: ["Google検索", "Apple Siri", "ChatGPT", "Amazon Echo"],
          correct: 2,
          explanation: "2022年11月にOpenAIが公開したChatGPTが、1週間で100万ユーザーを突破し生成AIブームを牽引しました。",
        },
        {
          q: "今のAIが「得意」なタスクとして正しいのはどれですか？",
          options: [
            "身体を動かす肉体労働",
            "テキスト生成・要約・翻訳",
            "自律的な長期意思決定",
            "新たな物理法則の発見",
          ],
          correct: 1,
          explanation: "現在のAIはテキスト・画像・コードなどの生成や要約・翻訳に特に優れています。身体動作や完全自律の意思決定はまだ限定的です。",
        },
        {
          q: "AIが扱える「情報の種類」として、現時点で対応していないものはどれですか？",
          options: [
            "テキスト（文章）",
            "画像・動画",
            "触覚・嗅覚リアルタイムセンシング",
            "音声・コード",
          ],
          correct: 2,
          explanation: "テキスト・画像・動画・音声・コードはすでに対応済みです。触覚や嗅覚のリアルタイムセンシングはまだ実用レベルに達していません。",
        },
      ],
    },

    "section-2": {
      title: "ツール使い分け",
      nextSection: "section-3",
      questions: [
        {
          q: "「リアルタイムのウェブ検索」を組み合わせた回答が得意なAIはどれですか？",
          options: ["Claude", "ChatGPT（GPT-4）", "Perplexity", "Midjourney"],
          correct: 2,
          explanation: "Perplexityはウェブ検索に特化したAIで、最新情報を引用付きで回答します。ChatGPTやClaudeも検索機能を持ちますが、Perplexityは検索特化として設計されています。",
        },
        {
          q: "AIツールの「無料版」と「有料版（月額課金）」の主な違いはどれですか？",
          options: [
            "有料版は広告が多く表示される",
            "無料版のほうが高性能モデルが使える",
            "有料版は高性能モデルへのアクセスや生成速度が優れている",
            "無料版と有料版に実質的な差はない",
          ],
          correct: 2,
          explanation: "有料版（例：ChatGPT Plus、Claude Pro）では最新・最高性能のモデルが使え、生成速度や1日あたりの利用上限も大きく向上します。",
        },
        {
          q: "「テキストから画像を生成する」用途に特化したAIツールの組み合わせはどれですか？",
          options: [
            "ChatGPT + Claude",
            "Gemini + Copilot",
            "Midjourney + Stable Diffusion",
            "Perplexity + Grok",
          ],
          correct: 2,
          explanation: "Midjourney・Stable Diffusion・DALL·Eなどが代表的な画像生成AIです。ChatGPT・Claude・Geminiはテキスト主体の汎用AIで用途が異なります。",
        },
      ],
    },

    "section-3": {
      title: "プロンプトの型",
      nextSection: "section-4",
      questions: [
        {
          q: "「良いプロンプト」を書く上で、最も重要な要素はどれですか？",
          options: [
            "英語で書くこと",
            "文章が長いほどよい",
            "目的・条件・背景を具体的に伝えること",
            "丁寧な敬語を使うこと",
          ],
          correct: 2,
          explanation: "AIは曖昧な指示に弱く、「誰のために」「何のために」「どんな形式で」を明確に伝えるほど精度が上がります。言語や丁寧さはあまり影響しません。",
        },
        {
          q: "「役割設定（ロールプレイ）」型プロンプトとして正しい例はどれですか？",
          options: [
            "「日本語で回答してください」",
            "「あなたはマーケティング専門家として、この商品の売り文句を考えてください」",
            "「3つ箇条書きで教えてください」",
            "「もっと短くしてください」",
          ],
          correct: 1,
          explanation: "AIに「専門家」「編集者」「先生」などの役割を与えることで、その視点・文体・知識レベルで回答させることができます。",
        },
        {
          q: "「例示（Few-shot）」プロンプトとはどんな手法ですか？",
          options: [
            "AIに質問をできるだけ少なくする手法",
            "期待する出力の例をいくつか見せてから本題を指示する手法",
            "AIに少ない文字数で答えさせる手法",
            "AIに複数の選択肢から選ばせる手法",
          ],
          correct: 1,
          explanation: "「こういう入力にはこういう出力をする」という例（ショット）を示すことで、AIが期待するパターンを学習し精度が上がります。",
        },
      ],
    },

    "section-4": {
      title: "日常と仕事",
      nextSection: "section-5",
      questions: [
        {
          q: "ビジネスシーンで現在最も広く使われているAI活用はどれですか？",
          options: [
            "AIが会議を完全自動で司会する",
            "メール・文章の作成・要約・翻訳",
            "AIが最終契約書に署名する",
            "AIが顧客への電話対応を全て担当する",
          ],
          correct: 1,
          explanation: "メール文章の草稿作成、議事録の要約、多言語翻訳が実務で最も浸透しています。意思決定や法的行為はまだ人間が担います。",
        },
        {
          q: "AIを「副業・フリーランス」に活かす際、特に相性のよい分野はどれですか？",
          options: [
            "引っ越し・肉体労働",
            "ライティング・画像制作・SNS運用代行",
            "建築施工・工事現場",
            "対面での接客サービス",
          ],
          correct: 1,
          explanation: "ライティング・デザイン・SNS管理はAIで生産性を大幅に高められます。特に文章生成・画像生成と相性がよく、少ない工数で多くの案件をこなせます。",
        },
        {
          q: "「日常生活」でAIを活用する具体例として、現在多くの人が実践しているものはどれですか？",
          options: [
            "AIが自動的に全ての買い物を決定する",
            "レシピ提案・旅行計画立案・資格勉強のサポート",
            "AIロボットが自宅の掃除を全自動で行う",
            "AIが自動で友人にメッセージを送り続ける",
          ],
          correct: 1,
          explanation: "「今日の材料でレシピを提案して」「旅行プランを作って」「この問題を解説して」といった日常タスクへの活用が急増しています。",
        },
      ],
    },

    "section-5": {
      title: "AIの未来",
      nextSection: null, // 最後のセクション
      questions: [
        {
          q: "「AIエージェント」とはどのような技術ですか？",
          options: [
            "AIが人間の外見や声を完全に再現する技術",
            "AIが目標を与えられると自律的にタスクを実行し続ける技術",
            "AIが別のAIに命令を出す管理システム",
            "AIが感情的な判断を下す技術",
          ],
          correct: 1,
          explanation: "AIエージェントとは「メールを確認してスケジュールを調整して」など、複数ステップのタスクをAIが自律的に実行する仕組みです。2025年以降急速に実用化が進んでいます。",
        },
        {
          q: "「使う側」と「使われる側」の分岐点として最も本質的なのはどれですか？",
          options: [
            "プログラミングが書けるかどうか",
            "AIのニュースを毎日チェックしているかどうか",
            "AIを日常・仕事に積極的に取り入れ、活用し続けているかどうか",
            "最高スペックのパソコンを持っているかどうか",
          ],
          correct: 2,
          explanation: "プログラミングや最新知識よりも「実際に使い続けているか」が最大の差です。AIは使えば使うほど習熟度が上がり、応用の幅が広がります。",
        },
        {
          q: "AIが急速に進化する時代に最も重要な姿勢はどれですか？",
          options: [
            "特定のAIツール1つを完全にマスターする",
            "AIが安定するまで様子を見て使い始める",
            "AIに全てを任せ、自分では考えない",
            "変化を受け入れながら、継続的に学び使い続ける",
          ],
          correct: 3,
          explanation: "AIの進化に「完成」はありません。1つのツールへの固執や様子見は機会損失につながります。広く触れながら、学び続けることが「使う側」に留まる唯一の方法です。",
        },
      ],
    },
  };

  /* ---- localStorage key ---- */
  const LS_KEY = "n1ai.lesson.unlocked";

  /* ---- Helpers ---- */
  const getUnlocked = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      // Section 1 is always unlocked
      if (!arr.includes("section-1")) arr.unshift("section-1");
      return arr;
    } catch {
      return ["section-1"];
    }
  };

  const saveUnlocked = (arr) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch { /* ignore */ }
  };

  const markUnlocked = (sectionId) => {
    const arr = getUnlocked();
    if (!arr.includes(sectionId)) {
      arr.push(sectionId);
      saveUnlocked(arr);
    }
  };

  /* ---- Build quiz DOM for one section ---- */
  const buildQuiz = (sectionId, container) => {
    const data = QUIZ_DATA[sectionId];
    if (!data) return;

    const questionsWrap = container.querySelector("[data-questions]");
    if (!questionsWrap) return;

    questionsWrap.innerHTML = "";

    data.questions.forEach((q, qIdx) => {
      const labels = ["A", "B", "C", "D"];

      const questionEl = document.createElement("div");
      questionEl.className = "lesson-quiz__question";
      questionEl.dataset.questionIdx = String(qIdx);

      questionEl.innerHTML = `
        <div class="lesson-quiz__question-meta">
          <span class="lesson-quiz__q-num">${qIdx + 1}</span>
          <p class="lesson-quiz__q-text">${q.q}</p>
        </div>
        <div class="lesson-quiz__options" data-options="${qIdx}">
          ${q.options
            .map(
              (opt, i) => `
            <button type="button"
              class="lesson-quiz__option"
              data-q="${qIdx}"
              data-opt="${i}"
              data-cursor-text="${labels[i]}">
              <span class="lesson-quiz__opt-label">${labels[i]}</span>
              <span class="lesson-quiz__opt-text">${opt}</span>
            </button>`
            )
            .join("")}
        </div>
      `;

      questionsWrap.appendChild(questionEl);
    });
  };

  /* ---- Handle option click ---- */
  const handleOptionClick = (sectionId, container, btn) => {
    const qIdx = parseInt(btn.dataset.q, 10);
    const optIdx = parseInt(btn.dataset.opt, 10);

    // Deselect siblings
    const siblings = container.querySelectorAll(`[data-q="${qIdx}"]`);
    siblings.forEach((s) => s.classList.remove("is-selected"));

    // Select clicked
    btn.classList.add("is-selected");

    // Store answer
    container._answers = container._answers || {};
    container._answers[qIdx] = optIdx;

    // Update answered count & enable submit if all answered
    updateSubmitState(sectionId, container);
  };

  /* ---- Update answered count + submit button state ---- */
  const updateSubmitState = (sectionId, container) => {
    const data = QUIZ_DATA[sectionId];
    const totalQ = data.questions.length;
    const answered = Object.keys(container._answers || {}).length;

    const countEl = container.querySelector(".lesson-quiz__answered-count");
    if (countEl) countEl.textContent = `${answered} / ${totalQ} 回答済み`;

    const submitBtn = container.querySelector("[data-submit]");
    if (submitBtn) submitBtn.disabled = answered < totalQ;
  };

  /* ---- Score and show result ---- */
  const handleSubmit = (sectionId, container) => {
    const data = QUIZ_DATA[sectionId];
    const answers = container._answers || {};

    let correct = 0;
    data.questions.forEach((q, qIdx) => {
      const chosen = answers[qIdx];
      const isCorrect = chosen === q.correct;
      if (isCorrect) correct++;

      // Mark options
      const allOpts = container.querySelectorAll(`[data-q="${qIdx}"]`);
      allOpts.forEach((opt) => {
        opt.disabled = true;
        opt.classList.remove("is-selected");
        const optIdx = parseInt(opt.dataset.opt, 10);
        if (optIdx === q.correct) opt.classList.add("is-correct");
        else if (optIdx === chosen) opt.classList.add("is-wrong");
      });
    });

    // Disable submit
    const submitBtn = container.querySelector("[data-submit]");
    if (submitBtn) submitBtn.disabled = true;

    // Save score
    saveScore(sectionId, correct, data.questions.length);

    // Build and show result panel
    showResult(sectionId, container, correct, data.questions.length, data, answers);
  };

  /* ---- Build and animate result panel ---- */
  const showResult = (sectionId, container, correct, total, data, answers) => {
    const result = container.querySelector("[data-result]");
    if (!result) return;

    const isPerfect = correct === total;
    const labels = ["A", "B", "C", "D"];

    // Score
    result.innerHTML = `
      <div class="lesson-quiz__score-wrap">
        <span class="lesson-quiz__score-label">Score</span>
        <div class="lesson-quiz__score-value ${isPerfect ? "is-perfect" : ""}">
          ${correct}<span class="lesson-quiz__score-denom"> / ${total}</span>
        </div>
      </div>

      <p class="lesson-quiz__result-msg">
        ${isPerfect
          ? `完璧です。次のセクションに進みましょう。`
          : `あと${total - correct}問。解説を確認してもう一度挑戦してください。`}
      </p>

      <div class="lesson-quiz__breakdown">
        ${data.questions
          .map((q, i) => {
            const isC = answers[i] === q.correct;
            return `
          <div class="lesson-quiz__breakdown-item">
            <span class="lesson-quiz__breakdown-q">Q${i + 1}</span>
            <span class="lesson-quiz__breakdown-icon lesson-quiz__breakdown-icon--${isC ? "correct" : "wrong"}">
              ${isC
                ? `<svg viewBox="0 0 16 16" width="16" height="16"><polyline points="3,8 7,12 13,4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                : `<svg viewBox="0 0 16 16" width="16" height="16"><line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`}
            </span>
          </div>`;
          })
          .join("")}
      </div>

      <div class="lesson-quiz__explanations">
        ${data.questions
          .map((q, i) => {
            const isC = answers[i] === q.correct;
            return `
          <div class="lesson-quiz__explanation ${isC ? "is-correct" : "is-wrong"}">
            <strong>${isC ? "正解" : `正解: ${labels[q.correct]}`}</strong>
            ${q.explanation}
          </div>`;
          })
          .join("")}
      </div>

      <div class="lesson-quiz__actions">
        ${isPerfect && data.nextSection
          ? `<button type="button" class="lesson-quiz__next-btn" data-next="${data.nextSection}">
               <span>次のセクションへ</span>
               <svg viewBox="0 0 24 24" width="14" height="14">
                 <path d="M4 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/>
               </svg>
             </button>`
          : ""}
        ${isPerfect && !data.nextSection
          ? `<div style="display:flex;flex-direction:column;align-items:center;gap:12px">
               <p style="font-size:14px;color:var(--ink-sub);font-weight:600">全セクション完了。</p>
             </div>`
          : ""}
        <button type="button" class="lesson-quiz__retry-btn" data-retry="${sectionId}">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M13 7A6 6 0 1 1 7 2.04V1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <polyline points="7,1 10,1 10,4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          もう一度挑戦
        </button>
      </div>
    `;

    result.hidden = false;

    // If perfect, save unlock + update tracker
    if (isPerfect && data.nextSection) {
      markUnlocked(data.nextSection);
    }
    updateProgressTracker();

    // Small delay then animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => result.classList.add("is-visible"));
    });
  };

  /* ---- Reset quiz ---- */
  const resetQuiz = (sectionId, container) => {
    container._answers = {};

    // Hide result
    const result = container.querySelector("[data-result]");
    if (result) {
      result.classList.remove("is-visible");
      setTimeout(() => {
        result.hidden = true;
        result.innerHTML = "";
      }, 400);
    }

    // Re-enable all options and clear states
    container.querySelectorAll(".lesson-quiz__option").forEach((opt) => {
      opt.disabled = false;
      opt.classList.remove("is-selected", "is-correct", "is-wrong");
    });

    // Reset submit
    const submitBtn = container.querySelector("[data-submit]");
    if (submitBtn) submitBtn.disabled = true;

    updateSubmitState(sectionId, container);
  };

  /* ---- Unlock next section ---- */
  const unlockSection = (sectionId) => {
    const section = document.querySelector(`[data-section="${sectionId}"]`);
    if (!section) return;

    section.setAttribute("data-locked", "false");

    const lock = section.querySelector("[data-lock]");
    if (lock) {
      lock.classList.add("is-unlocking");
      setTimeout(() => lock.remove(), 700);
    }

    section.classList.add("just-unlocked");
    setTimeout(() => section.classList.remove("just-unlocked"), 1600);

    // Show badge
    const badge = section.querySelector(".lesson-section-badge");
    if (badge) {
      setTimeout(() => badge.classList.add("is-visible"), 800);
    }

    // Smooth scroll to the unlocked section
    setTimeout(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 500);
  };

  /* ---- Apply unlock state from localStorage on load ---- */
  const applyUnlockState = () => {
    const unlocked = getUnlocked();
    document.querySelectorAll("[data-section]").forEach((section) => {
      const id = section.dataset.section;
      if (unlocked.includes(id)) {
        section.setAttribute("data-locked", "false");
        const lock = section.querySelector("[data-lock]");
        if (lock) lock.remove();
      }
    });
  };

  /* ---- Wire up one quiz container ---- */
  const initQuizContainer = (sectionId, container) => {
    buildQuiz(sectionId, container);
    container._answers = {};
    updateSubmitState(sectionId, container);

    // Delegated click handler
    container.addEventListener("click", (e) => {
      const opt = e.target.closest(".lesson-quiz__option");
      if (opt && !opt.disabled) {
        handleOptionClick(sectionId, container, opt);
        return;
      }

      const submit = e.target.closest("[data-submit]");
      if (submit && !submit.disabled) {
        handleSubmit(sectionId, container);
        return;
      }

      const retry = e.target.closest("[data-retry]");
      if (retry) {
        resetQuiz(sectionId, container);
        return;
      }

      const next = e.target.closest("[data-next]");
      if (next) {
        unlockSection(next.dataset.next);
        return;
      }
    });
  };

  /* ---- Progress tracker ---- */
  const LS_SCORES_KEY = "n1ai.lesson.scores";

  const getScores = () => {
    try { return JSON.parse(localStorage.getItem(LS_SCORES_KEY) || "{}"); } catch { return {}; }
  };

  const saveScore = (sectionId, correct, total) => {
    const scores = getScores();
    scores[sectionId] = { correct, total };
    try { localStorage.setItem(LS_SCORES_KEY, JSON.stringify(scores)); } catch { /* ignore */ }
  };

  const LOCK_ICON = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="3" y="7" width="10" height="8" rx="1"/><path d="M5 7V5a3 3 0 1 1 6 0v2"/></svg>`;
  const CHECK_ICON = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,8 6,12 14,4"/></svg>`;

  const updateProgressTracker = () => {
    const unlocked = getUnlocked();
    const scores = getScores();
    const sectionIds = Object.keys(QUIZ_DATA);

    sectionIds.forEach((id, i) => {
      const stepEl = document.querySelector(`[data-progress-step="${id}"]`);
      if (!stepEl) return;

      const isUnlocked = unlocked.includes(id);
      const score = scores[id];
      const isCompleted = score && score.correct === score.total;

      // Set state
      const state = isCompleted ? "completed" : isUnlocked ? "unlocked" : "locked";
      stepEl.dataset.stepState = state;

      // Update icon
      const iconEl = stepEl.querySelector(`[data-step-icon="${id}"]`);
      if (iconEl) {
        iconEl.innerHTML = isCompleted ? CHECK_ICON : isUnlocked ? "" : LOCK_ICON;
      }

      // Update score badge
      const scoreEl = stepEl.querySelector(`[data-step-score="${id}"]`);
      if (scoreEl) {
        scoreEl.textContent = score ? `${score.correct} / ${score.total}` : "";
      }

      // Update connector before this step
      if (i > 0) {
        const connectors = document.querySelectorAll(".lessons-progress__connector");
        const connector = connectors[i - 1];
        if (connector) {
          connector.classList.toggle("is-completed", isCompleted);
        }
      }
    });
  };

  /* ---- Init all lesson quiz containers ---- */
  const initLessonQuiz = () => {
    applyUnlockState();
    updateProgressTracker();

    document.querySelectorAll("[data-lesson-quiz]").forEach((container) => {
      const sectionId = container.dataset.lessonQuiz;
      if (QUIZ_DATA[sectionId]) {
        initQuizContainer(sectionId, container);
      }
    });
  };

  /* ---- Boot ---- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLessonQuiz);
  } else {
    setTimeout(initLessonQuiz, 0);
  }
})();
