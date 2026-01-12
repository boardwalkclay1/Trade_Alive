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

  const allowed = "boardwalkclay1@gmail.com"; // override email

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
