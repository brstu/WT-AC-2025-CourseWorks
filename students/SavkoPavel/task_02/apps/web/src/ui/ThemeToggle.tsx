import React, { useEffect, useState } from "react";
import { applyTheme, getStoredTheme, setStoredTheme, Theme, toggleTheme } from "../lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") return current;
    return getStoredTheme() ?? "light";
  });

  useEffect(() => {
    applyTheme(theme);
    setStoredTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={() => setTheme((t) => toggleTheme(t))}
      title="Toggle theme"
    >
      <span className="pill">
        Theme: <span style={{ fontWeight: 700 }}>{theme}</span>
      </span>
    </button>
  );
}
