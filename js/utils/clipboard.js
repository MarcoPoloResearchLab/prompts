// @ts-check

import { sanitizeLineEndings } from "./string.js";

/**
 * @param {string} textContent
 * @returns {Promise<void>}
 */
export async function writeText(textContent) {
  const sanitizedContent = sanitizeLineEndings(textContent);
  try {
    await navigator.clipboard.writeText(sanitizedContent);
    return;
  } catch {
    fallbackCopy(sanitizedContent);
  }
}

/**
 * @param {string} url
 * @returns {Promise<void>}
 */
export async function writeUrl(url) {
  try {
    await navigator.clipboard.writeText(url);
    return;
  } catch {
    fallbackCopy(url);
  }
}

/**
 * @param {string} value
 * @returns {void}
 */
function fallbackCopy(value) {
  const temporaryArea = document.createElement("textarea");
  temporaryArea.value = value;
  temporaryArea.style.position = "fixed";
  temporaryArea.style.top = "-9999px";
  temporaryArea.setAttribute("aria-hidden", "true");
  document.body.appendChild(temporaryArea);
  temporaryArea.select();
  document.execCommand("copy");
  temporaryArea.remove();
}
