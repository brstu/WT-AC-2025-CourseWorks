export type Theme = "light" | "dark";

const STORAGE_KEY = "ims_theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
    return null;
  } catch {
    return null;
  }
}

export function setStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function initTheme() {
  const stored = getStoredTheme();
  applyTheme(stored ?? getPreferredTheme());
}

export function toggleTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}
