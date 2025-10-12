// @ts-check

export const THEMES = Object.freeze({
  light: "light",
  dark: "dark"
});

/**
 * @param {string | null} storedValue
 * @returns {"light" | "dark"}
 */
export function resolveInitialTheme(storedValue) {
  if (storedValue === THEMES.dark || storedValue === THEMES.light) {
    return storedValue;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? THEMES.dark : THEMES.light;
}

/**
 * @param {"light" | "dark"} mode
 * @returns {void}
 */
export function applyTheme(mode) {
  document.documentElement.setAttribute("data-bs-theme", mode);
}
