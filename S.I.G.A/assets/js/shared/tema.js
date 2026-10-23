document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const button = document.getElementById("alternar_tema") || document.getElementById("theme_toggle");

  if (!button) return;

  const suportaAltoContraste = root.dataset.suportaAltoContraste === "true";
  const temasValidos = suportaAltoContraste
    ? ["light", "dark", "contrast"]
    : ["light", "dark"];
  const rotulosTema = {
    "pt-BR": {
      light: "Tema atual: claro. Próximo: escuro.",
      dark: suportaAltoContraste
        ? "Tema atual: escuro. Próximo: alto contraste."
        : "Tema atual: escuro. Próximo: claro.",
      contrast: "Tema atual: alto contraste. Próximo: claro."
    },
    en: {
      light: "Current theme: light. Next: dark.",
      dark: suportaAltoContraste
        ? "Current theme: dark. Next: high contrast."
        : "Current theme: dark. Next: light.",
      contrast: "Current theme: high contrast. Next: light."
    },
    es: {
      light: "Tema actual: claro. Siguiente: oscuro.",
      dark: suportaAltoContraste
        ? "Tema actual: oscuro. Siguiente: alto contraste."
        : "Tema actual: oscuro. Siguiente: claro.",
      contrast: "Tema actual: alto contraste. Siguiente: claro."
    }
  };

  function atualizarRotuloTema(theme = root.getAttribute("data-theme")) {
    const idioma = root.lang === "en" || root.lang === "es" ? root.lang : "pt-BR";
    button.setAttribute("aria-label", rotulosTema[idioma][theme] || rotulosTema[idioma].light);
    button.title = button.getAttribute("aria-label");
  }

  window.atualizarRotuloTema = atualizarRotuloTema;

  function readTheme() {
    try {
      let savedTheme = localStorage.getItem("siga-tema");
      if (!temasValidos.includes(savedTheme)) {
        savedTheme = localStorage.getItem("siga-theme");
        if (temasValidos.includes(savedTheme)) {
          localStorage.setItem("siga-tema", savedTheme);
          localStorage.removeItem("siga-theme");
        }
      }
      return temasValidos.includes(savedTheme) ? savedTheme : null;
    } catch (error) {
      return null;
    }
  }

  function setTheme(theme, save = true) {
    if (!temasValidos.includes(theme)) return;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-tema", { light: "claro", dark: "escuro", contrast: "alto_contraste" }[theme]);
    if (suportaAltoContraste) {
      button.removeAttribute("aria-pressed");
    } else {
      button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
    atualizarRotuloTema(theme);

    if (save) {
      try {
        localStorage.setItem("siga-tema", theme);
        localStorage.removeItem("siga-theme");
      } catch (error) {
        // The selected theme remains active for this page.
      }
    }
  }

  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const savedTheme = readTheme();
  const temaInicial = { claro: "light", escuro: "dark", alto_contraste: "contrast" }[root.getAttribute("data-tema")];
  const temaAtual = root.getAttribute("data-theme");
  setTheme(savedTheme || temaInicial || (temasValidos.includes(temaAtual) ? temaAtual : null) || (media && media.matches ? "dark" : "light"), false);

  button.addEventListener("click", () => {
    const temaAtual = root.getAttribute("data-theme");
    const indiceAtual = temasValidos.indexOf(temaAtual);
    setTheme(temasValidos[(indiceAtual + 1) % temasValidos.length]);
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
