// @ts-check

import { load as parseYaml } from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs";

const CONFIG_URL = "/config.yaml";

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
export async function loadConfigPayload() {
  const response = await fetch(CONFIG_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`config.yaml request failed (${response.status})`);
  }
  const content = await response.text();
  const parsed = parseYaml(content);
  if (!isPlainObject(parsed)) {
    throw new Error("config.yaml must be an object");
  }
  return parsed;
}
