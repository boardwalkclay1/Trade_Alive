document.addEventListener("DOMContentLoaded", () => {
  
  const sidebar = document.getElementById("sidebar");
  const burger = document.getElementById("burger");
  const closeSidebar = document.getElementById("close-sidebar");

  burger.addEventListener("click", () => sidebar.classList.add("open"));
  closeSidebar.addEventListener("click", () => sidebar.classList.remove("open"));

  // CHAPTER NAVIGATION
  document.querySelectorAll(".sidebar-link").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      document.getElementById(target).scrollIntoView({ behavior: "smooth" });
      sidebar.classList.remove("open");
    });
  });

  // DISCIPLINE BUTTON + STREAK SYSTEM
  const disciplineBtn = document.getElementById("discipline-button");
  const streakCount = document.getElementById("streak-count");
  const lastCheck = document.getElementById("last-check");

  let streak = Number(localStorage.getItem("streak")) || 0;
  let last = localStorage.getItem("lastCheck") || "—";

  streakCount.textContent = streak;
  lastCheck.textContent = last;

  disciplineBtn.addEventListener("click", () => {
    const now = new Date();
    const today = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    if (last !== today) {
      streak++;
      localStorage.setItem("streak", streak);
      streakCount.textContent = streak;
    }

    last = today;
    localStorage.setItem("lastCheck", today);
    lastCheck.textContent = `${today} @ ${time}`;

    disciplineBtn.textContent = "✔ Checked In";
    setTimeout(() => disciplineBtn.textContent = "9 o'clock Discipline Check", 2000);
  });

});
