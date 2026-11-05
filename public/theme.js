// Runs before first paint so the saved theme never flashes.
(function applySavedTheme() {
  try {
    const theme = localStorage.getItem("theme");
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
  } catch (error) {
    // Storage blocked: fall back to the system preference.
  }
})();
