// @ts-check

import { PATHS, STRINGS } from "../constants.js";

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
 * @param {RuntimeConfig} runtimeConfig
 */
export function applyAuthElementAttributes(runtimeConfig) {
  if (!runtimeConfig || !runtimeConfig.auth || !runtimeConfig.authButton) {
    throw new Error("Runtime auth configuration is required");
  }
  const authConfig = runtimeConfig.auth;
  const authButtonConfig = runtimeConfig.authButton;
  const loginButton = document.querySelector(LOGIN_BUTTON_SELECTOR);
  if (loginButton instanceof HTMLElement) {
    setAttributeValue(loginButton, "site-id", authConfig.googleClientId);
    setAttributeValue(loginButton, "tauth-tenant-id", authConfig.tenantId);
    setAttributeValue(loginButton, "tauth-login-path", authConfig.loginPath);
    setAttributeValue(loginButton, "tauth-logout-path", authConfig.logoutPath);
    setAttributeValue(loginButton, "tauth-nonce-path", authConfig.noncePath);
    setAttributeValue(loginButton, "tauth-url", authConfig.tauthUrl);
    setAttributeValue(loginButton, "button-text", authButtonConfig.text);
    setAttributeValue(loginButton, "button-size", authButtonConfig.size);
    setAttributeValue(loginButton, "button-theme", authButtonConfig.theme);
  }

  const userMenu = document.querySelector(USER_MENU_SELECTOR);
  if (userMenu instanceof HTMLElement) {
    setAttributeValue(userMenu, "display-mode", USER_MENU_DISPLAY_MODE);
    setAttributeValue(userMenu, "logout-url", PATHS.logoutRedirect);
    setAttributeValue(userMenu, "logout-label", STRINGS.signOutLabel);
    setAttributeValue(userMenu, "tauth-tenant-id", authConfig.tenantId);
  }
}
