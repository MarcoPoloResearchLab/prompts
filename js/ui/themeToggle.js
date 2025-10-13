// @ts-check

import { EVENTS, STORAGE_KEYS } from "../constants.js";
import { loadString, saveString } from "../utils/storage.js";
import { applyTheme, resolveInitialTheme, THEMES } from "../utils/theme.js";

/**
 * @returns {{ mode: "light" | "dark", init: () => void, toggle: () => void }}
 */
export function ThemeToggle() {
  return {
    mode: THEMES.light,
    init() {
      const storedPreference = loadString(STORAGE_KEYS.theme);
      this.mode = resolveInitialTheme(storedPreference);
      applyTheme(this.mode);
      this.$dispatch(EVENTS.themeToggle, { mode: this.mode });
    },
    toggle() {
      this.mode = this.mode === THEMES.dark ? THEMES.light : THEMES.dark;
      applyTheme(this.mode);
      saveString(STORAGE_KEYS.theme, this.mode);
      this.$dispatch(EVENTS.themeToggle, { mode: this.mode });
    }
  };
}
