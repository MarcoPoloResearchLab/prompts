// @ts-check

import { AUTH_BUTTON_CONFIG, AUTH_CONFIG, PATHS, STRINGS } from "../constants.js";

const LOGIN_BUTTON_SELECTOR = "mpr-login-button[data-test=\"auth-login\"]";
const USER_MENU_SELECTOR = "mpr-user[data-test=\"auth-user\"]";
const USER_MENU_DISPLAY_MODE = "avatar";

/**
 * @param {Element | null} targetElement
 * @param {string} attributeName
 * @param {string} attributeValue
 */
function setAttributeValue(targetElement, attributeName, attributeValue) {
  if (!(targetElement instanceof HTMLElement)) {
    return;
  }
  targetElement.setAttribute(attributeName, attributeValue);
}

/**
 * Apply required auth attributes to mpr-ui custom elements.
 */
export function applyAuthElementAttributes() {
  const loginButton = document.querySelector(LOGIN_BUTTON_SELECTOR);
  if (loginButton instanceof HTMLElement) {
    setAttributeValue(loginButton, "site-id", AUTH_CONFIG.googleClientId);
    setAttributeValue(loginButton, "tauth-tenant-id", AUTH_CONFIG.tenantId);
    setAttributeValue(loginButton, "tauth-login-path", AUTH_CONFIG.loginPath);
    setAttributeValue(loginButton, "tauth-logout-path", AUTH_CONFIG.logoutPath);
    setAttributeValue(loginButton, "tauth-nonce-path", AUTH_CONFIG.noncePath);
    setAttributeValue(loginButton, "button-text", AUTH_BUTTON_CONFIG.text);
    setAttributeValue(loginButton, "button-size", AUTH_BUTTON_CONFIG.size);
    setAttributeValue(loginButton, "button-theme", AUTH_BUTTON_CONFIG.theme);
    if (AUTH_CONFIG.tauthUrl) {
      setAttributeValue(loginButton, "tauth-url", AUTH_CONFIG.tauthUrl);
    }
  }

  const userMenu = document.querySelector(USER_MENU_SELECTOR);
  if (userMenu instanceof HTMLElement) {
    setAttributeValue(userMenu, "display-mode", USER_MENU_DISPLAY_MODE);
    setAttributeValue(userMenu, "logout-url", PATHS.logoutRedirect);
    setAttributeValue(userMenu, "logout-label", STRINGS.signOutLabel);
    setAttributeValue(userMenu, "tauth-tenant-id", AUTH_CONFIG.tenantId);
  }
}
