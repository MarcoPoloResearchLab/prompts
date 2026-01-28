// @ts-check

const AUTH_HEADER_SELECTOR = "[data-role=\"auth-header\"]";
const AUTH_LOGIN_SELECTOR = "mpr-login-button[data-test=\"auth-login\"]";
const AUTH_LOGIN_TAG = "mpr-login-button";
const AUTH_LOGIN_TEST_ATTRIBUTE = "data-test";
const AUTH_LOGIN_TEST_VALUE = "auth-login";
const AUTH_USER_SELECTOR = "mpr-user";
const AUTH_SITE_ID_ATTRIBUTE = "site-id";
const AUTH_TENANT_ID_ATTRIBUTE = "tauth-tenant-id";
const AUTH_LOGIN_PATH_ATTRIBUTE = "tauth-login-path";
const AUTH_LOGOUT_PATH_ATTRIBUTE = "tauth-logout-path";
const AUTH_NONCE_PATH_ATTRIBUTE = "tauth-nonce-path";
const AUTH_TAUTH_URL_ATTRIBUTE = "tauth-url";
const AUTH_BUTTON_TEXT_ATTRIBUTE = "button-text";
const AUTH_BUTTON_SIZE_ATTRIBUTE = "button-size";
const AUTH_BUTTON_THEME_ATTRIBUTE = "button-theme";
const AUTH_BUTTON_SHAPE_ATTRIBUTE = "button-shape";

/**
 * @param {Element | null} element
 * @param {string} attributeName
 * @param {string} attributeValue
 */
function setRequiredAttribute(element, attributeName, attributeValue) {
  if (!(element instanceof Element)) {
    return;
  }
  element.setAttribute(attributeName, attributeValue);
}

/**
 * @param {Element | null} element
 * @param {string} attributeName
 * @param {string | null | undefined} attributeValue
 */
function setOptionalAttribute(element, attributeName, attributeValue) {
  if (!(element instanceof Element)) {
    return;
  }
  if (attributeValue === null || attributeValue === undefined) {
    return;
  }
  const normalized = String(attributeValue).trim();
  if (!normalized) {
    return;
  }
  element.setAttribute(attributeName, normalized);
}

/**
 * @param {MprUiAuthConfig} authConfig
 * @param {MprUiAuthButtonConfig} authButtonConfig
 * @param {Element} loginButton
 */
function applyAuthConfigToLoginButton(authConfig, authButtonConfig, loginButton) {
  if (!authConfig) {
    throw new Error("Auth config is required to configure the login button");
  }
  if (!authButtonConfig) {
    throw new Error("Auth button config is required to configure the login button");
  }
  setRequiredAttribute(loginButton, AUTH_SITE_ID_ATTRIBUTE, authConfig.googleClientId);
  setRequiredAttribute(loginButton, AUTH_TENANT_ID_ATTRIBUTE, authConfig.tenantId);
  setRequiredAttribute(loginButton, AUTH_LOGIN_PATH_ATTRIBUTE, authConfig.loginPath);
  setRequiredAttribute(loginButton, AUTH_LOGOUT_PATH_ATTRIBUTE, authConfig.logoutPath);
  setRequiredAttribute(loginButton, AUTH_NONCE_PATH_ATTRIBUTE, authConfig.noncePath);
  setOptionalAttribute(loginButton, AUTH_TAUTH_URL_ATTRIBUTE, authConfig.tauthUrl);
  setRequiredAttribute(loginButton, AUTH_BUTTON_TEXT_ATTRIBUTE, authButtonConfig.text);
  setRequiredAttribute(loginButton, AUTH_BUTTON_SIZE_ATTRIBUTE, authButtonConfig.size);
  setRequiredAttribute(loginButton, AUTH_BUTTON_THEME_ATTRIBUTE, authButtonConfig.theme);
  if (authButtonConfig.shape) {
    setOptionalAttribute(loginButton, AUTH_BUTTON_SHAPE_ATTRIBUTE, authButtonConfig.shape);
  }
}

/**
 * @returns {HTMLElement | null}
 */
function resolveAuthHeader() {
  const header = document.querySelector(AUTH_HEADER_SELECTOR);
  return header instanceof HTMLElement ? header : null;
}

/**
 * @returns {HTMLElement | null}
 */
export function removeAuthLoginButton() {
  const loginButton = document.querySelector(AUTH_LOGIN_SELECTOR);
  if (loginButton instanceof HTMLElement) {
    loginButton.remove();
    return loginButton;
  }
  return null;
}

/**
 * @param {MprUiAuthConfig} authConfig
 * @param {MprUiAuthButtonConfig} authButtonConfig
 * @returns {HTMLElement}
 */
export function ensureAuthLoginButton(authConfig, authButtonConfig) {
  const header = resolveAuthHeader();
  if (!header) {
    throw new Error("Auth header element is required to mount the login button");
  }
  const existing = header.querySelector(AUTH_LOGIN_SELECTOR);
  if (existing instanceof HTMLElement) {
    applyAuthConfigToLoginButton(authConfig, authButtonConfig, existing);
    return existing;
  }
  const loginButton = document.createElement(AUTH_LOGIN_TAG);
  loginButton.setAttribute(AUTH_LOGIN_TEST_ATTRIBUTE, AUTH_LOGIN_TEST_VALUE);
  applyAuthConfigToLoginButton(authConfig, authButtonConfig, loginButton);
  const userMenu = header.querySelector(AUTH_USER_SELECTOR);
  if (userMenu instanceof HTMLElement) {
    header.insertBefore(loginButton, userMenu);
  } else {
    header.appendChild(loginButton);
  }
  return loginButton;
}
