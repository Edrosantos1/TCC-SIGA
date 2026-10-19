document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const button = document.getElementById("theme_toggle");

  if (!button) return;

  function readTheme() {
    try {
      const savedTheme = localStorage.getItem("siga-theme");
      return savedTheme === "dark" || savedTheme === "light" ? savedTheme : null;
    } catch (error) {
      return null;
    }
  }

  function setTheme(theme, save = true) {
    root.setAttribute("data-theme", theme);
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");

    if (save) {
      try {
        localStorage.setItem("siga-theme", theme);
      } catch (error) {
        // The selected theme remains active for this page.
      }
    }
  }

  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const savedTheme = readTheme();
  setTheme(savedTheme || (media && media.matches ? "dark" : "light"), false);

  button.addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  if (media) {
    const updateFromSystem = (event) => {
      if (!readTheme()) setTheme(event.matches ? "dark" : "light", false);
    };

    if (media.addEventListener) {
      media.addEventListener("change", updateFromSystem);
    } else if (media.addListener) {
      media.addListener(updateFromSystem);
    }
  }
});
