// @ts-check

const ESCAPE_PATTERN = /[^\w-]/gu;

/**
 * @param {string} identifier
 * @returns {string}
 */
export function escapeIdentifier(identifier) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(identifier);
  }
  return identifier.replace(ESCAPE_PATTERN, (character) => `\\${character}`);
}
