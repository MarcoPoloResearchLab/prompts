// @ts-check

/**
 * @param {string} value
 * @returns {string}
 */
export function sanitizeLineEndings(value) {
  return value.replace(/\r/g, "");
}

/**
 * @param {string} value
 * @returns {string}
 */
export function normalizeWhitespace(value) {
  return value.trim().toLowerCase();
}
