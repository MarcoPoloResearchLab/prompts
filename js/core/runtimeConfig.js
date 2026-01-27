// @ts-check

const CONFIG_URL = "/config.json";
const CONFIG_SCOPE_AUTH = "auth";
const CONFIG_SCOPE_BUTTON = "authButton";
const CONFIG_SCOPE_ENVIRONMENTS = "environments";
const CONFIG_SCOPE_ORIGINS = "origins";
const CONFIG_SCOPE_ORIGIN_PREFIXES = "originPrefixes";
const CONFIG_SCOPE_HOSTNAMES = "hostnames";

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
 * @param {Record<string, unknown>} source
 * @param {string} key
 * @returns {string[]}
 */
function readStringArray(source, key) {
  const raw = source[key];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
}

/**
 * @param {unknown} value
 * @returns {Record<string, unknown>[]}
 */
function requireEnvironmentArray(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("config.json missing environments");
  }
  return value.map((entry, index) => {
    if (!isPlainObject(entry)) {
      throw new Error(`config.json environment at index ${index} must be an object`);
    }
    return entry;
  });
}

/**
 * @param {Record<string, unknown>} environment
 * @param {string} runtimeOrigin
 * @param {string} runtimeHostname
 * @returns {boolean}
 */
function matchesEnvironment(environment, runtimeOrigin, runtimeHostname) {
  const origins = readStringArray(environment, CONFIG_SCOPE_ORIGINS);
  const originPrefixes = readStringArray(environment, CONFIG_SCOPE_ORIGIN_PREFIXES);
  const hostnames = readStringArray(environment, CONFIG_SCOPE_HOSTNAMES);
  if (origins.length === 0 && originPrefixes.length === 0 && hostnames.length === 0) {
    throw new Error("config.json environment missing origins/hostnames");
  }
  if (origins.includes(runtimeOrigin)) {
    return true;
  }
  if (hostnames.includes(runtimeHostname)) {
    return true;
  }
  return originPrefixes.some((prefix) => runtimeOrigin.startsWith(prefix));
}

/**
 * @returns {{ origin: string, hostname: string }}
 */
function requireRuntimeLocation() {
  if (typeof window === "undefined" || !window.location) {
    throw new Error("window.location is unavailable for config selection");
  }
  const { origin, hostname } = window.location;
  if (typeof origin !== "string" || origin.trim().length === 0) {
    throw new Error("window.location.origin is required for config selection");
  }
  if (typeof hostname !== "string" || hostname.trim().length === 0) {
    throw new Error("window.location.hostname is required for config selection");
  }
  return { origin, hostname };
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

  const environments = requireEnvironmentArray(payload[CONFIG_SCOPE_ENVIRONMENTS]);
  const runtimeLocation = requireRuntimeLocation();
  const matching = environments.filter((environment) =>
    matchesEnvironment(environment, runtimeLocation.origin, runtimeLocation.hostname)
  );
  if (matching.length === 0) {
    throw new Error(`config.json has no environment for origin ${runtimeLocation.origin}`);
  }
  if (matching.length > 1) {
    throw new Error(`config.json has multiple environments for origin ${runtimeLocation.origin}`);
  }
  const selected = matching[0];

  const authPayload = requireObject(selected, CONFIG_SCOPE_AUTH);
  const buttonPayload = requireObject(selected, CONFIG_SCOPE_BUTTON);

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
