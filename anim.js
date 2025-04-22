const toggleBtn = document.getElementById("toggle-theme");
const lightTheme = document.getElementById("light-theme");
const darkTheme = document.getElementById("dark-theme");
const app = document.getElementById("app");

// Load saved theme
const savedTheme = localStorage.getItem("taskGardenTheme");
if (savedTheme === "dark") {
  lightTheme.disabled = true;
  darkTheme.disabled = false;
  toggleBtn.textContent = "Back to Light";
}

toggleBtn.addEventListener("click", () => {
  app.style.opacity = 0;

  setTimeout(() => {
    const isDark = !darkTheme.disabled;
    darkTheme.disabled = isDark;
    lightTheme.disabled = !isDark;
    toggleBtn.textContent = isDark ? "Toggle Theme" : "Toggle Theme";

    localStorage.setItem("taskGardenTheme", isDark ? "light" : "dark");

    app.style.opacity = 1;
  }, 300);
});
