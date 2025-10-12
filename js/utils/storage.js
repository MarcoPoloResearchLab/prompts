// @ts-check

/**
 * @template T
 * @param {string} key
 * @param {T} fallbackValue
 * @returns {T}
 */
export function loadJson(key, fallbackValue) {
  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) {
      return fallbackValue;
    }
    const parsedValue = JSON.parse(storedValue);
    return parsedValue;
  } catch {
    return fallbackValue;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {void}
 */
export function saveJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Intentionally ignore storage errors (quota, privacy mode, etc.)
  }
}

/**
 * @param {string} key
 * @returns {string | null}
 */
export function loadString(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {string} value
 * @returns {void}
 */
export function saveString(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures
  }
}
