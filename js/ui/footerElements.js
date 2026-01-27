// @ts-check

import { FOOTER_PROJECTS, PATHS, STORAGE_KEYS, STRINGS } from "../constants.js";
import { loadString, saveString } from "../utils/storage.js";
import { applyTheme, resolveInitialTheme, THEMES } from "../utils/theme.js";

const FOOTER_SELECTOR = "mpr-footer[data-test=\"site-footer\"]";
const THEME_TOGGLE_CONTAINER_SELECTOR = "[data-mpr-footer=\"theme-toggle\"]";
const THEME_TOGGLE_LABEL_SELECTOR = "[data-mpr-theme-toggle=\"label\"]";
const THEME_ATTRIBUTE = "data-bs-theme";
const THEME_INPUT_ID = "themeToggle";

/**
 * @returns {{ text: string; links: Array<{ label: string; url: string }> }}
 */
function buildLinksCollection() {
  return {
    text: STRINGS.footerMenuLabel,
    links: FOOTER_PROJECTS.map((project) => ({
      label: project.label,
      url: project.url
    }))
  };
}

/**
 * @param {"light" | "dark"} initialMode
 * @returns {{ attribute: string; targets: string[]; modes: string[]; initialMode: string; label: string; ariaLabel: string; inputId: string }}
 */
function buildThemeConfig(initialMode) {
  return {
    attribute: THEME_ATTRIBUTE,
    targets: ["html"],
    modes: [THEMES.light, THEMES.dark],
    initialMode,
    label: STRINGS.themeToggleLabel,
    ariaLabel: STRINGS.themeToggleLabel,
    inputId: THEME_INPUT_ID
  };
}

/**
 * @param {HTMLElement} footerElement
 */
function ensureThemeToggleLabel(footerElement) {
  const toggleContainer = footerElement.querySelector(THEME_TOGGLE_CONTAINER_SELECTOR);
  if (!(toggleContainer instanceof HTMLElement)) {
    return;
  }
  const existingLabel = toggleContainer.querySelector(THEME_TOGGLE_LABEL_SELECTOR);
  if (existingLabel instanceof HTMLElement) {
    existingLabel.textContent = STRINGS.themeToggleLabel;
    return;
  }
  const labelElement = document.createElement("span");
  labelElement.setAttribute("data-mpr-theme-toggle", "label");
  labelElement.textContent = STRINGS.themeToggleLabel;
  toggleContainer.appendChild(labelElement);
}

/**
 * @param {HTMLElement} footerElement
 */
function scheduleThemeToggleLabel(footerElement) {
  const applyLabel = () => {
    ensureThemeToggleLabel(footerElement);
  };
  if (typeof customElements !== "undefined" && typeof customElements.whenDefined === "function") {
    customElements.whenDefined("mpr-footer").then(() => {
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(applyLabel);
      } else {
        window.setTimeout(applyLabel, 0);
      }
    });
    return;
  }
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(applyLabel);
    return;
  }
  window.setTimeout(applyLabel, 0);
}

/**
 * Apply footer configuration to the mpr-ui custom element.
 */
export function applyFooterElementAttributes() {
  const footer = document.querySelector(FOOTER_SELECTOR);
  if (!(footer instanceof HTMLElement)) {
    return;
  }
  footer.setAttribute("links-collection", JSON.stringify(buildLinksCollection()));
  footer.setAttribute("privacy-link-href", PATHS.privacy);
  footer.setAttribute("privacy-link-label", STRINGS.privacyLinkLabel);
  footer.setAttribute("theme-switcher", "toggle");

  const storedPreference = loadString(STORAGE_KEYS.theme);
  const initialMode = resolveInitialTheme(storedPreference);
  applyTheme(initialMode);
  footer.setAttribute("theme-config", JSON.stringify(buildThemeConfig(initialMode)));

  const shortcutElement = footer.querySelector("[data-role=\"footer-shortcuts\"]");
  if (shortcutElement instanceof HTMLElement) {
    shortcutElement.textContent = STRINGS.footerHint;
  }

  footer.addEventListener("mpr-footer:theme-change", (event) => {
    const mode = event?.detail?.theme;
    if (mode === THEMES.light || mode === THEMES.dark) {
      saveString(STORAGE_KEYS.theme, mode);
    }
  });
  scheduleThemeToggleLabel(footer);
}
