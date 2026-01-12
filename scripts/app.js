// scripts/app.js

// ---------- THEME ----------
function initTheme() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const stored = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("theme-dark", stored === "dark");
  document.body.classList.toggle("theme-light", stored === "light");

  btn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("theme-dark");
    document.body.classList.toggle("theme-dark", !isDark);
    document.body.classList.toggle("theme-light", isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  });
}

// ---------- GLOBAL ACCESS GATE ----------
function enforceGlobalAccessGate() {
  const hasAccess = localStorage.getItem("academyAccess") === "true";
  if (!hasAccess) {
    window.location.href = "../paywall.html";
  }
}

// ---------- PAYMENT RETURN HANDLER (OPTIONAL) ----------
function checkPaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("access") === "granted") {
    localStorage.setItem("academyAccess", "true");
    window.location.replace("lessons.html");
  }
}

// ---------- FREE ACCESS GATE BY EMAIL ----------
function initFreeAccessGate() {
  const form = document.getElementById("free-access-form");
  const msg = document.getElementById("free-access-message");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = (data.get("freeEmail") || "").toString().trim().toLowerCase();
    const allowed = "FREE_ACCESS_EMAIL_HERE".toLowerCase(); // replace with your email

    if (!email) {
      msg.textContent = "Please enter an email.";
      msg.classList.add("error-text");
      return;
    }

    if (email === allowed) {
      localStorage.setItem("academyAccess", "true");
      msg.textContent = "Access granted. Redirecting to lessons...";
      msg.classList.remove("error-text");
      msg.classList.add("success-text");
      setTimeout(() => {
        window.location.href = "lessons.html";
      }, 800);
    } else {
      msg.textContent = "This email is not authorized for free access.";
      msg.classList.add("error-text");
      msg.classList.remove("success-text");
    }
  });
}

// ---------- LESSONS SHELL ----------
function initLessonsShell() {
  setupSidebarNav();
  setupDisciplinePopup();
  setupSecureMode();
}

// Sidebar navigation scroll between sections
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

// ---------- SECURE MODE (BLUE/BLUR ON VISIBILITY CHANGE) ----------
function setupSecureMode() {
  const area = document.querySelector(".secure-area");
  const toggle = document.getElementById("secure-toggle");
  if (!area) return;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      area.classList.add("secure-blur");
    } else {
      area.classList.remove("secure-blur");
    }
  });

  if (toggle) {
    toggle.addEventListener("click", () => {
      area.classList.toggle("secure-blur");
    });
  }
}
