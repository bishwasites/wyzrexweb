// theme.js — dark/light toggle + persistence
const STORAGE_KEY = "wyzrex-theme";
const root = document.documentElement;

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  document.querySelectorAll("[data-theme-label]").forEach((el) => {
    el.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  });
}

export function initTheme() {
  applyTheme(getPreferredTheme());

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable — theme still applies for this session */
      }
    });
  });

  // Follow system changes only while the user hasn't made an explicit choice
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (getStoredTheme()) return;
    applyTheme(e.matches ? "dark" : "light");
  });
}

initTheme();
