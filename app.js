// ----- Theme -----

function initTheme() {
  const stored = localStorage.getItem("theme");
  const theme = stored === "light" || stored === "dark" ? stored : "dark";
  applyTheme(theme);

  const toggleButtons = document.querySelectorAll("#theme-toggle, #sidebar-theme-toggle");
  toggleButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const current = document.body.classList.contains("theme-dark") ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("theme", next);
    })
  );
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("theme-dark");
    document.body.classList.remove("theme-light");
  } else {
    document.body.classList.add("theme-light");
    document.body.classList.remove("theme-dark");
  }
}

// ----- Sidebar -----

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const openBtn = document.getElementById("sidebar-open");
  const closeBtn = document.getElementById("sidebar-close");

  openBtn?.addEventListener("click", () => {
    sidebar.classList.add("open");
  });

  closeBtn?.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });

  // Close when clicking outside (optional)
  document.addEventListener("click", (e) => {
    if (!sidebar.classList.contains("open")) return;
    const inside = sidebar.contains(e.target) || openBtn?.contains(e.target);
    if (!inside) sidebar.classList.remove("open");
  });

  // Accordion sections
  const sections = sidebar.querySelectorAll(".sidebar-section");
  sections.forEach((sec) => {
    const toggle = sec.querySelector(".sidebar-section-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      sec.classList.toggle("open");
    });
  });
}

// ----- Caution modal -----

function initCautionModal() {
  const modal = document.getElementById("caution-modal");
  if (!modal) return;

  const acknowledged = localStorage.getItem("cautionAcknowledged") === "true";
  if (!acknowledged) {
    modal.classList.remove("hidden");
  }

  const btn = document.getElementById("caution-continue");
  btn?.addEventListener("click", () => {
    localStorage.setItem("cautionAcknowledged", "true");
    modal.classList.add("hidden");
  });
}

// ----- Discipline / 9 AM module -----

function initDisciplineModule() {
  const button = document.getElementById("checkin-button");
  if (!button) return;

  const streakEl = document.getElementById("streak-value");
  const scoreEl = document.getElementById("discipline-score");
  const messageEl = document.getElementById("checkin-message");
  const marketDayStatusEl = document.getElementById("market-day-status");
  const violationEl = document.getElementById("violation-count");

  let streak = parseInt(localStorage.getItem("disciplineStreak") || "0", 10);
  let score = parseInt(localStorage.getItem("disciplineScore") || "0", 10);
  const lastCheckinDate = localStorage.getItem("lastCheckinDate") || null;

  streakEl.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
  scoreEl.textContent = score.toString();
  violationEl.textContent = `${getViolationCount()} / 3`;

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday

  if (day === 0 || day === 6) {
    marketDayStatusEl.textContent = "Markets are closed today. No 9:00 AM check-in is required.";
    button.disabled = true;
    return;
  } else {
    marketDayStatusEl.textContent =
      "Markets are open. You must check in before 9:00 AM local time to build your discipline.";
  }

  button.addEventListener("click", () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const todayStr = now.toISOString().split("T")[0];

    // Prevent multiple check-ins same day
    if (lastCheckinDate === todayStr) {
      messageEl.textContent =
        "You have already checked in today. Focus on maintaining your streak tomorrow.";
      return;
    }

    // Success if before 9:00 AM
    if (hours < 9) {
      streak += 1;
      score += 5; // Simple scoring: +5 per success
      localStorage.setItem("disciplineStreak", String(streak));
      localStorage.setItem("disciplineScore", String(score));
      localStorage.setItem("lastCheckinDate", todayStr);

      streakEl.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
      scoreEl.textContent = score.toString();
      messageEl.textContent =
        "You showed up on time. Discipline builds consistency. Consistency builds success.";
    } else {
      // Late
      streak = 0;
      score = Math.max(0, score - 3);
      localStorage.setItem("disciplineStreak", String(streak));
      localStorage.setItem("disciplineScore", String(score));
      localStorage.setItem("lastCheckinDate", todayStr);

      streakEl.textContent = `${streak} days`;
      scoreEl.textContent = score.toString();
      messageEl.textContent =
        "You were late today. The market does not wait. Reset your focus and be ready before 9:00 AM tomorrow.";
    }
  });
}

// ----- Blur / violation / pseudo anti-screenshot -----

function initBlurAndViolationSystem() {
  const blurOverlay = document.getElementById("blur-overlay");
  if (!blurOverlay) return;

  function addViolation(reason) {
    let count = getViolationCount();
    count += 1;
    localStorage.setItem("violationCount", String(count));

    const violationEl = document.getElementById("violation-count");
    if (violationEl) {
      violationEl.textContent = `${count} / 3`;
    }

    showBlurOverlay(
      count,
      reason ||
        "Suspicious activity detected. This training environment is meant to be experienced, not captured."
    );

    if (count >= 3) {
      revokeAccess();
    }
  }

  // Show blur with message
  function showBlurOverlay(count, text) {
    blurOverlay.classList.remove("hidden");
    const existing = document.getElementById("blur-message");
    if (existing) existing.remove();

    const msg = document.createElement("div");
    msg.id = "blur-message";
    msg.style.position = "fixed";
    msg.style.inset = "0";
    msg.style.display = "flex";
    msg.style.alignItems = "center";
    msg.style.justifyContent = "center";
    msg.style.zIndex = "66";
    msg.innerHTML = `
      <div style="
        max-width: 380px;
        margin: 0 1rem;
        padding: 1.25rem 1.5rem;
        border-radius: 0.9rem;
        background: rgba(15,23,42,0.98);
        color: #e5e7eb;
        border: 1px solid rgba(148,163,184,0.7);
        font-size: 0.9rem;
      ">
        <h3 style="margin-top:0;margin-bottom:0.5rem;font-size:1rem;">Attention</h3>
        <p style="margin-bottom:0.5rem;">${text}</p>
        <p style="margin-bottom:0.75rem;">
          Violations: <strong>${count} / 3</strong>. At 3 violations, your access will be revoked and a new subscription will be required.
        </p>
        <button id="blur-dismiss" class="primary-button small">I Understand</button>
      </div>
    `;
    document.body.appendChild(msg);

    const dismiss = document.getElementById("blur-dismiss");
    dismiss?.addEventListener("click", () => {
      blurOverlay.classList.add("hidden");
      msg.remove();
    });
  }

  // Access revocation
  function revokeAccess() {
    // Clear subscription-like state (you can tie this to your real payment gate later)
    localStorage.setItem("subscriptionExpires", "0");
    showBlurOverlay(
      getViolationCount(),
      "Access revoked due to repeated capture or focus violations. A new subscription is required to regain access."
    );
  }

  // Visibility / blur / fullscreen as crude heuristics
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Tab lost focus
      addViolation("Focus left the training environment. Stay present while you are learning.");
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      addViolation("Fullscreen activity detected. Capture attempts are not allowed in this environment.");
    }
  });

  window.addEventListener("blur", () => {
    addViolation("Window lost focus. For your own progress, keep your attention on the training.");
  });

  // Optional: approximate 'Print Screen' on some systems
  window.addEventListener("keydown", (e) => {
    if (e.key === "PrintScreen") {
      addViolation("Screenshot key detected. Screenshots are not allowed in this academy.");
    }
  });
}

function getViolationCount() {
  return parseInt(localStorage.getItem("violationCount") || "0", 10);
}

// ----- Subscription status (placeholder) -----

function updateSubscriptionStatus() {
  const el = document.getElementById("subscription-status");
  if (!el) return;

  const expires = parseInt(localStorage.getItem("subscriptionExpires") || "0", 10);
  if (!expires || Date.now() > expires) {
    el.textContent = "Subscription: Inactive or expired.";
  } else {
    const remainingDays = Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24));
    el.textContent = `Subscription: Active (${remainingDays} day${
      remainingDays === 1 ? "" : "s"
    } remaining).`;
  }

  const resetBtn = document.getElementById("reset-progress");
  resetBtn?.addEventListener("click", () => {
    if (!confirm("Reset all progress, discipline data, and mock form completion?")) return;
    localStorage.removeItem("disciplineStreak");
    localStorage.removeItem("disciplineScore");
    localStorage.removeItem("lastCheckinDate");
    localStorage.removeItem("mockOptionsCompleted");
    localStorage.removeItem("violationCount");
    localStorage.removeItem("subscriptionExpires");
    localStorage.removeItem("cautionAcknowledged");
    window.location.reload();
  });
}

// ----- Mock options form validation -----

function initMockOptionsForm() {
  const form = document.getElementById("mock-options-form");
  if (!form) return;

  const msg = document.getElementById("mock-form-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);

    const experience = data.get("experience");
    const objective = data.get("objective");
    const riskTolerance = data.get("riskTolerance");
    const income = data.get("income");
    const netWorth = data.get("netWorth");
    const liquidNetWorth = data.get("liquidNetWorth");
    const knowledge = data.get("knowledge");
    const frequency = data.get("frequency");
    const ackRisk = data.get("ackRisk");

    const errors = [];

    // Example "passing" criteria: you can tune this however you like
    if (experience === "none") {
      errors.push("You indicated no trading experience. At least limited experience is required.");
    }
    if (objective !== "growth" && objective !== "speculation") {
      errors.push("Your primary objective should reflect growth or speculation for this simulation.");
    }
    if (riskTolerance === "low") {
      errors.push("Options trading is not aligned with a low risk tolerance in this simulation.");
    }
    if (income === "low" && netWorth === "low") {
      errors.push("Combined low income and net worth may not be suitable for options trading.");
    }
    if (knowledge !== "basic" && knowledge !== "advanced") {
      errors.push(
        "You must at least understand that calls are generally used for up moves and puts for down moves."
      );
    }
    if (!ackRisk) {
      errors.push("You must acknowledge that options trading involves significant risk.");
    }

    if (errors.length > 0) {
      msg.textContent =
        "Your simulation would likely not be approved. Please review the feedback below and adjust your answers.";
      msg.style.color = "#f97373";

      const detailId = "mock-errors-list";
      let list = document.getElementById(detailId);
      if (list) list.remove();

      list = document.createElement("ul");
      list.id = detailId;
      list.style.marginTop = "0.5rem";
      list.style.fontSize = "0.85rem";

      errors.forEach((err) => {
        const li = document.createElement("li");
        li.textContent = err;
        list.appendChild(li);
      });

      msg.insertAdjacentElement("afterend", list);
      return;
    }

    // Passed simulation
    localStorage.setItem("mockOptionsCompleted", "true");
    msg.textContent =
      "You have successfully completed the options registration simulation. Lessons are now unlocked.";
    msg.style.color = "#4ade80";

    setTimeout(() => {
      window.location.href = "lessons.html";
    }, 1200);
  });
}

// ----- Lessons page -----

function initLessonsPage() {
  const lockedSection = document.getElementById("lessons-locked");
  const contentSection = document.getElementById("lessons-content");
  if (!lockedSection || !contentSection) return;

  const mockCompleted = localStorage.getItem("mockOptionsCompleted") === "true";

  if (!mockCompleted) {
    lockedSection.classList.remove("hidden");
    contentSection.classList.add("hidden");
    return;
  }

  lockedSection.classList.add("hidden");
  contentSection.classList.remove("hidden");

  // Simple stage locking using localStorage
  const totalStages = 6;
  const completedStages = parseInt(localStorage.getItem("completedStages") || "1", 10);

  for (let stage = 1; stage <= totalStages; stage++) {
    const statusEl = document.getElementById(`stage-${stage}-status`);
    const button = document.querySelector(`button[data-open-stage="${stage}"]`);

    if (!statusEl || !button) continue;

    if (stage === 1 || stage <= completedStages) {
      statusEl.textContent = "Unlocked";
      statusEl.style.borderColor = "#4ade80";
      button.disabled = false;
      button.classList.remove("secondary-button");
      button.classList.add("primary-button");
      button.textContent = "Open Stage";
    } else {
      statusEl.textContent = "Locked";
      statusEl.style.borderColor = "rgba(148,163,184,0.6)";
      button.disabled = true;
      button.classList.remove("primary-button");
      button.classList.add("secondary-button");
      button.textContent = "Locked";
    }

    button.addEventListener("click", () => {
      openStage(stage, completedStages);
    });
  }
}

function openStage(stage, completedStages) {
  // Placeholder: for now just mark as completed and move progression forward.
  // Later you wire this to real lesson pages / modals / content.
  alert(`Stage ${stage} would open here. In a later iteration, we'll load real lesson content.`);
  const next = Math.max(completedStages, stage) + 1;
  localStorage.setItem("completedStages", String(next));
}
