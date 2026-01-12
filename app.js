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

  document.addEventListener("click", (e) => {
    if (!sidebar.classList.contains("open")) return;
    const inside = sidebar.contains(e.target) || openBtn?.contains(e.target);
    if (!inside) sidebar.classList.remove("open");
  });

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

  let streak = parseInt(localStorage.getItem("disciplineStreak") || "0", 10);
  let score = parseInt(localStorage.getItem("disciplineScore") || "0", 10);
  const lastCheckinDate = localStorage.getItem("lastCheckinDate") || null;

  streakEl.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
  scoreEl.textContent = score.toString();

  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 6 = Sat

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
    const todayStr = now.toISOString().split("T")[0];

    if (lastCheckinDate === todayStr) {
      messageEl.textContent =
        "You have already checked in today. Focus on maintaining your streak tomorrow.";
      return;
    }

    if (hours < 9) {
      streak += 1;
      score += 5;
      localStorage.setItem("disciplineStreak", String(streak));
      localStorage.setItem("disciplineScore", String(score));
      localStorage.setItem("lastCheckinDate", todayStr);

      streakEl.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
      scoreEl.textContent = score.toString();
      messageEl.textContent =
        "You showed up on time. Discipline builds consistency. Consistency builds success.";
    } else {
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
    localStorage.removeItem("completedStages");
    localStorage.removeItem("subscriptionExpires");
    localStorage.removeItem("cautionAcknowledged");
    window.location.reload();
  });
}

// ----- Mock options form -----

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

    const detailId = "mock-errors-list";
    let list = document.getElementById(detailId);
    if (list) list.remove();

    if (errors.length > 0) {
      msg.textContent =
        "Your simulation would likely not be approved. Please review the feedback below and adjust your answers.";
      msg.style.color = "#f97373";

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

    localStorage.setItem("mockOptionsCompleted", "true");
    msg.textContent =
      "You have successfully completed the options registration simulation. Lessons are now unlocked.";
    msg.style.color = "#4ade80";

    setTimeout(() => {
      window.location.href = "lessons.html";
    }, 1200);
  });
}

// ----- Lessons hub -----

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

  const totalStages = 6;
  const completedStages = parseInt(localStorage.getItem("completedStages") || "0", 10);

  for (let stage = 1; stage <= totalStages; stage++) {
    const statusEl = document.getElementById(`stage-${stage}-status`);
    const button = document.querySelector(`button[data-open-stage="${stage}"]`);

    if (!statusEl || !button) continue;

    if (stage === 1 || stage <= completedStages + 1) {
      statusEl.textContent = "Unlocked";
      statusEl.style.borderColor = "#4ade80";
      button.disabled = false;
      button.classList.remove("secondary-button");
      button.classList.add("primary-button");
      button.textContent = "Open Lesson";
    } else {
      statusEl.textContent = "Locked";
      statusEl.style.borderColor = "rgba(148,163,184,0.6)";
      button.disabled = true;
      button.classList.remove("primary-button");
      button.classList.add("secondary-button");
      button.textContent = "Locked";
    }

    button.addEventListener("click", () => {
      window.location.href = `lesson-${stage}.html`;
    });
  }
}

// ----- Stage completion helpers -----

function markStageCompleted(stageNumber) {
  const current = parseInt(localStorage.getItem("completedStages") || "0", 10);
  if (stageNumber > current) {
    localStorage.setItem("completedStages", String(stageNumber));
  }
}

// ----- Lesson 1 logic -----

function initLesson1() {
  const quizForm = document.getElementById("lesson1-quiz");
  const quizMsg = document.getElementById("lesson1-quiz-message");
  const simForm = document.getElementById("lesson1-sim");
  const simMsg = document.getElementById("lesson1-sim-message");

  if (quizForm) {
    quizForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(quizForm);
      const q1 = data.get("q1");
      const q2 = data.get("q2");
      const q3 = data.get("q3");

      if (q1 === "b" && q2 === "b" && q3 === "c") {
        quizMsg.textContent = "Correct. You understand why discipline and simple direction come first.";
        quizMsg.style.color = "#4ade80";
      } else {
        quizMsg.textContent =
          "Some answers were off. Re-read the lesson and focus on discipline and the simple up/down model.";
        quizMsg.style.color = "#f97373";
      }
    });
  }

  if (simForm) {
    simForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(simForm);
      const direction = data.get("direction");
      const mindset = data.get("mindset");

      if (!direction) {
        simMsg.textContent = "Choose a direction to complete the simulation.";
        simMsg.style.color = "#f97373";
        return;
      }

      if (mindset === "b") {
        simMsg.textContent =
          "Good. You are connecting direction with a calm, rule-based mindset. Stage 1 completed.";
        simMsg.style.color = "#4ade80";
        markStageCompleted(1);
        setTimeout(() => {
          window.location.href = "lessons.html";
        }, 1200);
      } else {
        simMsg.textContent =
          "That mindset is not disciplined. Review the lesson and choose the response that reflects calm, rule-based behavior.";
        simMsg.style.color = "#f97373";
      }
    });
  }
}

// ----- Lesson 2 logic -----

function initLesson2() {
  const quizForm = document.getElementById("lesson2-quiz");
  const quizMsg = document.getElementById("lesson2-quiz-message");
  const simForm = document.getElementById("lesson2-sim");
  const simMsg = document.getElementById("lesson2-sim-message");

  if (quizForm) {
    quizForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(quizForm);
      const q1 = data.get("q1");
      const q2 = data.get("q2");
      const q3 = data.get("q3");

      if (q1 === "b" && q2 === "b" && q3 === "b") {
        quizMsg.textContent =
          "Correct. You understand that real people are on the other side and what a ticker represents.";
        quizMsg.style.color = "#4ade80";
      } else {
        quizMsg.textContent =
          "Some answers were off. Re-read the lesson and focus on people, tickers, and what you’re really trading.";
        quizMsg.style.color = "#f97373";
      }
    });
  }

  if (simForm) {
    simForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(simForm);
      const ticker = data.get("ticker");
      const callIdea = data.get("callIdea");

      if (!ticker) {
        simMsg.textContent = "Select a ticker to continue.";
        simMsg.style.color = "#f97373";
        return;
      }

      if (callIdea === "a") {
        simMsg.textContent =
          `Good. You’ve connected a call contract on ${ticker} with an expectation of upward movement. Stage 2 completed.`;
        simMsg.style.color = "#4ade80";
        markStageCompleted(2);
        setTimeout(() => {
          window.location.href = "lessons.html";
        }, 1200);
      } else {
        simMsg.textContent =
          "That does not match the basic idea of a call. Re-read the section on tickers and what a call is implying.";
        simMsg.style.color = "#f97373";
      }
    });
  }
}
