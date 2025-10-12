// @ts-check

const PLACEHOLDER_PATTERN = /\{([^}]+)\}/gu;

/**
 * @param {string} rawText
 * @returns {DocumentFragment}
 */
export function createPlaceholderFragment(rawText) {
  PLACEHOLDER_PATTERN.lastIndex = 0;
  const fragment = document.createDocumentFragment();
  let cursorIndex = 0;
  let matchResult = PLACEHOLDER_PATTERN.exec(rawText);
  while (matchResult) {
    const precedingSegment = rawText.slice(cursorIndex, matchResult.index);
    if (precedingSegment) {
      fragment.appendChild(document.createTextNode(precedingSegment));
    }
    const placeholderName = matchResult[1];
    const placeholderInput = document.createElement("input");
    placeholderInput.className = "placeholder-input";
    placeholderInput.dataset.placeholder = placeholderName;
    placeholderInput.placeholder = placeholderName;
    placeholderInput.size = Math.max(placeholderName.length, 8);
    fragment.appendChild(placeholderInput);
    cursorIndex = PLACEHOLDER_PATTERN.lastIndex;
    matchResult = PLACEHOLDER_PATTERN.exec(rawText);
  }
  const trailingSegment = rawText.slice(cursorIndex);
  if (trailingSegment) {
    fragment.appendChild(document.createTextNode(trailingSegment));
  }
  return fragment;
}

/**
 * @param {HTMLElement} textElement
 * @returns {string}
 */
export function resolvePlaceholderText(textElement) {
  const clonedElement = textElement.cloneNode(true);
  const placeholders = clonedElement.querySelectorAll("[data-placeholder]");
  placeholders.forEach((element) => {
    const inputElement = /** @type {HTMLInputElement} */ (element);
    const placeholderName = inputElement.dataset.placeholder ?? "";
    const userValue = inputElement.value || placeholderName;
    inputElement.replaceWith(document.createTextNode(userValue));
  });
  return clonedElement.textContent ?? "";
}
