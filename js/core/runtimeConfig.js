// @ts-check

const CONFIG_URL = "/config.json";
const CONFIG_SCOPE_AUTH = "auth";
const CONFIG_SCOPE_BUTTON = "authButton";

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * @param {Record<string, unknown>} source
 * @param {string} key
 * @param {string} scope
 * @returns {string}
 */
function requireString(source, key, scope) {
  const raw = source[key];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`config.json missing ${scope}.${key}`);
  }
  return raw.trim();
}

/**
 * @param {Record<string, unknown>} source
 * @param {string} key
 * @returns {Record<string, unknown>}
 */
function requireObject(source, key) {
  const value = source[key];
  if (!isPlainObject(value)) {
    throw new Error(`config.json missing ${key} section`);
  }
  return value;
}

/**
 * @returns {Promise<RuntimeConfig>}
 */
export async function loadRuntimeConfig() {
  const response = await fetch(CONFIG_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`config.json request failed (${response.status})`);
  }
  const payload = await response.json();
  if (!isPlainObject(payload)) {
    throw new Error("config.json must be an object");
  }

  const authPayload = requireObject(payload, CONFIG_SCOPE_AUTH);
  const buttonPayload = requireObject(payload, CONFIG_SCOPE_BUTTON);

  const authConfig = Object.freeze({
    tauthUrl: requireString(authPayload, "tauthUrl", CONFIG_SCOPE_AUTH),
    googleClientId: requireString(authPayload, "googleClientId", CONFIG_SCOPE_AUTH),
    tenantId: requireString(authPayload, "tenantId", CONFIG_SCOPE_AUTH),
    loginPath: requireString(authPayload, "loginPath", CONFIG_SCOPE_AUTH),
    logoutPath: requireString(authPayload, "logoutPath", CONFIG_SCOPE_AUTH),
    noncePath: requireString(authPayload, "noncePath", CONFIG_SCOPE_AUTH)
  });

  const authButtonConfig = Object.freeze({
    text: requireString(buttonPayload, "text", CONFIG_SCOPE_BUTTON),
    size: requireString(buttonPayload, "size", CONFIG_SCOPE_BUTTON),
    theme: requireString(buttonPayload, "theme", CONFIG_SCOPE_BUTTON)
  });

  return Object.freeze({
    auth: authConfig,
    authButton: authButtonConfig
  });
}
