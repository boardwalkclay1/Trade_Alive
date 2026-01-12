// app.js

// ---------- THEME ----------
function initTheme() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const stored = localStorage.getItem("theme") || "dark";
  setTheme(stored);

  btn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("theme-dark");
    setTheme(isDark ? "light" : "dark");
  });

  function setTheme(mode) {
    document.body.classList.toggle("theme-dark", mode === "dark");
    document.body.classList.toggle("theme-light", mode === "light");
    localStorage.setItem("theme", mode);
  }
}

// ---------- GLOBAL ACCESS GATE ----------
function enforceGlobalAccessGate() {
  const hasAccess = localStorage.getItem("academyAccess") === "true";
  if (!hasAccess) {
    window.location.href = "../paywall.html";
  }
}

// ---------- FREE ACCESS GATE BY EMAIL (OPTION C) ----------
function initFreeAccessGate() {
  const form = document.getElementById("free-access-form");
  const msg = document.getElementById("free-access-message");
  if (!form) return;

  // Your override email
  const allowed = "Boardwalkclay1@gmail.com".toLowerCase();

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
      msg.textContent = "Access granted. Redirecting to lessons...";
      msg.className = "feedback-text success-text";
      setTimeout(() => {
        window.location.href = "lessons.html";
      }, 700);
    } else {
      msg.textContent = "This email is not authorized for access.";
      msg.className = "feedback-text error-text";
    }
  });
}

// If already unlocked, skip the email step
function autoEnterIfAlreadyUnlocked() {
  const hasAccess = localStorage.getItem("academyAccess") === "true";
  if (hasAccess) {
    window.location.href = "lessons.html";
  }
}

// ---------- LESSONS SHELL ----------
function initLessonsShell() {
  setupSidebarNav();
  setupDisciplinePopup();
  setupSecureMode();
}

// Sidebar navigation
function setupSidebarNav() {
  const links = document.querySelectorAll(".sidebar-link");
  links.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      const id = target + "-section";
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ---------- WEEKLY DISCIPLINE POPUP ----------
function setupDisciplinePopup() {
  const popup = document.getElementById("discipline-popup");
  const closeBtn = document.getElementById("discipline-close");
  const button = document.getElementById("discipline-button");
  if (!popup) return;

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const lastShown = Number(localStorage.getItem("lastDisciplinePopup") || 0);
  const now = Date.now();

  // Auto once a week
  if (!lastShown || now - lastShown > WEEK_MS) {
    showPopup();
  }

  if (button) {
    button.addEventListener("click", showPopup);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hidePopup();
      localStorage.setItem("lastDisciplinePopup", String(Date.now()));
    });
  }

  function showPopup() {
    popup.classList.remove("hidden");
  }

  function hidePopup() {
    popup.classList.add("hidden");
  }
}

// ---------- SECURE MODE (BLUE/BLUR TO DETER SCREEN CAPTURES) ----------
function setupSecureMode() {
  const area = document.querySelector(".secure-area");
  const toggle = document.getElementById("secure-toggle");
  if (!area) return;

  // Manual toggle
  if (toggle) {
    toggle.addEventListener("click", () => {
      area.classList.toggle("secure-blur");
    });
  }

  // Auto blur when tab loses focus, unblur on return
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      area.classList.add("secure-blur");
    } else {
      area.classList.remove("secure-blur");
    }
  });
}
