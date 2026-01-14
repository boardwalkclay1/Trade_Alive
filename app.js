/* ============================================================
   DISCIPLINE ACADEMY – APP CORE
   Hybrid Elite style
============================================================ */

/* ------------ THEME ------------ */
function initTheme() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const stored = localStorage.getItem("theme") || "dark";
  applyTheme(stored);

  btn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("theme-dark");
    applyTheme(isDark ? "light" : "dark");
  });

  function applyTheme(mode) {
    document.body.classList.toggle("theme-dark", mode === "dark");
    document.body.classList.toggle("theme-light", mode === "light");
    localStorage.setItem("theme", mode);
  }
}

/* ------------ GLOBAL ACCESS GATE (for lesson pages) ------------ */
function enforceGlobalAccessGate() {
  const hasAccess = localStorage.getItem("academyAccess") === "true";
  if (!hasAccess) {
    // lessons/ -> go back to root paywall
    window.location.href = "../paywall.html";
  }
}

/* ------------ FREE ACCESS GATE (paywall) ------------ */
function initFreeAccessGate() {
  const form = document.getElementById("free-access-form");
  const msg = document.getElementById("free-access-message");
  if (!form) return;

  const allowed = "boardwalkclay1@gmail.com" "klevy0823@gmail.com"; // override email

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = (data.get("freeEmail") || "").toString().trim().toLowerCase();

    if (!email) {
      msg.textContent = "Please enter an email.";
      msg.className = "feedback-text error-text";
      return;
    }

    if (email === allowed) {
      localStorage.setItem("academyAccess", "true");
      localStorage.setItem("academyEmail", email);

      msg.textContent = "Access granted. Redirecting...";
      msg.className = "feedback-text success-text";

      setTimeout(() => {
        // from paywall at root -> lessons/lessons.html
        window.location.href = "lessons/lessons.html";
      }, 700);
    } else {
      msg.textContent = "This email is not authorized.";
      msg.className = "feedback-text error-text";
    }
  });
}

/* ------------ AUTO ENTER (paywall) ------------ */
function autoEnterIfAlreadyUnlocked() {
  if (localStorage.getItem("academyAccess") === "true") {
    window.location.href = "lessons/lessons.html";
  }
}

/* ------------ PAYPAL RETURN HANDLER ------------ */
function checkPaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("access") === "granted") {
    localStorage.setItem("academyAccess", "true");
    window.location.replace("lessons/lessons.html");
  }
}

/* ------------ LESSONS SHELL ------------ */
function initLessonsShell() {
  setupSidebarNav();
  setupDisciplinePopup();
  setupSecureMode();
  setupLoader();
  setupUniversalQuizzes();
}

/* ------------ SIDEBAR NAV ------------ */
function setupSidebarNav() {
  const links = document.querySelectorAll(".sidebar-link");
  links.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ------------ DISCIPLINE POPUP ------------ */
function setupDisciplinePopup() {
  const popup = document.getElementById("discipline-popup");
  if (!popup) return;

  const closeBtn = document.getElementById("discipline-close");
  const button = document.getElementById("discipline-button");

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const lastShown = Number(localStorage.getItem("lastDisciplinePopup") || 0);
  const now = Date.now();

  if (!lastShown || now - lastShown > WEEK_MS) {
    popup.classList.remove("hidden");
  }

  if (button) {
    button.addEventListener("click", () => {
      popup.classList.remove("hidden");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.classList.add("hidden");
      localStorage.setItem("lastDisciplinePopup", String(Date.now()));
    });
  }
}

/* ------------ SECURE MODE / BLUR ------------ */
function setupSecureMode() {
  const area = document.querySelector(".secure-area");
  if (!area) return;

  const toggle = document.getElementById("secure-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      area.classList.toggle("secure-blur");
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      area.classList.add("secure-blur");
    } else {
      area.classList.remove("secure-blur");
    }
  });
}

/* ------------ LOADER (candles) ------------ */
function setupLoader() {
  const loader = document.getElementById("loader-overlay");
  if (!loader) return;

  // Slight delay to let the candles breathe
  setTimeout(() => {
    loader.classList.add("loader-hidden");
  }, 900);
}

/* ------------ UNIVERSAL QUIZ / SIM HANDLER ------------ */
function setupUniversalQuizzes() {
  const forms = document.querySelectorAll("form[id*='quiz'], form[id*='sim']");
  if (!forms.length) return;

  const correctAnswers = {
    // example for Stage 75
    "lesson75-quiz": { q1: "a", q2: "a", q3: "a" },
    "lesson75-sim": { sim1: "a", sim2: "a" },
    // add more as you build quizzes
  };

  forms.forEach((form) => {
    const id = form.id;
    const messageBox = document.getElementById(id + "-message");
    if (!messageBox) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const answerKey = correctAnswers[id];

      if (!answerKey) {
        messageBox.textContent = "This quiz hasn’t been configured yet.";
        messageBox.className = "feedback-text error-text";
        return;
      }

      let allCorrect = true;

      Object.keys(answerKey).forEach((field) => {
        const value = form.elements[field]?.value;
        if (value !== answerKey[field]) {
          allCorrect = false;
        }
      });

      if (allCorrect) {
        messageBox.textContent = "Correct. Stage completed.";
        messageBox.className = "feedback-text success-text";
      } else {
        messageBox.textContent = "Some answers are incorrect. Review and try again.";
        messageBox.className = "feedback-text error-text";
      }
    });
  });
}
/* ============================================================
   DISCIPLINE ACADEMY — UNIVERSAL AUTO-FIX ENGINE
   This script automatically upgrades ALL pages to the new style.
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  autoFixStylesheet();
  autoFixBodyClass();
  autoFixTopBar();
  autoFixMainWrapper();
  autoFixGlassCards();
  autoFixLessonChips();
  autoFixSidebarButtons();
  autoFixLoader();
});

/* ------------------------------------------------------------
   1. Ensure correct stylesheet path
------------------------------------------------------------ */
function autoFixStylesheet() {
  const links = document.querySelectorAll("link[rel='stylesheet']");
  const correctRoot = "styles.css";
  const correctLessons = "../styles.css";

  if (!links.length) {
    const link = document.createElement("link");
    link.rel = "stylesheet";

    if (location.pathname.includes("/lessons/")) {
      link.href = correctLessons;
    } else {
      link.href = correctRoot;
    }

    document.head.appendChild(link);
  }
}

/* ------------------------------------------------------------
   2. Ensure body has theme-dark
------------------------------------------------------------ */
function autoFixBodyClass() {
  if (!document.body.classList.contains("theme-dark")) {
    document.body.classList.add("theme-dark");
  }
}

/* ------------------------------------------------------------
   3. Ensure top bar exists and is styled
------------------------------------------------------------ */
function autoFixTopBar() {
  const header = document.querySelector("header");

  if (!header) return;

  header.classList.add("top-bar", "glass-bar");

  const title = header.querySelector("h1");
  if (title) title.classList.add("app-title", "glow-text");

  const buttons = header.querySelectorAll("button");
  buttons.forEach((btn) => btn.classList.add("icon-button"));
}

/* ------------------------------------------------------------
   4. Ensure main wrapper exists
------------------------------------------------------------ */
function autoFixMainWrapper() {
  const main = document.querySelector("main");
  if (!main) return;

  main.classList.add("main-content", "secure-area");
}

/* ------------------------------------------------------------
   5. Wrap orphan content in glass cards
------------------------------------------------------------ */
function autoFixGlassCards() {
  const sections = document.querySelectorAll("section");

  sections.forEach((sec) => {
    if (!sec.classList.contains("glass-card")) {
      sec.classList.add("glass-card");
    }
  });
}

/* ------------------------------------------------------------
   6. Upgrade lesson chips automatically
------------------------------------------------------------ */
function autoFixLessonChips() {
  const links = document.querySelectorAll("a, button");

  links.forEach((el) => {
    const text = el.textContent.trim();

    if (text.startsWith("Stage")) {
      el.classList.add("lesson-chip");

      // Extract lesson number
      const num = Number(text.replace("Stage", "").trim());
      if (!isNaN(num)) {
        el.setAttribute("data-lesson", num);
      }
    }
  });
}

/* ------------------------------------------------------------
   7. Upgrade sidebar buttons
------------------------------------------------------------ */
function autoFixSidebarButtons() {
  const sidebarButtons = document.querySelectorAll(".sidebar-link");

  sidebarButtons.forEach((btn) => {
    btn.classList.add("lesson-chip");
  });
}

/* ------------------------------------------------------------
   8. Add loader if missing
------------------------------------------------------------ */
function autoFixLoader() {
  if (document.getElementById("loader-overlay")) return;

  const loader = document.createElement("div");
  loader.id = "loader-overlay";
  loader.className = "loader-overlay";

  loader.innerHTML = `
    <div class="loader-candles">
      <div class="loader-candle"></div>
      <div class="loader-candle"></div>
      <div class="loader-candle"></div>
      <div class="loader-candle"></div>
      <div class="loader-candle"></div>
    </div>
    <div class="glow-text">Loading…</div>
  `;

  document.body.prepend(loader);

  setTimeout(() => {
    loader.classList.add("loader-hidden");
  }, 900);
}
/* ========================================================================
   UNIVERSAL QUIZ + PROGRESSION + DISCIPLINE SYSTEM
   - Quizzes (all lessons)
   - Finish lesson button
   - Lesson progression lock
   - 9 o'clock discipline streak system
   ======================================================================== */

/* -----------------------------
   QUIZ ANSWER KEY
   ----------------------------- */
/*
  Define correct answers for each quiz/sim here.

  - Key: form id (e.g., "lesson1-quiz", "lesson1-sim")
  - Value: object where keys are input names and values are correct answers.

  Example:
    "lesson1-quiz": { q1: "a", q2: "c", q3: "b" }
*/
const QUIZ_ANSWER_KEY = {
  // TODO: Fill in real answers as you build.
  // "lesson1-quiz": { q1: "a", q2: "b", q3: "c" },
  // "lesson1-sim":  { sim1: "b", sim2: "a" },

  // Example placeholder like your test:
  "lesson75-quiz": { q1: "a", q2: "a", q3: "a" },
  "lesson75-sim":  { sim1: "a", sim2: "a" }
};


/* -----------------------------
   LOCALSTORAGE HELPERS
   ----------------------------- */

function getCompletedLessons() {
  try {
    return JSON.parse(localStorage.getItem("completedLessons") || "[]");
  } catch (e) {
    return [];
  }
}

function saveCompletedLessons(list) {
  localStorage.setItem("completedLessons", JSON.stringify(list));
}

/*
  Mark a lesson completed and persist in localStorage.
  lessonNumber: number (e.g., 1, 2, 75)
*/
function markLessonComplete(lessonNumber) {
  if (!lessonNumber || isNaN(lessonNumber)) return;

  const completed = getCompletedLessons();
  if (!completed.includes(lessonNumber)) {
    completed.push(lessonNumber);
    completed.sort((a, b) => a - b);
    saveCompletedLessons(completed);
  }
}


/* -----------------------------
   UNIVERSAL QUIZ ENGINE
   ----------------------------- */

function setupUniversalQuizzes() {
  const forms = document.querySelectorAll("form[id*='quiz'], form[id*='sim']");
  if (!forms.length) return;

  forms.forEach((form) => {
    const id = form.id;
    if (!id) return;

    const messageBox = document.getElementById(id + "-message");
    const answerKey = QUIZ_ANSWER_KEY[id];

    // If there is no answer key, still prevent reload & show warning.
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!answerKey) {
        if (messageBox) {
          messageBox.textContent = "Quiz not configured for this lesson yet.";
          messageBox.className = "feedback-text error-text";
        }
        return;
      }

      let allCorrect = true;

      Object.keys(answerKey).forEach((fieldName) => {
        const field = form.elements[fieldName];
        const value = field ? field.value : null;
        if (value !== answerKey[fieldName]) {
          allCorrect = false;
        }
      });

      if (!messageBox) return;

      if (allCorrect) {
        messageBox.textContent = "Correct. Stage completed.";
        messageBox.className = "feedback-text success-text";

        // Try to infer lesson number from form id (e.g., "lesson75-quiz")
        const numMatch = id.match(/(\d+)/);
        if (numMatch) {
          const lessonNumber = Number(numMatch[1]);
          markLessonComplete(lessonNumber);
        }
      } else {
        messageBox.textContent = "Incorrect. Try again.";
        messageBox.className = "feedback-text error-text";
      }
    });
  });
}


/* -----------------------------
   FORCE QUIZ FORMS TO BE JS-ONLY
   ----------------------------- */

function autoFixQuizForms() {
  const quizForms = document.querySelectorAll("form[id*='quiz'], form[id*='sim']");

  quizForms.forEach((form) => {
    form.setAttribute("action", "javascript:void(0)");
    form.setAttribute("method", "post");

    const btns = form.querySelectorAll("button, input[type='submit']");
    btns.forEach((btn) => {
      btn.type = "button";
      btn.addEventListener("click", () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });
    });
  });
}


/* -----------------------------
   FINISH LESSON BUTTON
   ----------------------------- */

/*
  Determine the current lesson number.
  - If body has data-lesson-number, use that
  - Otherwise, try to extract from URL, e.g., ".../lesson75.html"
*/
function getCurrentLessonNumber() {
  const body = document.body;
  if (body && body.dataset && body.dataset.lessonNumber) {
    const n = Number(body.dataset.lessonNumber);
    if (!isNaN(n)) return n;
  }

  const path = window.location.pathname;
  const match = path.match(/lesson(\d+)/i);
  if (match) {
    return Number(match[1]);
  }

  return null;
}

/*
  Wire up the "Finish Lesson" button (id="finish-lesson") so:
  - It only works if the current lesson is completed in localStorage
  - It shows error if quiz not passed
  - It redirects back to lessons hub on success
*/
function setupFinishLessonButton() {
  const btn = document.getElementById("finish-lesson");
  if (!btn) return;

  const msg = document.getElementById("finish-message");
  const lessonNumber = getCurrentLessonNumber();

  btn.addEventListener("click", () => {
    if (!lessonNumber) {
      if (msg) {
        msg.textContent = "Lesson number not detected. Cannot finish this lesson.";
        msg.className = "feedback-text error-text";
      }
      return;
    }

    const completed = getCompletedLessons();
    if (!completed.includes(lessonNumber)) {
      if (msg) {
        msg.textContent = "You must pass the quiz for this lesson before finishing.";
        msg.className = "feedback-text error-text";
      }
      return;
    }

    if (msg) {
      msg.textContent = "Lesson completed. Redirecting to lessons hub…";
      msg.className = "feedback-text success-text";
    }

    // Adjust this path if your hub lives elsewhere
    setTimeout(() => {
      window.location.href = "/lessons/lessons.html";
    }, 700);
  });
}


/* -----------------------------
   LESSON PROGRESSION LOCK
   ----------------------------- */

/*
  On the lessons hub page:
  - Expect each lesson card/link to have data-lesson-number
  - Hide or disable lessons greater than (maxCompleted + 1)
*/
function setupLessonProgressionLock() {
  const lessonItems = document.querySelectorAll("[data-lesson-number]");
  if (!lessonItems.length) return;

  const completed = getCompletedLessons();
  const maxCompleted = completed.length ? Math.max(...completed) : 0;
  const allowedNext = (maxCompleted || 0) + 1;

  lessonItems.forEach((item) => {
    const n = Number(item.dataset.lessonNumber);
    if (!n || isNaN(n)) return;

    const link = item.querySelector("a") || item;

    if (n > allowedNext) {
      // Lock / hide future lessons
      link.classList.add("locked-lesson");
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", (e) => e.preventDefault());
      if (!link.querySelector(".lock-label")) {
        const span = document.createElement("span");
        span.className = "lock-label";
        span.textContent = "Locked — complete previous lesson first";
        link.appendChild(span);
      }
    } else {
      // This one is available
      link.classList.remove("locked-lesson");
      link.removeAttribute("aria-disabled");
    }
  });
}


/* -----------------------------
   9 O'CLOCK DISCIPLINE STREAK
   ----------------------------- */

/*
  Assumptions:
  - Button:        id="discipline-checkin-btn"
  - Message box:   id="discipline-message"
  - Streak display id="discipline-streak"
  - Timer display: id="discipline-timer" (optional)
*/

const DISCIPLINE_STORAGE_KEY = "disciplineStreakData";
const DISCIPLINE_TARGET_HOUR = 21; // 21 = 9 PM (24h format)
const DISCIPLINE_WINDOW_MINUTES = 60; // Window around 9 PM (e.g., 60 = 9:00–9:59)

function getDisciplineData() {
  try {
    return JSON.parse(localStorage.getItem(DISCIPLINE_STORAGE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function saveDisciplineData(data) {
  localStorage.setItem(DISCIPLINE_STORAGE_KEY, JSON.stringify(data));
}

function isWithinDisciplineWindow(now = new Date()) {
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Simple window: same hour, any minute
  // If you want tighter control, adjust this logic
  return hour === DISCIPLINE_TARGET_HOUR;
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function updateDisciplineUI() {
  const data = getDisciplineData();
  const streakEl = document.getElementById("discipline-streak");
  const msgEl = document.getElementById("discipline-message");

  const streak = data.streak || 0;

  if (streakEl) {
    streakEl.textContent = streak.toString();
  }

  if (msgEl && streak > 0) {
    msgEl.textContent = `Current streak: ${streak} day${streak === 1 ? "" : "s"}.`;
    msgEl.className = "feedback-text success-text";
  }
}

function setupDisciplineTimer() {
  const timerEl = document.getElementById("discipline-timer");
  if (!timerEl) return;

  function update() {
    const now = new Date();
    const target = new Date();

    if (now.getHours() >= DISCIPLINE_TARGET_HOUR) {
      // Next day 9 PM
      target.setDate(target.getDate() + 1);
    }
    target.setHours(DISCIPLINE_TARGET_HOUR, 0, 0, 0);

    const diffMs = target - now;
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    const h = String(Math.floor(diffSec / 3600)).padStart(2, "0");
    const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, "0");
    const s = String(diffSec % 60).padStart(2, "0");

    timerEl.textContent = `Next check-in window in ${h}:${m}:${s}`;
  }

  update();
  setInterval(update, 1000);
}

function setupDisciplineButton() {
  const btn = document.getElementById("discipline-checkin-btn");
  if (!btn) return;

  const msgEl = document.getElementById("discipline-message");
  const data = getDisciplineData();
  const now = new Date();
  const todayKey = formatDateKey(now);
  const lastDate = data.lastDate || null;
  let streak = data.streak || 0;

  // Initialize UI
  updateDisciplineUI();
  setupDisciplineTimer();

  btn.addEventListener("click", () => {
    const nowInner = new Date();
    const todayKeyInner = formatDateKey(nowInner);

    if (!isWithinDisciplineWindow(nowInner)) {
      if (msgEl) {
        msgEl.textContent = "Discipline check-in only counts at 9:00 PM.";
        msgEl.className = "feedback-text error-text";
      }
      return;
    }

    const dataInner = getDisciplineData();
    const lastDateInner = dataInner.lastDate || null;
    streak = dataInner.streak || 0;

    if (lastDateInner === todayKeyInner) {
      if (msgEl) {
        msgEl.textContent = "You already checked in today. Come back tomorrow.";
        msgEl.className = "feedback-text error-text";
      }
      return;
    }

    // Update streak: if last check-in was yesterday, continue streak; otherwise reset
    if (lastDateInner) {
      const prev = new Date(lastDateInner);
      const diffDays = Math.floor((nowInner - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak += 1;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    const newData = {
      lastDate: todayKeyInner,
      streak
    };
    saveDisciplineData(newData);

    if (msgEl) {
      msgEl.textContent = `Locked in. Streak: ${streak} day${streak === 1 ? "" : "s"}.`;
      msgEl.className = "feedback-text success-text";
    }

    // Simple reward milestones
    if (streak === 3 && msgEl) {
      msgEl.textContent += " First streak milestone — 3 days straight. Keep going.";
    }
    if (streak === 7 && msgEl) {
      msgEl.textContent += " 7-day streak — serious discipline. Respect.";
    }
    if (streak === 30 && msgEl) {
      msgEl.textContent += " 30 days. This is identity-level discipline.";
    }

    updateDisciplineUI();
  });
}


/* -----------------------------
   GLOBAL INIT
   ----------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  // Quizzes
  autoFixQuizForms();
  setupUniversalQuizzes();

  // Lesson progression
  setupFinishLessonButton();
  setupLessonProgressionLock();

  // 9 o'clock discipline system
  setupDisciplineButton();
});
/* ========================================================================
   AUTO-FIX ENGINE — FIX BROKEN LESSON PAGES (1–14)
   Ensures every lesson loads:
   - correct stylesheet path
   - correct app.js path
   - loader
   - theme
   - glass-card layout
   - top bar
   ======================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------------------------------------------
     1. FIX WRONG CSS PATHS
     ------------------------------------------------------------ */
  const cssExists = [...document.querySelectorAll("link")].some(link =>
    link.href.includes("styles.css")
  );

  if (!cssExists) {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "../styles.css";   // correct path
    document.head.appendChild(css);
  }


  /* ------------------------------------------------------------
     2. FIX WRONG JS PATHS
     ------------------------------------------------------------ */
  const jsExists = [...document.querySelectorAll("script")].some(script =>
    script.src.includes("app.js")
  );

  if (!jsExists) {
    const script = document.createElement("script");
    script.src = "../app.js";     // correct path
    document.body.appendChild(script);
  }


  /* ------------------------------------------------------------
     3. ENSURE THEME CLASS EXISTS
     ------------------------------------------------------------ */
  if (!document.body.classList.contains("theme-dark")) {
    document.body.classList.add("theme-dark");
  }


  /* ------------------------------------------------------------
     4. INJECT LOADER IF MISSING
     ------------------------------------------------------------ */
  if (!document.getElementById("loader-overlay")) {
    const loader = document.createElement("div");
    loader.id = "loader-overlay";
    loader.className = "loader-overlay";
    loader.innerHTML = `
      <div class="loader-candles">
        <div class="loader-candle"></div>
        <div class="loader-candle"></div>
        <div class="loader-candle"></div>
        <div class="loader-candle"></div>
        <div class="loader-candle"></div>
      </div>
      <div class="glow-text">Loading Lesson…</div>
    `;
    document.body.prepend(loader);
  }


  /* ------------------------------------------------------------
     5. INJECT TOP BAR IF MISSING
     ------------------------------------------------------------ */
  if (!document.querySelector(".top-bar")) {
    const topBar = document.createElement("header");
    topBar.className = "top-bar glass-bar";
    topBar.innerHTML = `
      <a href="../lessons/lessons.html" class="icon-button">←</a>
      <h1 class="app-title glow-text">Lesson</h1>
      <div class="top-bar-right">
        <button id="secure-toggle" class="icon-button">🔒</button>
        <button id="theme-toggle" class="icon-button">🌓</button>
      </div>
    `;
    document.body.prepend(topBar);
  }


  /* ------------------------------------------------------------
     6. FIX MAIN CONTENT WRAPPER
     ------------------------------------------------------------ */
  const main = document.querySelector("main");
  if (main && !main.classList.contains("main-content")) {
    main.classList.add("main-content", "secure-area");
  }

  const section = document.querySelector("main > section");
  if (section && !section.classList.contains("glass-card")) {
    section.classList.add("glass-card");
  }

});
function fixBackButtons() {
  const backButtons = document.querySelectorAll('a.icon-button');

  backButtons.forEach(btn => {
    // Only fix buttons that contain the arrow
    if (btn.textContent.trim() === "←") {
      btn.setAttribute("href", "lessons.html");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fixBackButtons();
});
// -----------------------------
// STAGE 1 QUIZ LOGIC
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const quizForm = document.getElementById("lesson1-quiz");
  const quizMsg = document.getElementById("lesson1-quiz-message");

  if (quizForm) {
    quizForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const answers = {
        q1: "b",
        q2: "b",
        q3: "c",
      };

      const userAnswers = {
        q1: quizForm.q1.value,
        q2: quizForm.q2.value,
        q3: quizForm.q3.value,
      };

      let correctCount = 0;
      let feedback = "";

      Object.keys(answers).forEach((key) => {
        if (userAnswers[key] === answers[key]) {
          correctCount++;
        } else {
          feedback += `<p><strong>Question ${key.slice(1)}:</strong> Incorrect.<br>
          Correct answer: <strong>${answers[key].toUpperCase()}</strong></p>`;
        }
      });

      if (correctCount === 3) {
        quizMsg.innerHTML = `<p class="success">Perfect — you understand the foundation.</p>`;
      } else {
        quizMsg.innerHTML = `
          <p class="error">You got ${correctCount}/3 correct. Review the correct answers below:</p>
          ${feedback}
        `;
      }
    });
  }

  // -----------------------------
  // STAGE 1 SIMULATION LOGIC
  // -----------------------------
  const simForm = document.getElementById("lesson1-sim");
  const simMsg = document.getElementById("lesson1-sim-message");

  if (simForm) {
    simForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const direction = simForm.direction.value;
      const mindset = simForm.mindset.value;

      let correct = true;
      let explanation = "";

      if (mindset !== "b") {
        correct = false;
        explanation += `<p><strong>Mindset:</strong> Correct answer is <strong>B</strong> — stay calm and follow your rules.</p>`;
      }

      if (correct) {
        simMsg.innerHTML = `<p class="success">Great job — you completed Stage 1 with the right mindset.</p>`;
      } else {
        simMsg.innerHTML = `
          <p class="error">Not quite. Review the correct mindset below:</p>
          ${explanation}
        `;
      }
    });
  }
});
