// @ts-check
import { assertDeepEqual, assertEqual } from "../assert.js";

const WAIT_AFTER_INTERACTION_MS = 180;
const SEARCH_INPUT_SELECTOR = "[data-test='search-input']";
const CHIP_SELECTOR = "[data-test='tag-chip']";
const CARD_SELECTOR = "[data-test='prompt-card']";
const COPY_BUTTON_SELECTOR = "[data-test='copy-button']";
const COPY_BUTTON_LABEL_SELECTOR = "[data-test='copy-button'] span:last-of-type";
const SHARE_BUTTON_SELECTOR = "[data-test='share-button']";
const SHARE_BUTTON_LABEL_SELECTOR = "[data-test='share-button'] span:last-of-type";
const FILTER_BAR_SELECTOR = "#chipBar";
const LIKE_BUTTON_SELECTOR = "[data-test='like-button']";
const LIKE_COUNT_SELECTOR = "[data-role='like-count']";
const PRIVACY_LINK_SELECTOR = "[data-role='privacy-link']";
const PRIVACY_ARTICLE_SELECTOR = "[data-role='privacy-article']";
const FOOTER_PREFIX_SELECTOR = "[data-role='footer-prefix']";
const FOOTER_PROJECTS_TOGGLE_SELECTOR = "[data-role='footer-projects-toggle']";
const FOOTER_PROJECTS_MENU_SELECTOR = "[data-role='footer-projects-menu']";
const FOOTER_PROJECT_ITEM_SELECTOR = "[data-role='footer-projects-item']";
const PRIVACY_LINK_TEXT = "Privacy • Terms";
const PRIVACY_HEADING_TEXT = "Privacy Policy — Prompt Bubbles";
const PRIVACY_ROBOTS_META = "noindex,nofollow";
const APP_FLOWS_SPEC_IDENTIFIER = "specs/app-flows.spec.mjs";
const GLOBAL_TOAST_SELECTOR = "[data-test='global-toast']";
const APP_ROOT_SELECTOR = "[x-data$='AppShell()']";
const CLEAR_BUTTON_SELECTOR = "[data-test='clear-search']";
const CLEAR_BUTTON_LABEL = "Clear search";
const BRAND_ACCENT_COLOR = "#1976d2";
const CARD_FEEDBACK_SELECTOR = "[data-test='card-feedback']";
const COPY_FEEDBACK_MESSAGE = "Prompt copied \u2713";
const SHARE_FEEDBACK_MESSAGE = "Link copied \u2713";
const THEME_TOGGLE_SELECTOR = "#themeToggle";
const MIN_SEARCH_ADDON_PADDING_PX = 24;
const MIN_SEARCH_PLACEHOLDER_INSET_PX = 20;
const MAX_THEME_ALIGNMENT_DELTA_PX = 2;
const SHARE_ICON_LIGHT_COLOR = "rgb(13, 34, 71)";
const SHARE_ICON_DARK_COLOR = "rgb(217, 230, 255)";
const COLOR_COMPONENT_TOLERANCE = 1;
const STICKY_DELTA_TOLERANCE_PX = 2;
const FILTER_CHIP_MAX_RADIUS_PX = 12;
const FILTER_NAV_GAP_TOLERANCE_PX = 1;
const FILTER_OVERFLOW_TOLERANCE_PX = 0.75;
const FILTER_FONT_MAX_PX = 13.6;
const FILTER_FONT_DELTA_TOLERANCE_PX = 0.65;
const LIKE_ICON_TEXT = "bubble_chart";
const LIKE_LABEL_PREFIX = "Toggle like for";
const LIKE_COUNT_LABEL_PREFIX = "Current likes:";
const BRAND_TAGLINE_TEXT = "Built for instant prompt workflows.";
const FOOTER_SHORTCUT_TEXT = "Press / to search • Enter to copy the focused card";
const FOOTER_MENU_LABEL = "Built By Marco Polo Research Lab";
const FOOTER_MENU_TOGGLE_ARIA_LABEL = "Browse Marco Polo Research Lab projects";
const FOOTER_PROJECT_LINKS = Object.freeze([
  { label: "Marco Polo Research Lab", url: "https://mprlab.com" },
  { label: "Gravity Notes", url: "https://gravity.mprlab.com" },
  { label: "LoopAware", url: "https://loopaware.mprlab.com" },
  { label: "Allergy Wheel", url: "https://allergy.mprlab.com" },
  { label: "Social Threader", url: "https://threader.mprlab.com" },
  { label: "RSVP", url: "https://rsvp.mprlab.com" },
  { label: "Countdown Calendar", url: "https://countdown.mprlab.com" },
  { label: "LLM Crossword", url: "https://llm-crossword.mprlab.com" },
  { label: "Prompt Bubbles", url: "https://prompts.mprlab.com" },
  { label: "Wallpapers", url: "https://wallpapers.mprlab.com" }
]);
const BUBBLE_LAYER_SELECTOR = "[data-role='bubble-layer']";
const BUBBLE_SELECTOR = "[data-role='bubble']";
const BUBBLE_BORDER_LIGHT = "rgba(25, 118, 210, 0.35)";
const BUBBLE_BORDER_DARK = "rgba(217, 230, 255, 0.45)";
const BUBBLE_SIZE_RATIO = 0.25;
const BUBBLE_SIZE_TOLERANCE = 0.06;
const BUBBLE_LIFETIME_MS = 1700;
const BUBBLE_REMOVAL_GRACE_MS = 220;
const BUBBLE_RISE_DISTANCE_TOLERANCE_PX = 4;
const BUBBLE_FINAL_ALIGNMENT_TOLERANCE_PX = 1.5;
const BUBBLE_LINEAR_EXPECTED_KEYFRAMES = 2;
const EMPTY_STATE_LIGHT_BACKGROUND = "rgb(232, 240, 255)";
const EMPTY_STATE_LIGHT_TEXT = "rgb(13, 34, 71)";
const EMPTY_STATE_DARK_BACKGROUND = "rgb(26, 44, 92)";
const EMPTY_STATE_DARK_TEXT = "rgb(217, 230, 255)";
const PLACEHOLDER_OVERFLOW_TOLERANCE_PX = 1.5;
const calculateUsedBytes = (sourceLength, ranges) => {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return 0;
  }
  const normalizedRanges = ranges
    .map((range) => {
      const rawStart = Number.parseFloat(String(range?.start ?? range?.offset ?? 0));
      const rawEnd = Number.parseFloat(String(range?.end ?? range?.offsetEnd ?? 0));
      if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) {
        return null;
      }
      const start = Math.max(0, Math.min(sourceLength, Math.floor(rawStart)));
      const end = Math.max(0, Math.min(sourceLength, Math.ceil(rawEnd)));
      return end > start ? { start, end } : null;
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (!left || !right) {
        return 0;
      }
      return left.start - right.start;
    });
  if (normalizedRanges.length === 0) {
    return 0;
  }
  let used = 0;
  let currentStart = normalizedRanges[0]?.start ?? 0;
  let currentEnd = normalizedRanges[0]?.end ?? 0;
  for (let index = 1; index < normalizedRanges.length; index += 1) {
    const range = normalizedRanges[index];
    if (!range) {
      continue;
    }
    if (range.start <= currentEnd) {
      currentEnd = Math.max(currentEnd, range.end);
      continue;
    }
    used += currentEnd - currentStart;
    currentStart = range.start;
    currentEnd = range.end;
  }
  used += currentEnd - currentStart;
  return used;
};

const summarizeCoverageEntries = (entries) => {
  let totalBytes = 0;
  let usedBytes = 0;
  for (const entry of entries ?? []) {
    const source = typeof entry?.text === "string" ? entry.text : "";
    const ranges = Array.isArray(entry?.ranges) ? entry.ranges : [];
    const entryTotal = source.length;
    totalBytes += entryTotal;
    usedBytes += calculateUsedBytes(entryTotal, ranges);
  }
  const percent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
  return {
    totalBytes,
    usedBytes,
    percent
  };
};

const normalizeToRgb = (value) => {
  if (typeof value !== "string") {
    return String(value ?? "");
  }
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) {
    return value.trim();
  }
  const components = match[1]
    .split(",")
    .slice(0, 3)
    .map((component) => {
      const parsed = Number.parseFloat(component.trim());
      return Number.isFinite(parsed) ? Math.round(parsed) : 0;
    });
  return `rgb(${components.join(", ")})`;
};

const delay = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const waitForCardIds = (page, expectedIds) =>
  page.waitForFunction(
    (selector, ids) => {
      const cardElements = Array.from(document.querySelectorAll(selector));
      const cardIds = cardElements.map((element) => element.id);
      return (
        cardIds.length === ids.length &&
        cardIds.every((id, index) => id === ids[index])
      );
    },
    {},
    CARD_SELECTOR,
    expectedIds
  );

const waitForCardCount = (page, expectedCount) =>
  page.waitForFunction(
    (selector, count) => document.querySelectorAll(selector).length === count,
    {},
    CARD_SELECTOR,
    expectedCount
  );

const waitForActiveChip = (page, label) =>
  page.waitForFunction(
    (selector, targetLabel) =>
      Array.from(document.querySelectorAll(`${selector}[data-active='true']`)).some(
        (element) => element.textContent?.trim().toLowerCase() === targetLabel.toLowerCase()
      ),
    {},
    CHIP_SELECTOR,
    label
  );

const waitForLinkedCard = (page, cardId) =>
  page.waitForFunction(
    (selector, id) => {
      const card = document.querySelector(`${selector}#${id}`);
      return card?.getAttribute("data-linked-card") === "true";
    },
    {},
    CARD_SELECTOR,
    cardId
  );

const waitForCardFeedback = (page, cardId, expectedMessage) =>
  page.waitForFunction(
    (cardSelector, feedbackSelector, id, message) => {
      const card = document.querySelector(`${cardSelector}#${CSS.escape(id)}`);
      if (!card) {
        return false;
      }
      const feedback = card.querySelector(feedbackSelector);
      if (!feedback) {
        return false;
      }
      return feedback.textContent?.trim() === message;
    },
    {},
    CARD_SELECTOR,
    CARD_FEEDBACK_SELECTOR,
    cardId,
    expectedMessage
  );

const waitForThemeMode = (page, expectedMode) =>
  page.waitForFunction(
    (mode) => document.documentElement.getAttribute("data-bs-theme") === mode,
    {},
    expectedMode
  );

const captureThemeSnapshot = (page) =>
  page.evaluate(() => {
    const bodyStyles = getComputedStyle(document.body);
    const topNav = document.querySelector("nav.navbar.fixed-top");
    const searchAddon = document.querySelector("[data-role='search-addon']");
    const searchInput = document.querySelector("[data-test='search-input']");
    const tagBadge = document.querySelector("[data-role='card-tag']");
    const shareIcon = document.querySelector("[data-role='share-icon']");
    const shareButton = document.querySelector("[data-test='share-button']");
    const copyButton = document.querySelector("[data-test='copy-button']");
    const shareLabel = shareButton?.querySelector("span:last-of-type") ?? null;
    const copyLabel = copyButton?.querySelector("span:last-of-type") ?? null;
    return {
      bodyBackgroundImage: bodyStyles.getPropertyValue("background-image"),
      topNavBackgroundColor: topNav ? getComputedStyle(topNav).getPropertyValue("background-color") : "",
      addonBackgroundColor: searchAddon ? getComputedStyle(searchAddon).getPropertyValue("background-color") : "",
      addonColor: searchAddon ? getComputedStyle(searchAddon).getPropertyValue("color") : "",
      addonPaddingLeft: searchAddon ? getComputedStyle(searchAddon).getPropertyValue("padding-left") : "",
      addonPaddingRight: searchAddon ? getComputedStyle(searchAddon).getPropertyValue("padding-right") : "",
      inputBackgroundColor: searchInput ? getComputedStyle(searchInput).getPropertyValue("background-color") : "",
      inputPaddingLeft: searchInput ? getComputedStyle(searchInput).getPropertyValue("padding-left") : "",
      tagBackgroundColor: tagBadge ? getComputedStyle(tagBadge).getPropertyValue("background-color") : "",
      tagColor: tagBadge ? getComputedStyle(tagBadge).getPropertyValue("color") : "",
      shareIconColor: shareIcon ? getComputedStyle(shareIcon).getPropertyValue("color") : "",
      shareButtonColor: shareLabel ? getComputedStyle(shareLabel).getPropertyValue("color") : "",
      copyButtonColor: copyLabel ? getComputedStyle(copyLabel).getPropertyValue("color") : "",
      shareButtonBorderColor: shareButton ? getComputedStyle(shareButton).getPropertyValue("border-color") : "",
      copyButtonBorderColor: copyButton ? getComputedStyle(copyButton).getPropertyValue("border-color") : ""
    };
  });
const parsePixels = (value) => Number.parseFloat(String(value).replace("px", "")) || 0;
const parseRgbComponents = (value) =>
  String(value)
    .replace(/rgba?\(/i, "")
    .replace(/\)/g, "")
    .split(",")
    .map((component) => Number.parseFloat(component.trim()))
    .filter((component) => Number.isFinite(component));
const colorsAreClose = (actual, expected) => {
  const actualComponents = parseRgbComponents(actual);
  const expectedComponents = parseRgbComponents(expected);
  if (actualComponents.length < 3 || expectedComponents.length < 3) {
    return false;
  }
  return [0, 1, 2].every((index) =>
    Math.abs(actualComponents[index] - expectedComponents[index]) <= COLOR_COMPONENT_TOLERANCE
  );
};
const formatNumber = (value) => (Number.isFinite(value) ? value.toFixed(2) : "NaN");

const stubClipboard = async (page) => {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, "__copiedText", {
      configurable: true,
      enumerable: false,
      value: "",
      writable: true
    });
    const clipboard = {
      async writeText(value) {
        window.__copiedText = value;
      }
    };
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      enumerable: false,
      get() {
        return clipboard;
      }
    });
  });
};

const clearSearch = async (page) => {
  await page.evaluate((selector) => {
    const searchInput = document.querySelector(selector);
    if (!searchInput) throw new Error("Search input missing");
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  }, SEARCH_INPUT_SELECTOR);
  await delay(WAIT_AFTER_INTERACTION_MS);
};

const setSearchValue = async (page, value) => {
  await page.evaluate((selector, nextValue) => {
    const searchInput = document.querySelector(selector);
    if (!searchInput) throw new Error("Search input missing");
    searchInput.value = nextValue;
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  }, SEARCH_INPUT_SELECTOR, value);
  await delay(WAIT_AFTER_INTERACTION_MS);
};

const clickChipByLabel = async (page, label) => {
  const didClick = await page.evaluate(
    (chipSelector, targetLabel) => {
      const chip = Array.from(document.querySelectorAll(chipSelector)).find(
        (element) => element.textContent?.trim().toLowerCase() === targetLabel.toLowerCase()
      );
      if (!chip) return false;
      chip.click();
      return true;
    },
    CHIP_SELECTOR,
    label
  );
  if (!didClick) {
    throw new Error(`Chip "${label}" not found`);
  }
  await delay(WAIT_AFTER_INTERACTION_MS);
};

const getVisibleCardIds = (page) =>
  page.$$eval(CARD_SELECTOR, (elements) => elements.map((element) => element.id));

const clickCardButton = async (page, cardId, type) => {
  const selector = type === "copy" ? COPY_BUTTON_SELECTOR : SHARE_BUTTON_SELECTOR;
  const didClick = await page.evaluate(
    (id, buttonSelector) => {
      const card = document.getElementById(id);
      if (!card) {
        return false;
      }
      const button = card.querySelector(buttonSelector);
      if (!button) {
        return false;
      }
      button.click();
      return true;
    },
    cardId,
    selector
  );
  if (!didClick) {
    throw new Error(`Button "${type}" not found on card ${cardId}`);
  }
  await delay(WAIT_AFTER_INTERACTION_MS);
};

const clickLikeButton = async (page, cardId) => {
  const didClick = await page.evaluate(
    (cardSelector, buttonSelector, identifier) => {
      const card = document.querySelector(`${cardSelector}#${CSS.escape(identifier)}`);
      if (!card) {
        return false;
      }
      const button = card.querySelector(buttonSelector);
      if (!(button instanceof HTMLButtonElement)) {
        return false;
      }
      button.click();
      return true;
    },
    CARD_SELECTOR,
    LIKE_BUTTON_SELECTOR,
    cardId
  );
  if (!didClick) {
    throw new Error(`Like button missing on card ${cardId}`);
  }
  await delay(WAIT_AFTER_INTERACTION_MS);
};

const waitForLikeCount = (page, cardId, expectedCount) =>
  page.waitForFunction(
    (cardSelector, buttonSelector, countSelector, identifier, targetCount) => {
      const card = document.querySelector(`${cardSelector}#${CSS.escape(identifier)}`);
      if (!card) {
        return false;
      }
      const button = card.querySelector(buttonSelector);
      if (!button) {
        return false;
      }
      const countElement = button.querySelector(countSelector);
      if (!countElement) {
        return false;
      }
      const countText = countElement.textContent?.trim() ?? "";
      const parsedCount = Number.parseInt(countText, 10);
      if (!Number.isFinite(parsedCount)) {
        return false;
      }
      return parsedCount === targetCount;
    },
    {},
    CARD_SELECTOR,
    LIKE_BUTTON_SELECTOR,
    LIKE_COUNT_SELECTOR,
    cardId,
    expectedCount
  );

const getCardLikeSnapshot = (page, cardId) =>
  page.evaluate(
    (cardSelector, buttonSelector, countSelector, identifier) => {
      const card = document.querySelector(`${cardSelector}#${CSS.escape(identifier)}`);
      if (!card) {
        throw new Error(`Card ${identifier} not found for like snapshot`);
      }
      const button = card.querySelector(buttonSelector);
      if (!button) {
        throw new Error("Like button missing for snapshot");
      }
      const countElement = button.querySelector(countSelector);
      const iconElement = button.querySelector(".material-icons-outlined");
      const countText = countElement?.textContent?.trim() ?? "";
      const parsedCount = Number.parseInt(countText, 10);
      return {
        count: parsedCount,
        pressed: button.getAttribute("aria-pressed") ?? "",
        label: button.getAttribute("aria-label") ?? "",
        iconText: iconElement?.textContent?.trim() ?? ""
      };
    },
    CARD_SELECTOR,
    LIKE_BUTTON_SELECTOR,
    LIKE_COUNT_SELECTOR,
    cardId
  );

const getCardButtonOrder = (page, cardId) =>
  page.evaluate(
    (cardSelector, identifier) => {
      const card = document.querySelector(`${cardSelector}#${CSS.escape(identifier)}`);
      if (!card) {
        return [];
      }
      return Array.from(card.querySelectorAll("[data-test$='button']")).map((element) =>
        element.getAttribute("data-test") ?? ""
      );
    },
    CARD_SELECTOR,
    cardId
  );

const captureElementColor = (page, selector) =>
  page.evaluate((targetSelector) => {
    const element = document.querySelector(targetSelector);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`Element missing for selector ${targetSelector}`);
    }
    const styles = getComputedStyle(element);
    const colorValue = styles.getPropertyValue("color");
    const match = colorValue.match(/rgba?\(([^)]+)\)/i);
    if (!match) {
      return {
        raw: colorValue.trim(),
        alpha: 1
      };
    }
    const components = match[1].split(",").map((component) => component.trim());
    const alphaComponent = components[3] ?? "1";
    return {
      raw: colorValue.trim(),
      alpha: Number.parseFloat(alphaComponent)
    };
  }, selector);

const clickCardSurface = async (page, cardId) => {
  const pointerPosition = await page.evaluate(
    (selector, id) => {
      const card = document.querySelector(`${selector}#${CSS.escape(id)}`);
      if (!card) {
        return null;
      }
      const rect = card.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    },
    CARD_SELECTOR,
    cardId
  );
  if (!pointerPosition) {
    throw new Error(`Card "${cardId}" not found for click interaction`);
  }
  await page.mouse.click(pointerPosition.x, pointerPosition.y);
  await delay(WAIT_AFTER_INTERACTION_MS);
};

const triggerLikeBubble = async (page, cardId) => {
  const pointerPosition = await page.evaluate(
    (cardSelector, buttonSelector, identifier) => {
      const card = document.querySelector(`${cardSelector}#${CSS.escape(identifier)}`);
      if (!card) {
        return null;
      }
      const button = card.querySelector(buttonSelector);
      if (!(button instanceof HTMLElement)) {
        return null;
      }
      const rect = button.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    },
    CARD_SELECTOR,
    LIKE_BUTTON_SELECTOR,
    cardId
  );
  if (!pointerPosition) {
    throw new Error(`Like button missing on card "${cardId}" for bubble trigger`);
  }
  await page.mouse.click(pointerPosition.x, pointerPosition.y);
  await page.waitForFunction(
    (bubbleSelector) => document.querySelector(bubbleSelector) !== null,
    {},
    BUBBLE_SELECTOR
  );
};

const snapshotBubble = (page, cardId) =>
  page.evaluate(
    async (bubbleSelector, cardSelector, id) => {
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      const bubble = document.querySelector(bubbleSelector);
      const card = document.querySelector(`${cardSelector}#${CSS.escape(id)}`);
      if (!bubble || !card) {
        return null;
      }
      const bubbleStyle = getComputedStyle(bubble);
      const cardRect = card.getBoundingClientRect();
      let computedRiseDistance = Number.NaN;
      const bubbleState = window.__lastBubbleState;
      if (bubbleState && typeof bubbleState.riseDistance === "number") {
        computedRiseDistance = bubbleState.riseDistance;
      }
      for (let attempt = 0; attempt < 6 && !Number.isFinite(computedRiseDistance); attempt += 1) {
        const attributeValue = bubble.getAttribute("data-rise-distance");
        if (attributeValue && attributeValue.trim().length > 0) {
          const parsedAttributeValue = Number.parseFloat(attributeValue);
          if (Number.isFinite(parsedAttributeValue)) {
            computedRiseDistance = parsedAttributeValue;
            break;
          }
        }
        const styleValue = getComputedStyle(bubble).getPropertyValue("--app-bubble-rise-distance") ?? "";
        const parsedStyleValue = Number.parseFloat(styleValue);
        if (Number.isFinite(parsedStyleValue)) {
          computedRiseDistance = parsedStyleValue;
          if (parsedStyleValue > 0) {
            break;
          }
        }
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      }
      if (!Number.isFinite(computedRiseDistance)) {
        computedRiseDistance = 0;
      }
      const bubbleRect = bubble.getBoundingClientRect();
      let initialBubbleTop = Number.NaN;
      if (
        bubbleState &&
        typeof bubbleState.y === "number" &&
        typeof bubbleState.size === "number"
      ) {
        initialBubbleTop = bubbleState.y - bubbleState.size / 2;
      }
      if (!Number.isFinite(initialBubbleTop)) {
        const bubbleTopValue = Number.parseFloat(bubbleStyle.top ?? "");
        initialBubbleTop = Number.isFinite(bubbleTopValue) ? bubbleTopValue : bubbleRect.top;
      }
      const expectedRiseDistance = Math.max(0, initialBubbleTop - cardRect.top);
      return {
        theme: bubble.getAttribute("data-theme") ?? "",
        borderColor: bubbleStyle.borderTopColor,
        bubbleWidth: Number.parseFloat(bubbleStyle.width),
        cardWidth: cardRect.width,
        expectedRiseDistance,
        computedRiseDistance
      };
    },
    BUBBLE_SELECTOR,
    CARD_SELECTOR,
    cardId
  );

const captureBubbleAnimationMetadata = (page) =>
  page.evaluate((bubbleSelector) => {
    const bubble = document.querySelector(bubbleSelector);
    if (!bubble) {
      return null;
    }
    const animations = bubble.getAnimations?.();
    if (!Array.isArray(animations) || animations.length === 0) {
      return null;
    }
    const animation = animations[0];
    const effect = animation?.effect;
    const keyframes = typeof effect?.getKeyframes === "function" ? effect.getKeyframes() : [];
    const timing = typeof effect?.getTiming === "function" ? effect.getTiming() : {};
    const computed = typeof effect?.getComputedTiming === "function" ? effect.getComputedTiming() : {};
    const easingValue =
      typeof timing.easing === "string" && timing.easing.trim().length > 0
        ? timing.easing
        : typeof computed.easing === "string" && computed.easing.trim().length > 0
          ? computed.easing
          : "linear";
    return {
      keyframeCount: keyframes.length,
      easing: easingValue
    };
  }, BUBBLE_SELECTOR);

const waitForBubbleRemoval = (page) =>
  page.waitForFunction(
    (bubbleSelector) => document.querySelector(bubbleSelector) === null,
    {},
    BUBBLE_SELECTOR
  );

const waitForToastMessage = (page, expectedSubstring) =>
  page.waitForFunction(
    (rootSelector, toastSelector, text) => {
      const root = document.querySelector(rootSelector);
      const toast = document.querySelector(toastSelector);
      if (!root || !toast) {
        return false;
      }
      const lastToast = root.getAttribute("data-last-toast") ?? "";
      return lastToast.includes(text) && toast.textContent?.includes(text);
    },
    {},
    APP_ROOT_SELECTOR,
    GLOBAL_TOAST_SELECTOR,
    expectedSubstring
  );

const getClipboardText = (page) => page.evaluate(() => window.__copiedText ?? "");

const reloadApp = async (page, baseUrl) => {
  await page.goto("about:blank");
  await page.goto(baseUrl, { waitUntil: "networkidle0" });
  await page.waitForSelector(CARD_SELECTOR);
  await delay(WAIT_AFTER_INTERACTION_MS);
};

const getActiveChipLabels = (page) =>
  page.$$eval(`${CHIP_SELECTOR}[data-active='true']`, (elements) =>
    elements.map((element) => element.textContent?.trim())
  );

const captureEmptyStateSnapshot = (page) =>
  page.evaluate((selector) => {
    const messageElement = document.querySelector(selector);
    if (!messageElement) {
      return null;
    }
    const styles = getComputedStyle(messageElement);
    return {
      text: messageElement.textContent?.trim() ?? "",
      backgroundColor: styles.getPropertyValue("background-color"),
      textColor: styles.getPropertyValue("color")
    };
  }, "[data-test='empty-state']");

const isClearButtonVisible = (page) =>
  page.evaluate((selector) => {
    const button = document.querySelector(selector);
    if (!button) {
      return false;
    }
    const styles = getComputedStyle(button);
    return (
      styles.getPropertyValue("display") !== "none" && styles.getPropertyValue("visibility") !== "hidden"
    );
  }, CLEAR_BUTTON_SELECTOR);

const capturePlaceholderSnapshots = (page) =>
  page.evaluate(() => {
    const inputs = Array.from(
      document.querySelectorAll('[data-role="prompt-text"] [data-placeholder]')
    );
    return inputs
      .map((element) => {
        if (!(element instanceof HTMLElement)) {
          return null;
        }
        const card = element.closest('[data-test="prompt-card"]');
        if (!(card instanceof HTMLElement)) {
          return null;
        }
        const placeholderRect = element.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const overflowBy = Math.max(0, placeholderRect.right - cardRect.right);
        return {
          placeholder: element.getAttribute("data-placeholder") ?? "",
          inputWidth: placeholderRect.width,
          cardWidth: cardRect.width,
          overflowBy
        };
      })
      .filter((snapshot) => snapshot !== null);
  });

const captureGridRowLengths = (page) =>
  page.evaluate((cardSelector) => {
    const cards = Array.from(document.querySelectorAll(cardSelector));
    const rows = [];
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const existingRow = rows.find((row) => Math.abs(row.top - rect.top) < 1);
      if (existingRow) {
        existingRow.count += 1;
      } else {
        rows.push({ top: rect.top, count: 1 });
      }
    }
    return rows.map((row) => row.count);
  }, CARD_SELECTOR);
const captureFilterLayoutSnapshot = (page) =>
  page.evaluate((wrapperSelector, chipContainerSelector, chipSelector) => {
    const nav = document.querySelector("nav.navbar.fixed-top");
    const wrapper = document.querySelector(wrapperSelector);
    const chipContainer = document.querySelector(chipContainerSelector);
    const chips = Array.from(document.querySelectorAll(chipSelector));
    if (!(nav instanceof HTMLElement) || !(wrapper instanceof HTMLElement) || !(chipContainer instanceof HTMLElement)) {
      throw new Error("Filter layout prerequisites missing");
    }
    const navRect = nav.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const containerStyles = window.getComputedStyle(chipContainer);
    const chipRects = chips.map((chip) => chip.getBoundingClientRect());
    const topPositions = new Set(chipRects.map((rect) => rect.top.toFixed(2)));
    let maxBorderRadius = 0;
    let usesButtonClass = false;
    let minFontPx = Number.POSITIVE_INFINITY;
    let maxFontPx = 0;
    for (const chip of chips) {
      if (chip.classList.contains("btn") || chip.classList.contains("btn-outline-primary")) {
        usesButtonClass = true;
      }
      const chipStyles = window.getComputedStyle(chip);
      const radius = Number.parseFloat(chipStyles.getPropertyValue("border-radius"));
      if (Number.isFinite(radius) && radius > maxBorderRadius) {
        maxBorderRadius = radius;
      }
      const fontSize = Number.parseFloat(chipStyles.getPropertyValue("font-size"));
      if (Number.isFinite(fontSize)) {
        if (fontSize < minFontPx) {
          minFontPx = fontSize;
        }
        if (fontSize > maxFontPx) {
          maxFontPx = fontSize;
        }
      }
    }
    if (!Number.isFinite(minFontPx)) {
      minFontPx = 0;
    }
    if (!Number.isFinite(maxFontPx)) {
      maxFontPx = 0;
    }
    return {
      rowCount: topPositions.size,
      navGap: wrapperRect.top - navRect.bottom,
      navHeight: navRect.height,
      overflowDelta: Math.max(0, chipContainer.scrollWidth - chipContainer.clientWidth),
      display: containerStyles.getPropertyValue("display"),
      gridTemplateColumns: containerStyles.getPropertyValue("grid-template-columns"),
      minFontPx,
      maxFontPx,
      maxBorderRadius,
      usesButtonClass
    };
  }, ".app-filter-bar", "#chipBar", CHIP_SELECTOR);
const captureFooterMenuSnapshot = (page) =>
  page.evaluate(
    (toggleSelector, menuSelector, itemSelector) => {
      const container = document.querySelector("[data-role='footer-projects']");
      const toggleElement = document.querySelector(toggleSelector);
      const menuElement = document.querySelector(menuSelector);
      const itemElements = Array.from(document.querySelectorAll(itemSelector));
      const isMenuVisible =
        menuElement instanceof HTMLElement
          ? (() => {
              const styles = window.getComputedStyle(menuElement);
              if (styles.getPropertyValue("display") === "none" || styles.getPropertyValue("visibility") === "hidden") {
                return false;
              }
              const rect = menuElement.getBoundingClientRect();
              return rect.height > 0 && rect.width > 0;
            })()
          : false;
      return {
        containerClasses: container?.className ?? "",
        toggleLabel: toggleElement?.textContent?.trim() ?? "",
        toggleId: toggleElement?.id ?? "",
        toggleAriaExpanded: toggleElement?.getAttribute("aria-expanded") ?? "",
        toggleAriaControls: toggleElement?.getAttribute("aria-controls") ?? "",
        toggleAriaHaspopup: toggleElement?.getAttribute("aria-haspopup") ?? "",
        toggleAriaLabel: toggleElement?.getAttribute("aria-label") ?? "",
        menuId: menuElement?.id ?? "",
        menuRole: menuElement?.getAttribute("role") ?? "",
        menuLabelledBy: menuElement?.getAttribute("aria-labelledby") ?? "",
        menuHasShowClass: menuElement?.classList.contains("show") ?? false,
        menuVisible: isMenuVisible,
        itemSummaries: itemElements.map((element) => ({
          label: element.textContent?.trim() ?? "",
          href: element.getAttribute("href") ?? "",
          target: element.getAttribute("target") ?? "",
          rel: element.getAttribute("rel") ?? ""
        }))
      };
    },
    FOOTER_PROJECTS_TOGGLE_SELECTOR,
    FOOTER_PROJECTS_MENU_SELECTOR,
    FOOTER_PROJECT_ITEM_SELECTOR
  );

const captureFooterLayoutSnapshot = (page) =>
  page.evaluate(() => {
    const container = document.querySelector("nav.navbar.fixed-bottom .container-fluid");
    if (!(container instanceof HTMLElement)) {
      return [];
    }
    return Array.from(container.querySelectorAll("[data-role]")).map((element) => {
      const rect = element.getBoundingClientRect();
      const styles = getComputedStyle(element);
      return {
        role: element.getAttribute("data-role") ?? "",
        left: rect.left,
        fontSize: styles.getPropertyValue("font-size"),
        flexGrow: styles.getPropertyValue("flex-grow")
      };
    });
  });

const createScenarioRunner = (reportScenario) => {
  const hasReporter = reportScenario && typeof reportScenario.start === "function";
  const run = async (description, action) => {
    if (hasReporter) {
      reportScenario.start(description);
    }
    try {
      const result = await action();
      if (hasReporter && typeof reportScenario.pass === "function") {
        reportScenario.pass(description);
      }
      return result;
    } catch (error) {
      if (reportScenario && typeof reportScenario.fail === "function") {
        reportScenario.fail(description, error);
      }
      throw error;
    }
  };
  const runTable = async (groupLabel, scenarios, task) => {
    if (!Array.isArray(scenarios)) {
      return;
    }
    for (const scenario of scenarios) {
      const label =
        typeof scenario?.description === "string" && scenario.description.length > 0
          ? `${groupLabel} :: ${scenario.description}`
          : groupLabel;
      await run(label, () => task(scenario));
    }
  };
  return { run, runTable };
};

export const run = async ({ browser, baseUrl, announceProgress, reportScenario, logs: _logs }) => {
  const page = await browser.newPage();
  await Promise.all([
    page.coverage.startJSCoverage({ resetOnNavigation: false }),
    page.coverage.startCSSCoverage({ resetOnNavigation: false })
  ]);
  if (typeof announceProgress === "function") {
    await announceProgress(page);
  }
  await page.evaluateOnNewDocument(() => {
    window.__PROMPT_BUBBLES_TESTING__ = true;
  });
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await stubClipboard(page);
  await page.goto("about:blank");
  await page.goto(baseUrl, { waitUntil: "networkidle0" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForSelector(CARD_SELECTOR);
  await page.waitForSelector(BUBBLE_LAYER_SELECTOR);

  const runnerProgress = await page.evaluate(() => window.__PROMPT_BUBBLES_RUNNER_PROGRESS ?? []);
  assertEqual(
    Array.isArray(runnerProgress) && runnerProgress.includes(APP_FLOWS_SPEC_IDENTIFIER),
    true,
    "Test runner should announce the active spec name before exercising the UI"
  );
  const scenarioRunner = createScenarioRunner(reportScenario);

  if (reportScenario && typeof reportScenario.start === "function") {
    reportScenario.start("Initial layout validations");
  }
  const faviconMetadata = await page.evaluate(() => {
    const iconLink = document.querySelector("link[rel='icon']");
    const maskLink = document.querySelector("link[rel='mask-icon']");
    return {
      iconHref: iconLink?.getAttribute("href") ?? "",
      iconType: iconLink?.getAttribute("type") ?? "",
      maskHref: maskLink?.getAttribute("href") ?? "",
      maskColor: maskLink?.getAttribute("color") ?? ""
    };
  });
  assertEqual(
    faviconMetadata.iconHref.includes("assets/img/favicon.svg"),
    true,
    "Favicon link should point to the SVG asset"
  );
  assertEqual(faviconMetadata.iconType, "image/svg+xml", "Favicon type should declare SVG");
  assertEqual(
    faviconMetadata.maskHref.includes("assets/img/favicon.svg"),
    true,
    "Mask icon should reuse the SVG asset"
  );
  assertEqual(faviconMetadata.maskColor, BRAND_ACCENT_COLOR, "Mask icon color should align with brand palette");

  const initialCardIds = await getVisibleCardIds(page);
  const adjacentCardId = initialCardIds.find((identifier) => identifier !== "p01") ?? "";
  assertEqual(initialCardIds.length > 0, true, "Initial load should render cards");
  const clearButtonCount = await page.evaluate(
    (selector) => document.querySelectorAll(selector).length,
    CLEAR_BUTTON_SELECTOR
  );
  assertEqual(clearButtonCount, 1, "Search input should render exactly one clear button control");
  const placeholderSnapshots = await capturePlaceholderSnapshots(page);
  assertEqual(
    placeholderSnapshots.length > 0,
    true,
    "Initial render should expose placeholder inputs for measurement"
  );
  const searchInputMetadata = await page.evaluate((selector) => {
    const searchInput = document.querySelector(selector);
    if (!(searchInput instanceof HTMLInputElement)) {
      throw new Error("Search input missing for metadata capture");
    }
    return {
      type: searchInput.type
    };
  }, SEARCH_INPUT_SELECTOR);
  assertEqual(
    searchInputMetadata.type,
    "text",
    "Search input should suppress native cancel affordances by using text type"
  );
  const maxPlaceholderOverflow = placeholderSnapshots.reduce(
    (maximum, snapshot) => Math.max(maximum, snapshot.overflowBy),
    0
  );
  assertEqual(
    maxPlaceholderOverflow <= PLACEHOLDER_OVERFLOW_TOLERANCE_PX,
    true,
    `Placeholder inputs should remain within card boundaries (max overflow ${maxPlaceholderOverflow.toFixed(2)}px)`
  );
  await page.setViewport({ width: 2200, height: 900, deviceScaleFactor: 1 });
  await delay(WAIT_AFTER_INTERACTION_MS);
  const wideGridRows = await captureGridRowLengths(page);
  const wideFirstRowCount = wideGridRows[0] ?? 0;
  assertEqual(
    wideFirstRowCount > 4,
    true,
    `Wide viewport should allow more than four cards per row (rendered ${wideFirstRowCount})`
  );
  const wideInteriorRows = wideGridRows.slice(0, -1);
  if (wideInteriorRows.length > 0) {
    const expectedWideRowSize = wideInteriorRows[0];
    assertEqual(
      wideInteriorRows.every((rowSize) => rowSize === expectedWideRowSize),
      true,
      "Wide viewport interior rows should maintain a consistent column count"
    );
  }
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await delay(WAIT_AFTER_INTERACTION_MS);
  const searchFocusSnapshot = await page.evaluate((selector) => {
    const searchInput = document.querySelector(selector);
    if (!(searchInput instanceof HTMLInputElement)) {
      throw new Error("Search input missing for focus snapshot");
    }
    searchInput.focus();
    searchInput.select();
    const computedStyles = getComputedStyle(searchInput);
    const rootStyles = getComputedStyle(document.documentElement);
    return {
      focusBackground: computedStyles.getPropertyValue("background-color"),
      expectedBackground: rootStyles.getPropertyValue("--app-search-input-bg"),
      darkToken: rootStyles.getPropertyValue("--app-search-addon-bg")
    };
  }, SEARCH_INPUT_SELECTOR);
  const focusBackground = normalizeToRgb(searchFocusSnapshot.focusBackground);
  const expectedLightBackground = normalizeToRgb(searchFocusSnapshot.expectedBackground);
  const darkBackgroundToken = normalizeToRgb(searchFocusSnapshot.darkToken);
  assertEqual(
    colorsAreClose(focusBackground, expectedLightBackground),
    true,
    "Search input should maintain the light theme background token when focused"
  );
  assertEqual(
    colorsAreClose(focusBackground, darkBackgroundToken),
    false,
    "Search input should not adopt the dark theme token while the light theme is active"
  );
  const initialGridRows = await captureGridRowLengths(page);
  assertEqual(initialGridRows.length > 0, true, "Grid should render at least one row of cards");
  const interiorRows = initialGridRows.slice(0, -1);
  if (interiorRows.length > 0) {
    const expectedRowSize = interiorRows[0];
    assertEqual(
      interiorRows.every((rowSize) => rowSize === expectedRowSize),
      true,
      "All interior grid rows should maintain a consistent column count"
    );
  }
  const mediumViewport = { width: 900, height: 900, deviceScaleFactor: 1 };
  const wideViewport = { width: 1600, height: 900, deviceScaleFactor: 1 };
  await page.setViewport(mediumViewport);
  await waitForCardCount(page, initialCardIds.length);
  await delay(WAIT_AFTER_INTERACTION_MS);
  const mediumRows = await captureGridRowLengths(page);
  const mediumMaxColumns = mediumRows.reduce((maximum, count) => Math.max(maximum, count), 0);
  await page.setViewport(wideViewport);
  await waitForCardCount(page, initialCardIds.length);
  await delay(WAIT_AFTER_INTERACTION_MS);
  const wideRows = await captureGridRowLengths(page);
  const wideMaxColumns = wideRows.reduce((maximum, count) => Math.max(maximum, count), 0);
  assertEqual(
    wideMaxColumns >= mediumMaxColumns,
    true,
    "Wider viewports should not reduce the number of cards per row"
  );
  assertEqual(
    wideMaxColumns > mediumMaxColumns,
    true,
    "Wider viewports should increase the number of cards per row when space allows"
  );
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await waitForCardCount(page, initialCardIds.length);
  await delay(WAIT_AFTER_INTERACTION_MS);
  const baseThemeSnapshot = await captureThemeSnapshot(page);
  const addonPaddingLeft = parsePixels(baseThemeSnapshot.addonPaddingLeft);
  const addonPaddingRight = parsePixels(baseThemeSnapshot.addonPaddingRight);
  assertEqual(
    addonPaddingLeft >= MIN_SEARCH_ADDON_PADDING_PX,
    true,
    `Search icon capsule should have at least ${MIN_SEARCH_ADDON_PADDING_PX}px left padding`
  );
  assertEqual(
    addonPaddingRight >= MIN_SEARCH_ADDON_PADDING_PX,
    true,
    `Search icon capsule should have at least ${MIN_SEARCH_ADDON_PADDING_PX}px right padding`
  );
  const inputPaddingLeft = parsePixels(baseThemeSnapshot.inputPaddingLeft);
  assertEqual(
    inputPaddingLeft >= MIN_SEARCH_PLACEHOLDER_INSET_PX,
    true,
    `Search placeholder should start at least ${MIN_SEARCH_PLACEHOLDER_INSET_PX}px from the addon capsule`
  );
  const layoutChecks = await page.evaluate(() => {
    const taglineElement = document.querySelector("[data-role='brand-tagline']");
    const footerShortcutElement = document.querySelector("[data-role='footer-shortcuts']");
    const mainShortcutElement = document.querySelector("main [data-role='footer-shortcuts']");
    const privacyLinkElement = document.querySelector("[data-role='privacy-link']");
    return {
      brandTaglineText: taglineElement?.textContent?.trim() ?? "",
      footerShortcutText: footerShortcutElement?.textContent?.trim() ?? "",
      footerShortcutIsInFooter: Boolean(footerShortcutElement?.closest("nav.navbar.fixed-bottom")),
      shortcutInMain: Boolean(mainShortcutElement),
      privacyLinkText: privacyLinkElement?.textContent?.trim() ?? "",
      privacyLinkIsSmall: Boolean(privacyLinkElement?.classList.contains("small")),
      privacyLinkHref: privacyLinkElement?.getAttribute("href") ?? ""
    };
  });
  assertEqual(
    layoutChecks.brandTaglineText,
    BRAND_TAGLINE_TEXT,
    "Brand tagline should render beneath the navbar title"
  );
  assertEqual(
    layoutChecks.footerShortcutText,
    FOOTER_SHORTCUT_TEXT,
    "Footer shortcut hint should match expected copy"
  );
  assertEqual(
    layoutChecks.footerShortcutIsInFooter,
    true,
    "Keyboard shortcut hint must live in the footer"
  );
  assertEqual(
    layoutChecks.shortcutInMain,
    false,
    "Keyboard shortcut hint should not render inside the main content"
  );
  assertEqual(
    layoutChecks.privacyLinkText,
    PRIVACY_LINK_TEXT,
    "Footer should surface a Privacy • Terms link"
  );
  assertEqual(
    layoutChecks.privacyLinkIsSmall,
    false,
    "Privacy link should use the standard footer type size"
  );
  assertEqual(
    layoutChecks.privacyLinkHref.endsWith("/privacy/") || layoutChecks.privacyLinkHref.endsWith("/privacy"),
    true,
    "Privacy link should route to the privacy policy path"
  );
  const filterLayoutSnapshot = await captureFilterLayoutSnapshot(page);
  assertEqual(filterLayoutSnapshot.rowCount, 1, "Filter chips should render on a single row");
  assertEqual(
    Math.abs(filterLayoutSnapshot.navGap) <= FILTER_NAV_GAP_TOLERANCE_PX,
    true,
    "Filter chip rail should sit flush beneath the navbar without extra spacing"
  );
  assertEqual(
    filterLayoutSnapshot.overflowDelta <= FILTER_OVERFLOW_TOLERANCE_PX,
    true,
    "Filter chip rail should avoid horizontal overflow so chips stay visible"
  );
  const filterDisplay = String(filterLayoutSnapshot.display ?? "").toLowerCase();
  assertEqual(
    filterDisplay.includes("grid"),
    true,
    "Filter chip container should use a grid layout for proportional sizing"
  );
  assertEqual(
    String(filterLayoutSnapshot.gridTemplateColumns ?? "").trim().length > 0,
    true,
    "Filter chip container should declare explicit grid columns"
  );
  assertEqual(
    filterLayoutSnapshot.usesButtonClass,
    false,
    "Filter chips should not depend on Bootstrap button styling"
  );
  assertEqual(
    filterLayoutSnapshot.maxBorderRadius <= FILTER_CHIP_MAX_RADIUS_PX,
    true,
    `Filter chips should avoid pill styling (radius ≤ ${FILTER_CHIP_MAX_RADIUS_PX}px)`
  );
  assertEqual(
    filterLayoutSnapshot.maxFontPx <= FILTER_FONT_MAX_PX + FILTER_FONT_DELTA_TOLERANCE_PX,
    true,
    "Filter chip typography should cap at the desktop font size"
  );
  const filterLayoutScenarios = [
    {
      description: "desktop width",
      viewport: { width: 1280, height: 900 },
      maxNavGapPx: FILTER_NAV_GAP_TOLERANCE_PX
    },
    {
      description: "narrow width",
      viewport: { width: 480, height: 900 },
      maxNavGapPx: FILTER_NAV_GAP_TOLERANCE_PX
    }
  ];
  const filterLayoutResults = [];
  await scenarioRunner.runTable("Filter row layout", filterLayoutScenarios, async (scenario) => {
    await page.setViewport({
      width: scenario.viewport.width,
      height: scenario.viewport.height,
      deviceScaleFactor: 1
    });
    await reloadApp(page, baseUrl);
    const scenarioSnapshot = await captureFilterLayoutSnapshot(page);
    filterLayoutResults.push({ description: scenario.description, snapshot: scenarioSnapshot });
    assertEqual(
      scenarioSnapshot.rowCount,
      1,
      `Filter chips should remain a single row at ${scenario.description}`
    );
    assertEqual(
      Math.abs(scenarioSnapshot.navGap) <= scenario.maxNavGapPx,
      true,
      `Filter rail should stay attached to the navbar at ${scenario.description}`
    );
    assertEqual(
      scenarioSnapshot.overflowDelta <= FILTER_OVERFLOW_TOLERANCE_PX,
      true,
      `Filter rail should avoid horizontal overflow at ${scenario.description}`
    );
    const scenarioDisplay = String(scenarioSnapshot.display ?? "").toLowerCase();
    assertEqual(
      scenarioDisplay.includes("grid"),
      true,
      `Filter chip container should rely on grid layout at ${scenario.description}`
    );
    assertEqual(
      scenarioSnapshot.maxFontPx <= FILTER_FONT_MAX_PX + FILTER_FONT_DELTA_TOLERANCE_PX,
      true,
      `Filter chip typography should stay capped at ${scenario.description}`
    );
  });
  const desktopLayout = filterLayoutResults.find((entry) => entry.description === "desktop width")?.snapshot;
  const narrowLayout = filterLayoutResults.find((entry) => entry.description === "narrow width")?.snapshot;
  if (desktopLayout && narrowLayout) {
    assertEqual(
      narrowLayout.maxFontPx <= desktopLayout.maxFontPx + FILTER_FONT_DELTA_TOLERANCE_PX,
      true,
      "Filter chips should shrink or match the desktop font size on narrow viewports"
    );
    assertEqual(
      narrowLayout.minFontPx <= desktopLayout.minFontPx + FILTER_FONT_DELTA_TOLERANCE_PX,
      true,
      "Filter chips should never grow when the viewport narrows"
    );
  }
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await reloadApp(page, baseUrl);
  await page.waitForSelector(BUBBLE_LAYER_SELECTOR);
  if (reportScenario && typeof reportScenario.pass === "function") {
    reportScenario.pass("Initial layout validations");
  }
  const footerLayoutSnapshot = await captureFooterLayoutSnapshot(page);
  const orderedFooterRoles = footerLayoutSnapshot
    .filter((entry) => ["privacy-link", "footer-theme-toggle", "footer-shortcuts", "footer-projects"].includes(entry.role))
    .sort((left, right) => left.left - right.left)
    .map((entry) => entry.role);
  assertDeepEqual(
    orderedFooterRoles,
    ["privacy-link", "footer-theme-toggle", "footer-shortcuts", "footer-projects"],
    "Footer elements should follow the specified left-to-right order"
  );
  const privacyFooterEntry = footerLayoutSnapshot.find((entry) => entry.role === "privacy-link");
  if (!privacyFooterEntry) {
    throw new Error("Privacy link entry missing from footer layout snapshot");
  }
  assertEqual(
    Number.parseFloat(privacyFooterEntry.fontSize) >= 14,
    true,
    "Privacy link should use a readable font size"
  );
  const spacerEntry = footerLayoutSnapshot.find((entry) => entry.role === "footer-spacer");
  assertEqual(
    spacerEntry !== undefined && Number.parseFloat(spacerEntry.flexGrow) > 0,
    true,
    "Footer spacer should expand to separate the theme toggle from the shortcut hint"
  );
  const footerMenuInitial = await captureFooterMenuSnapshot(page);
  assertEqual(
    footerMenuInitial.containerClasses.includes("dropup"),
    true,
    "Footer projects container should render as a drop-up"
  );
  assertEqual(footerMenuInitial.toggleLabel, FOOTER_MENU_LABEL, "Footer dropdown toggle should display the lab name");
  assertEqual(
    footerMenuInitial.toggleAriaLabel,
    FOOTER_MENU_TOGGLE_ARIA_LABEL,
    "Footer dropdown toggle should expose an accessible description"
  );
  assertEqual(
    footerMenuInitial.toggleAriaExpanded,
    "false",
    "Footer dropdown toggle should start collapsed"
  );
  assertEqual(
    footerMenuInitial.toggleAriaHaspopup,
    "menu",
    "Footer dropdown toggle should declare a menu popup"
  );
  assertEqual(
    footerMenuInitial.menuRole,
    "menu",
    "Footer dropdown should expose the menu role"
  );
  assertEqual(
    footerMenuInitial.menuLabelledBy,
    footerMenuInitial.toggleId,
    "Footer dropdown should be labelled by its toggle"
  );
  assertEqual(
    footerMenuInitial.toggleAriaControls,
    footerMenuInitial.menuId,
    "Footer dropdown toggle should reference the menu element"
  );
  assertEqual(
    footerMenuInitial.menuHasShowClass,
    false,
    "Footer dropdown menu should not apply the show class before activation"
  );
  assertEqual(
    footerMenuInitial.menuVisible,
    false,
    "Footer dropdown menu should remain hidden until toggled open"
  );
  await page.click(FOOTER_PROJECTS_TOGGLE_SELECTOR);
  await delay(WAIT_AFTER_INTERACTION_MS);
  const footerMenuExpanded = await captureFooterMenuSnapshot(page);
  assertEqual(
    footerMenuExpanded.toggleAriaExpanded,
    "true",
    "Footer dropdown toggle should mark itself expanded after activation"
  );
  assertEqual(
    footerMenuExpanded.menuHasShowClass,
    true,
    "Footer dropdown menu should apply the show class when expanded"
  );
  assertEqual(
    footerMenuExpanded.menuVisible,
    true,
    "Footer dropdown menu should render visibly when expanded"
  );
  const footerMenuLabels = footerMenuExpanded.itemSummaries.map((item) => item.label);
  const footerMenuHrefs = footerMenuExpanded.itemSummaries.map((item) => item.href);
  assertDeepEqual(
    footerMenuLabels,
    FOOTER_PROJECT_LINKS.map((link) => link.label),
    "Footer dropdown should list all project names in order"
  );
  assertDeepEqual(
    footerMenuHrefs,
    FOOTER_PROJECT_LINKS.map((link) => link.url),
    "Footer dropdown should link to each project URL in order"
  );
  const unsafeTargets = footerMenuExpanded.itemSummaries.filter(
    (item) => item.target !== "_blank" || !String(item.rel ?? "").includes("noopener")
  );
  assertEqual(
    unsafeTargets.length,
    0,
    "Footer dropdown links should open in a new tab with noopener hygiene"
  );
  await page.keyboard.press("Escape");
  await delay(WAIT_AFTER_INTERACTION_MS);
  const footerMenuCollapsed = await captureFooterMenuSnapshot(page);
  assertEqual(
    footerMenuCollapsed.toggleAriaExpanded,
    "false",
    "Footer dropdown toggle should collapse after pressing Escape"
  );
  assertEqual(
    footerMenuCollapsed.menuHasShowClass,
    false,
    "Footer dropdown menu should remove the show class after collapsing"
  );
  assertEqual(
    footerMenuCollapsed.menuVisible,
    false,
    "Footer dropdown menu should hide after collapsing"
  );
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click(PRIVACY_LINK_SELECTOR)
  ]);
  const initialPrivacyTheme = await page.evaluate(
    () => document.documentElement.getAttribute("data-bs-theme") ?? "light"
  );
  await page.waitForSelector(PRIVACY_ARTICLE_SELECTOR);
  await page.waitForSelector(CHIP_SELECTOR);
  const privacyPageSnapshot = await page.evaluate(
    (selectors) => {
      const heading = document.querySelector("h1");
      const robotsMeta = document.querySelector('meta[name="robots"]');
      const mailLink = document.querySelector('a[href^="mailto:"]');
      const nav = document.querySelector("nav.navbar.fixed-top");
      const footer = document.querySelector("nav.navbar.fixed-bottom");
      const navStyles = nav ? getComputedStyle(nav) : null;
      const footerStyles = footer ? getComputedStyle(footer) : null;
      const searchInput = document.querySelector(selectors.searchInput);
      const chips = Array.from(document.querySelectorAll(selectors.chipSelector));
      const article = document.querySelector(selectors.articleSelector);
      const articleStyles = article ? getComputedStyle(article) : null;
      const isElementVisible = (styles) =>
        Boolean(styles) &&
        styles.getPropertyValue("display") !== "none" &&
        styles.getPropertyValue("visibility") !== "hidden";
      return {
        heading: heading?.textContent?.trim() ?? "",
        robots: robotsMeta?.getAttribute("content") ?? "",
        hasMailLink: Boolean(mailLink),
        navVisible: isElementVisible(navStyles),
        footerVisible: isElementVisible(footerStyles),
        hasSearch: Boolean(searchInput),
        chipCount: chips.length,
        articleBackground: articleStyles?.getPropertyValue("background-color") ?? "",
        articleColor: articleStyles?.getPropertyValue("color") ?? ""
      };
    },
    {
      searchInput: SEARCH_INPUT_SELECTOR,
      chipSelector: CHIP_SELECTOR,
      articleSelector: PRIVACY_ARTICLE_SELECTOR
    }
  );
  assertEqual(
    privacyPageSnapshot.heading,
    PRIVACY_HEADING_TEXT,
    "Privacy policy page should render the expected heading"
  );
  assertEqual(
    privacyPageSnapshot.robots,
    PRIVACY_ROBOTS_META,
    "Privacy policy page should prevent search indexing"
  );
  assertEqual(
    privacyPageSnapshot.hasMailLink,
    true,
    "Privacy policy page should expose a contact email link"
  );
  assertEqual(privacyPageSnapshot.navVisible, true, "Privacy policy should reuse the global header");
  assertEqual(privacyPageSnapshot.footerVisible, true, "Privacy policy should reuse the global footer");
  assertEqual(
    privacyPageSnapshot.hasSearch,
    true,
    "Privacy policy should expose the global search control within the header"
  );
  assertEqual(
    privacyPageSnapshot.chipCount > 0,
    true,
    "Privacy policy should render the tag filter rail"
  );
  const toggledPrivacyTheme = initialPrivacyTheme === "dark" ? "light" : "dark";
  await page.click(THEME_TOGGLE_SELECTOR);
  await waitForThemeMode(page, toggledPrivacyTheme);
  await delay(WAIT_AFTER_INTERACTION_MS);
  const privacyThemeSnapshot = await page.evaluate((articleSelector) => {
    const article = document.querySelector(articleSelector);
    const articleStyles = article ? getComputedStyle(article) : null;
    return {
      theme: document.documentElement.getAttribute("data-bs-theme") ?? "",
      articleBackground: articleStyles?.getPropertyValue("background-color") ?? "",
      articleColor: articleStyles?.getPropertyValue("color") ?? ""
    };
  }, PRIVACY_ARTICLE_SELECTOR);
  assertEqual(
    privacyThemeSnapshot.theme,
    toggledPrivacyTheme,
    "Privacy policy should respect theme toggles"
  );
  assertEqual(
    colorsAreClose(
      privacyThemeSnapshot.articleBackground.trim(),
      privacyPageSnapshot.articleBackground.trim()
    ),
    false,
    "Privacy policy surface background should respond to theme toggles"
  );
  assertEqual(
    colorsAreClose(privacyThemeSnapshot.articleColor.trim(), privacyPageSnapshot.articleColor.trim()),
    false,
    "Privacy policy typography should respond to theme toggles"
  );
  await page.click(THEME_TOGGLE_SELECTOR);
  await waitForThemeMode(page, initialPrivacyTheme);
  await delay(WAIT_AFTER_INTERACTION_MS);
  await page.goBack({ waitUntil: "networkidle0" });
  await waitForCardCount(page, initialCardIds.length);
  await delay(WAIT_AFTER_INTERACTION_MS);
  const desktopRowCounts = await captureGridRowLengths(page);
  const desktopInteriorCounts = desktopRowCounts.slice(0, -1);
  if (desktopInteriorCounts.length > 0) {
    const expectedDesktopRow = desktopInteriorCounts[0];
    assertEqual(
      desktopInteriorCounts.every((count) => count === expectedDesktopRow),
      true,
      "Desktop rows before the final partial row should share a consistent column count"
    );
  }
  const themeAlignmentDelta = await page.evaluate((maximumDelta) => {
    const toggleInput = document.querySelector("#themeToggle");
    const toggleLabel = document.querySelector("label[for='themeToggle']");
    if (!(toggleInput instanceof HTMLElement) || !(toggleLabel instanceof HTMLElement)) {
      throw new Error("Theme toggle controls missing");
    }
    const inputRect = toggleInput.getBoundingClientRect();
    const labelRect = toggleLabel.getBoundingClientRect();
    const inputCenterY = inputRect.top + inputRect.height / 2;
    const labelCenterY = labelRect.top + labelRect.height / 2;
    return {
      delta: Math.abs(inputCenterY - labelCenterY),
      maximumDelta
    };
  }, MAX_THEME_ALIGNMENT_DELTA_PX);
  assertEqual(
    themeAlignmentDelta.delta <= themeAlignmentDelta.maximumDelta,
    true,
    `Theme toggle and label should align within ${MAX_THEME_ALIGNMENT_DELTA_PX}px vertically`
  );

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await delay(WAIT_AFTER_INTERACTION_MS);
  const filterStickyAfterScroll = await page.evaluate((filterSelector, tolerance) => {
    const nav = document.querySelector("nav.navbar.fixed-top");
    const filterBar = document.querySelector(filterSelector);
    if (!nav || !(filterBar instanceof HTMLElement)) {
      throw new Error("Filter bar or navbar missing after scroll");
    }
    const navRect = nav.getBoundingClientRect();
    const filterRect = filterBar.getBoundingClientRect();
    return {
      delta: filterRect.top - navRect.bottom,
      tolerance
    };
  }, FILTER_BAR_SELECTOR, STICKY_DELTA_TOLERANCE_PX);
  assertEqual(
    Math.abs(filterStickyAfterScroll.delta) <= filterStickyAfterScroll.tolerance,
    true,
    "Tag filter bar should remain pinned just beneath the navbar while scrolling"
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(WAIT_AFTER_INTERACTION_MS);

  const searchScenarios = [
    {
      description: "filters cards by query term",
      query: "SQL",
      expectedIds: ["p04", "p18"],
      expectEmptyMessage: false
    },
    {
      description: "shows empty state when nothing matches",
      query: "zzz-not-real",
      expectedIds: [],
      expectEmptyMessage: true
    }
  ];

  await scenarioRunner.runTable("Search filters", searchScenarios, async (scenario) => {
    await clearSearch(page);
    await setSearchValue(page, scenario.query);
    await waitForCardIds(page, scenario.expectedIds);
    const cardIds = await getVisibleCardIds(page);
    assertDeepEqual(
      cardIds,
      scenario.expectedIds,
      `Search scenario "${scenario.description}" should match expected cards`
    );
    const emptyStateSnapshot = await captureEmptyStateSnapshot(page);
    const emptyVisible = Boolean(emptyStateSnapshot);
    assertEqual(
      emptyVisible,
      scenario.expectEmptyMessage,
      `Search scenario "${scenario.description}" should ${scenario.expectEmptyMessage ? "" : "not "}show empty message`
    );
    if (scenario.expectEmptyMessage && emptyStateSnapshot) {
      const currentThemeMode = await page.evaluate(
        () => document.documentElement.getAttribute("data-bs-theme") ?? "light"
      );
      const expectedBackgroundColor =
        currentThemeMode === "dark" ? EMPTY_STATE_DARK_BACKGROUND : EMPTY_STATE_LIGHT_BACKGROUND;
      const expectedTextColor = currentThemeMode === "dark" ? EMPTY_STATE_DARK_TEXT : EMPTY_STATE_LIGHT_TEXT;
      assertEqual(
        emptyStateSnapshot.text,
        "No prompts match your search",
        "Empty state should describe the search mismatch"
      );
      assertEqual(
        colorsAreClose(emptyStateSnapshot.backgroundColor.trim(), expectedBackgroundColor),
        true,
        "Empty state background should match the active theme token"
      );
      assertEqual(
        colorsAreClose(emptyStateSnapshot.textColor.trim(), expectedTextColor),
        true,
        "Empty state text color should match the active theme accent"
      );
    }
  });

  await clearSearch(page);
  await waitForCardCount(page, initialCardIds.length);

  const clearButtonInitiallyVisible = await isClearButtonVisible(page);
  assertEqual(
    clearButtonInitiallyVisible,
    false,
    "Clear button should remain hidden when the search input is empty"
  );
  await setSearchValue(page, "ai");
  await page.waitForFunction(
    (selector) => {
      const button = document.querySelector(selector);
      if (!button) {
        return false;
      }
      const styles = getComputedStyle(button);
      return styles.getPropertyValue("display") !== "none" && styles.getPropertyValue("visibility") !== "hidden";
    },
    {},
    CLEAR_BUTTON_SELECTOR
  );
  const clearButtonMetadata = await page.evaluate((selector) => {
    const button = document.querySelector(selector);
    return {
      exists: Boolean(button),
      ariaLabel: button?.getAttribute("aria-label") ?? "",
      tabIndex: button?.getAttribute("tabindex") ?? ""
    };
  }, CLEAR_BUTTON_SELECTOR);
  assertEqual(clearButtonMetadata.exists, true, "Clear button should render when search has content");
  assertEqual(
    clearButtonMetadata.ariaLabel,
    CLEAR_BUTTON_LABEL,
    "Clear button should expose an accessible label describing its action"
  );
  assertEqual(
    clearButtonMetadata.tabIndex === null || clearButtonMetadata.tabIndex === "" || clearButtonMetadata.tabIndex === "0",
    true,
    "Clear button should be focusable when displayed"
  );
  await page.click(CLEAR_BUTTON_SELECTOR);
  await page.waitForFunction(
    (selector) => {
      const element = document.querySelector(selector);
      return element instanceof HTMLInputElement && element.value === "";
    },
    {},
    SEARCH_INPUT_SELECTOR
  );
  await waitForCardCount(page, initialCardIds.length);
  const clearButtonAfterClickVisible = await isClearButtonVisible(page);
  assertEqual(
    clearButtonAfterClickVisible,
    false,
    "Clear button should hide again after clearing the search input"
  );
  const activeElementIdAfterClear = await page.evaluate(() => document.activeElement?.id ?? "");
  assertEqual(
    activeElementIdAfterClear,
    "searchInput",
    "Clearing the search should return focus to the search input"
  );

  const chipScenarios = [
    {
      label: "writing",
      verify: async () => {
        const activeChipLabels = await getActiveChipLabels(page);
        assertDeepEqual(activeChipLabels, ["writing"], "Only the writing chip should be active after selecting it");
        await page.waitForFunction(
          (selector) =>
            Array.from(document.querySelectorAll(selector)).every((card) =>
              Array.from(card.querySelectorAll("[data-role='card-tag']")).some((tag) =>
                tag.textContent?.trim() === "writing"
              )
            ),
          {},
          CARD_SELECTOR
        );
      }
    },
    {
      label: "all",
      verify: async () => {
        const activeChipLabels = await getActiveChipLabels(page);
        assertDeepEqual(activeChipLabels, ["all"], "All chip should become the active filter");
        await waitForCardCount(page, initialCardIds.length);
      }
    }
  ];

  for (const scenario of chipScenarios) {
    await clickChipByLabel(page, scenario.label);
    await waitForActiveChip(page, scenario.label);
    await scenario.verify();
  }

  await clearSearch(page);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press("/");
  const activeElementId = await page.evaluate(() => document.activeElement?.id ?? "");
  assertEqual(activeElementId, "searchInput", "Slash hotkey should focus the search input");

  await clearSearch(page);
  const themeBeforeCopyCheck = await page.evaluate(
    () => document.documentElement.getAttribute("data-bs-theme") ?? "light"
  );
  let resetThemeAfterCopyCheck = false;
  if (themeBeforeCopyCheck !== "light") {
    await page.click(THEME_TOGGLE_SELECTOR);
    await waitForThemeMode(page, "light");
    await delay(WAIT_AFTER_INTERACTION_MS);
    resetThemeAfterCopyCheck = true;
  }
  const copyButtonColorSnapshot = await captureElementColor(page, COPY_BUTTON_LABEL_SELECTOR);
  const normalizedCopyColor = normalizeToRgb(copyButtonColorSnapshot.raw);
  assertEqual(
    colorsAreClose(normalizedCopyColor, SHARE_ICON_LIGHT_COLOR),
    true,
    "Copy button text should use the dark accent color in light theme"
  );
  const copyButtonAlpha = Number.isFinite(copyButtonColorSnapshot.alpha) ? copyButtonColorSnapshot.alpha : 1;
  assertEqual(
    copyButtonAlpha,
    1,
    "Copy button text color should render fully opaque in light theme"
  );
  const shareButtonColorSnapshot = await captureElementColor(page, SHARE_BUTTON_LABEL_SELECTOR);
  const normalizedShareColor = normalizeToRgb(shareButtonColorSnapshot.raw);
  assertEqual(
    colorsAreClose(normalizedShareColor, normalizedCopyColor),
    true,
    "Share button text should mirror the copy button accent color in light theme"
  );
  const shareButtonAlpha = Number.isFinite(shareButtonColorSnapshot.alpha) ? shareButtonColorSnapshot.alpha : 1;
  assertEqual(
    shareButtonAlpha,
    1,
    "Share button text color should remain fully opaque in light theme"
  );
  if (resetThemeAfterCopyCheck) {
    await page.click(THEME_TOGGLE_SELECTOR);
    await waitForThemeMode(page, themeBeforeCopyCheck);
    await delay(WAIT_AFTER_INTERACTION_MS);
  }
  await page.evaluate(() => {
    window.__copiedText = "";
  });
  await clickCardButton(page, "p01", "copy");
  await waitForToastMessage(page, "Prompt copied");
  await waitForCardFeedback(page, "p01", COPY_FEEDBACK_MESSAGE);
  const copiedText = await getClipboardText(page);
  assertEqual(
    copiedText.includes("Summarize the following bug/incident"),
    true,
    "Copy action should write card text"
  );
  if (adjacentCardId) {
    const adjacentCardHasFeedback = await page.evaluate(
      (cardSelector, feedbackSelector, identifier) => {
        const card = document.querySelector(`${cardSelector}#${CSS.escape(identifier)}`);
        if (!card) {
          return false;
        }
        return Boolean(card.querySelector(feedbackSelector));
      },
      CARD_SELECTOR,
      CARD_FEEDBACK_SELECTOR,
      adjacentCardId
    );
    assertEqual(adjacentCardHasFeedback, false, "Copy feedback should not leak into other cards");
  }

  await page.evaluate(() => {
    window.__copiedText = "";
  });
  await clickCardButton(page, "p01", "share");
  await waitForToastMessage(page, "Link copied");
  await waitForCardFeedback(page, "p01", SHARE_FEEDBACK_MESSAGE);
  const shareText = await getClipboardText(page);
  assertEqual(shareText.endsWith("#p01"), true, "Share button should copy card URL");

  const targetCardTitle = await page.evaluate(() => {
    const card = document.querySelector("[data-test='prompt-card']#p01");
    const titleElement = card?.querySelector(".card-title");
    return titleElement?.textContent?.trim() ?? "";
  });
  const initialLikeSnapshot = await getCardLikeSnapshot(page, "p01");
  const cardButtonOrder = await getCardButtonOrder(page, "p01");
  assertDeepEqual(
    cardButtonOrder,
    ["copy-button", "like-button", "share-button"],
    "Card controls should position the like toggle between copy and share buttons"
  );
  assertEqual(initialLikeSnapshot.count, 0, "Like counter should start at zero");
  assertEqual(initialLikeSnapshot.pressed, "false", "Like button should start unpressed");
  assertEqual(initialLikeSnapshot.iconText, LIKE_ICON_TEXT, "Like button should render the bubble icon glyph");
  assertEqual(
    initialLikeSnapshot.label.startsWith(`${LIKE_LABEL_PREFIX} ${targetCardTitle}`),
    true,
    "Like button label should describe the card title"
  );
  assertEqual(
    initialLikeSnapshot.label.includes(`${LIKE_COUNT_LABEL_PREFIX} 0`),
    true,
    "Like button label should report the inactive count"
  );
  await clickLikeButton(page, "p01");
  await waitForLikeCount(page, "p01", 1);
  const likedSnapshot = await getCardLikeSnapshot(page, "p01");
  assertEqual(likedSnapshot.count, 1, "First like toggle should increment the counter to one");
  assertEqual(likedSnapshot.pressed, "true", "Like button should become pressed after liking a card");
  assertEqual(
    likedSnapshot.label.includes(`${LIKE_COUNT_LABEL_PREFIX} 1`),
    true,
    "Like button label should update to reflect the liked count"
  );
  await waitForBubbleRemoval(page);
  await reloadApp(page, baseUrl);
  await waitForCardCount(page, initialCardIds.length);
  const persistedLikeSnapshot = await getCardLikeSnapshot(page, "p01");
  assertEqual(persistedLikeSnapshot.count, 1, "Like count should persist after reloading the page");
  assertEqual(persistedLikeSnapshot.pressed, "true", "Like button pressed state should persist after reload");
  await clickLikeButton(page, "p01");
  await waitForLikeCount(page, "p01", 0);
  const clearedLikeSnapshot = await getCardLikeSnapshot(page, "p01");
  assertEqual(clearedLikeSnapshot.count, 0, "Second toggle should remove the stored like");
  assertEqual(clearedLikeSnapshot.pressed, "false", "Like button should return to unpressed when cleared");
  assertEqual(
    clearedLikeSnapshot.label.includes(`${LIKE_COUNT_LABEL_PREFIX} 0`),
    true,
    "Like button label should reflect the cleared count"
  );
  await waitForBubbleRemoval(page);
  await reloadApp(page, baseUrl);
  await waitForCardCount(page, initialCardIds.length);
  const resetLikeSnapshot = await getCardLikeSnapshot(page, "p01");
  assertEqual(resetLikeSnapshot.count, 0, "Cleared like state should persist after a reload");
  assertEqual(resetLikeSnapshot.pressed, "false", "Cleared like state should remain unpressed after reload");

  const initialThemeMode = await page.evaluate(() => document.documentElement.getAttribute("data-bs-theme") ?? "light");
  const initialThemeSnapshot = await captureThemeSnapshot(page);
  const expectedInitialShareIconColor =
    initialThemeMode === "dark" ? SHARE_ICON_DARK_COLOR : SHARE_ICON_LIGHT_COLOR;
  assertEqual(
    colorsAreClose(initialThemeSnapshot.shareIconColor.trim(), expectedInitialShareIconColor),
    true,
    "Share icon should match the active theme color"
  );
  assertEqual(
    colorsAreClose(initialThemeSnapshot.shareButtonColor.trim(), initialThemeSnapshot.copyButtonColor.trim()),
    true,
    "Share button text should match the copy button accent color in the active theme"
  );
  assertEqual(
    colorsAreClose(
      initialThemeSnapshot.shareButtonBorderColor.trim(),
      initialThemeSnapshot.copyButtonBorderColor.trim()
    ),
    true,
    "Share button border should reuse the copy button outline color"
  );
  await waitForBubbleRemoval(page);
  await page.evaluate(() => {
    window.__lastBubbleState = null;
  });
  await clickCardSurface(page, "p01");
  const bubbleAfterCardClick = await page.evaluate(
    (bubbleSelector) => document.querySelector(bubbleSelector) !== null,
    BUBBLE_SELECTOR
  );
  assertEqual(
    bubbleAfterCardClick,
    false,
    "Card click should no longer spawn bubble animation"
  );
  const cardClickBubbleState = await page.evaluate(() => window.__lastBubbleState ?? null);
  assertEqual(
    cardClickBubbleState === null,
    true,
    "Card click should not update bubble metadata"
  );
  await triggerLikeBubble(page, "p01");
  const initialBubbleSnapshot = await snapshotBubble(page, "p01");
  assertEqual(
    initialBubbleSnapshot !== null,
    true,
    "Bubble should render when clicking the card in the initial theme"
  );
  if (!initialBubbleSnapshot) {
    throw new Error("Initial bubble snapshot missing");
  }
  const expectedInitialBubbleBorder =
    initialThemeMode === "dark" ? BUBBLE_BORDER_DARK : BUBBLE_BORDER_LIGHT;
  assertEqual(
    initialBubbleSnapshot.borderColor.trim(),
    expectedInitialBubbleBorder,
    "Bubble border should track the active theme color"
  );
  assertEqual(
    initialBubbleSnapshot.theme,
    initialThemeMode,
    "Bubble metadata should record the active theme"
  );
  const initialAnimationMetadata = await captureBubbleAnimationMetadata(page);
  assertEqual(
    initialAnimationMetadata !== null,
    true,
    "Bubble animation should expose metadata for verification"
  );
  if (!initialAnimationMetadata) {
    throw new Error("Initial bubble animation metadata missing");
  }
  assertEqual(
    initialAnimationMetadata.keyframeCount,
    BUBBLE_LINEAR_EXPECTED_KEYFRAMES,
    "Bubble animation should define only starting and ending keyframes to ensure linear travel"
  );
  const initialEasing = (initialAnimationMetadata.easing ?? "").trim().toLowerCase();
  assertEqual(
    initialEasing === "linear",
    true,
    "Bubble animation should apply linear easing to avoid mid-flight slowdowns"
  );
  const initialBubbleRatio =
    initialBubbleSnapshot.cardWidth === 0
      ? 0
      : initialBubbleSnapshot.bubbleWidth / initialBubbleSnapshot.cardWidth;
  assertEqual(
    Math.abs(initialBubbleRatio - BUBBLE_SIZE_RATIO) <= BUBBLE_SIZE_TOLERANCE,
    true,
    `Bubble diameter should be about ${BUBBLE_SIZE_RATIO * 100}% of the card width`
  );
  assertEqual(
    Number.isFinite(initialBubbleSnapshot.expectedRiseDistance),
    true,
    "Bubble rise distance should be measurable when the bubble spawns"
  );
  const initialRiseDelta = Math.abs(
    (initialBubbleSnapshot.computedRiseDistance ?? Number.NaN) - initialBubbleSnapshot.expectedRiseDistance
  );
  assertEqual(
    initialRiseDelta <= BUBBLE_RISE_DISTANCE_TOLERANCE_PX,
    true,
    `Bubble should rise until it reaches the originating card's top edge (expected ${formatNumber(
      initialBubbleSnapshot.expectedRiseDistance
    )}px, got ${formatNumber(initialBubbleSnapshot.computedRiseDistance)}px)`
  );
  const initialBubbleState = await page.evaluate(() => window.__lastBubbleState ?? null);
  if (!initialBubbleState) {
    throw new Error("Initial bubble state missing");
  }
  const initialFinalTop =
    typeof initialBubbleState.y === "number" && typeof initialBubbleState.size === "number"
      ? initialBubbleState.y - initialBubbleState.size / 2 - initialBubbleState.riseDistance
      : Number.NaN;
  const initialCardTop = typeof initialBubbleState.cardTop === "number" ? initialBubbleState.cardTop : Number.NaN;
  const initialFinalDelta = Math.abs(initialFinalTop - initialCardTop);
  assertEqual(
    Number.isFinite(initialFinalDelta) && initialFinalDelta <= BUBBLE_FINAL_ALIGNMENT_TOLERANCE_PX,
    true,
    `Bubble final position should align with the card top edge (delta ${formatNumber(initialFinalDelta)}px)`
  );
  await delay(BUBBLE_LIFETIME_MS + BUBBLE_REMOVAL_GRACE_MS);
  await waitForBubbleRemoval(page);
  await page.click(THEME_TOGGLE_SELECTOR);
  const toggledThemeMode = initialThemeMode === "dark" ? "light" : "dark";
  await waitForThemeMode(page, toggledThemeMode);
  await delay(WAIT_AFTER_INTERACTION_MS);
  const toggledThemeSnapshot = await captureThemeSnapshot(page);
  assertEqual(
    toggledThemeSnapshot.bodyBackgroundImage === initialThemeSnapshot.bodyBackgroundImage,
    false,
    "Theme switch should update the body background"
  );
  assertEqual(
    toggledThemeSnapshot.topNavBackgroundColor === initialThemeSnapshot.topNavBackgroundColor,
    false,
    "Theme switch should update the top navigation background"
  );
  assertEqual(
    toggledThemeSnapshot.inputBackgroundColor === initialThemeSnapshot.inputBackgroundColor,
    false,
    "Theme switch should update search input background"
  );
  assertEqual(
    toggledThemeSnapshot.tagBackgroundColor === initialThemeSnapshot.tagBackgroundColor,
    false,
    "Theme switch should update tag badge background"
  );
  assertEqual(
    toggledThemeSnapshot.tagColor === initialThemeSnapshot.tagColor,
    false,
    "Theme switch should update tag badge text color"
  );
  assertEqual(
    toggledThemeSnapshot.addonBackgroundColor === initialThemeSnapshot.addonBackgroundColor,
    false,
    "Theme switch should update search addon background"
  );
  assertEqual(
    toggledThemeSnapshot.addonColor === initialThemeSnapshot.addonColor,
    false,
    "Theme switch should update search addon icon color"
  );
  const expectedToggledShareIconColor =
    toggledThemeMode === "dark" ? SHARE_ICON_DARK_COLOR : SHARE_ICON_LIGHT_COLOR;
  assertEqual(
    colorsAreClose(toggledThemeSnapshot.shareIconColor.trim(), expectedToggledShareIconColor),
    true,
    "Share icon should switch to the alternate theme accent color"
  );
  assertEqual(
    colorsAreClose(toggledThemeSnapshot.shareButtonColor.trim(), toggledThemeSnapshot.copyButtonColor.trim()),
    true,
    "Share button text should continue matching the copy button accent color after theme changes"
  );
  assertEqual(
    colorsAreClose(
      toggledThemeSnapshot.shareButtonBorderColor.trim(),
      toggledThemeSnapshot.copyButtonBorderColor.trim()
    ),
    true,
    "Share button border should stay aligned with the copy button outline after theme changes"
  );
  await triggerLikeBubble(page, "p01");
  const toggledBubbleSnapshot = await snapshotBubble(page, "p01");
  assertEqual(
    toggledBubbleSnapshot !== null,
    true,
    "Bubble should render after toggling theme"
  );
  if (!toggledBubbleSnapshot) {
    throw new Error("Toggled bubble snapshot missing");
  }
  const toggledAnimationMetadata = await captureBubbleAnimationMetadata(page);
  assertEqual(
    toggledAnimationMetadata !== null,
    true,
    "Bubble animation should expose metadata after theme changes"
  );
  if (!toggledAnimationMetadata) {
    throw new Error("Toggled bubble animation metadata missing");
  }
  assertEqual(
    toggledAnimationMetadata.keyframeCount,
    BUBBLE_LINEAR_EXPECTED_KEYFRAMES,
    "Bubble animation should continue using only starting and ending keyframes after theme changes"
  );
  const toggledEasing = (toggledAnimationMetadata.easing ?? "").trim().toLowerCase();
  assertEqual(
    toggledEasing === "linear",
    true,
    "Bubble animation should remain linear after theme changes"
  );
  const expectedToggledBubbleBorder =
    toggledThemeMode === "dark" ? BUBBLE_BORDER_DARK : BUBBLE_BORDER_LIGHT;
  assertEqual(
    toggledBubbleSnapshot.borderColor.trim(),
    expectedToggledBubbleBorder,
    "Bubble border should update to the toggled theme color"
  );
  assertEqual(
    toggledBubbleSnapshot.theme,
    toggledThemeMode,
    "Bubble metadata should reflect the toggled theme"
  );
  const toggledBubbleRatio =
    toggledBubbleSnapshot.cardWidth === 0
      ? 0
      : toggledBubbleSnapshot.bubbleWidth / toggledBubbleSnapshot.cardWidth;
  assertEqual(
    Math.abs(toggledBubbleRatio - BUBBLE_SIZE_RATIO) <= BUBBLE_SIZE_TOLERANCE,
    true,
    `Bubble diameter should stay near ${BUBBLE_SIZE_RATIO * 100}% of the card width`
  );
  assertEqual(
    Number.isFinite(toggledBubbleSnapshot.expectedRiseDistance),
    true,
    "Bubble rise distance should remain measurable after toggling theme"
  );
  const toggledRiseDelta = Math.abs(
    (toggledBubbleSnapshot.computedRiseDistance ?? Number.NaN) - toggledBubbleSnapshot.expectedRiseDistance
  );
  assertEqual(
    toggledRiseDelta <= BUBBLE_RISE_DISTANCE_TOLERANCE_PX,
    true,
    `Bubble should continue to rise to the card's top edge after switching theme (expected ${formatNumber(
      toggledBubbleSnapshot.expectedRiseDistance
    )}px, got ${formatNumber(toggledBubbleSnapshot.computedRiseDistance)}px)`
  );
  const toggledBubbleState = await page.evaluate(() => window.__lastBubbleState ?? null);
  if (!toggledBubbleState) {
    throw new Error("Toggled bubble state missing");
  }
  const toggledFinalTop =
    typeof toggledBubbleState.y === "number" && typeof toggledBubbleState.size === "number"
      ? toggledBubbleState.y - toggledBubbleState.size / 2 - toggledBubbleState.riseDistance
      : Number.NaN;
  const toggledCardTop = typeof toggledBubbleState.cardTop === "number" ? toggledBubbleState.cardTop : Number.NaN;
  const toggledFinalDelta = Math.abs(toggledFinalTop - toggledCardTop);
  assertEqual(
    Number.isFinite(toggledFinalDelta) && toggledFinalDelta <= BUBBLE_FINAL_ALIGNMENT_TOLERANCE_PX,
    true,
    `Bubble final position should align with the card top edge after switching theme (delta ${formatNumber(
      toggledFinalDelta
    )}px)`
  );
  await delay(BUBBLE_LIFETIME_MS + BUBBLE_REMOVAL_GRACE_MS);
  await waitForBubbleRemoval(page);
  await clearSearch(page);
  await setSearchValue(page, "zzz-not-real");
  await waitForCardIds(page, []);
  const darkEmptyStateSnapshot = await captureEmptyStateSnapshot(page);
  assertEqual(darkEmptyStateSnapshot !== null, true, "Dark theme should surface the empty state message");
  if (!darkEmptyStateSnapshot) {
    throw new Error("Dark theme empty state snapshot missing");
  }
  const activeThemeMode = await page.evaluate(
    () => document.documentElement.getAttribute("data-bs-theme") ?? "light"
  );
  const expectedDarkBackground =
    activeThemeMode === "dark" ? EMPTY_STATE_DARK_BACKGROUND : EMPTY_STATE_LIGHT_BACKGROUND;
  const expectedDarkText = activeThemeMode === "dark" ? EMPTY_STATE_DARK_TEXT : EMPTY_STATE_LIGHT_TEXT;
  assertEqual(
    darkEmptyStateSnapshot.text,
    "No prompts match your search",
    "Empty state copy should remain consistent in dark theme"
  );
  assertEqual(
    colorsAreClose(darkEmptyStateSnapshot.backgroundColor.trim(), expectedDarkBackground),
    true,
    "Empty state background should adopt the active theme token"
  );
  assertEqual(
    colorsAreClose(darkEmptyStateSnapshot.textColor.trim(), expectedDarkText),
    true,
    "Empty state text should use the active theme accent color"
  );
  await clearSearch(page);
  await waitForCardCount(page, initialCardIds.length);
  await page.click(THEME_TOGGLE_SELECTOR);
  await waitForThemeMode(page, initialThemeMode);
  await delay(WAIT_AFTER_INTERACTION_MS);
  const finalThemeSnapshot = await captureThemeSnapshot(page);
  const expectedInputBackground = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--app-search-input-bg")
  );
  assertEqual(
    finalThemeSnapshot.inputBackgroundColor.trim(),
    expectedInputBackground.trim(),
    "Search input background should align with the active theme token"
  );
  assertEqual(
    colorsAreClose(finalThemeSnapshot.shareButtonColor.trim(), finalThemeSnapshot.copyButtonColor.trim()),
    true,
    "Share button text should align with the copy button accent color after restoring the original theme"
  );
  assertEqual(
    colorsAreClose(
      finalThemeSnapshot.shareButtonBorderColor.trim(),
      finalThemeSnapshot.copyButtonBorderColor.trim()
    ),
    true,
    "Share button border should remain in sync with the copy button outline after restoring the original theme"
  );
  const sitemapSnapshot = await page.evaluate(async () => {
    const response = await fetch("./sitemap.xml", { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const sitemapText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(sitemapText, "application/xml");
    const urlElements = Array.from(doc.querySelectorAll("url > loc"));
    const locValues = urlElements
      .map((element) => element.textContent ?? "")
      .filter((value) => value.trim().length > 0);
    const pathValues = locValues
      .map((value) => {
        try {
          return new URL(value, document.location.origin).pathname;
        } catch (error) {
          return "";
        }
      })
      .filter((value) => value.length > 0);
    return {
      urls: locValues,
      paths: pathValues
    };
  });
  assertEqual(sitemapSnapshot !== null, true, "Sitemap should be reachable from the root of the site");
  if (!sitemapSnapshot) {
    throw new Error("Sitemap snapshot missing");
  }
  assertEqual(
    sitemapSnapshot.paths.includes("/") && sitemapSnapshot.paths.includes("/privacy/"),
    true,
    "Sitemap should list both the homepage and privacy policy paths"
  );

  await page.goto(`${baseUrl}#p05`, { waitUntil: "networkidle0" });
  await waitForLinkedCard(page, "p05");

  await reloadApp(page, baseUrl);
  await clearSearch(page);
  await setSearchValue(page, "SQL");
  await clickChipByLabel(page, "data");
  await reloadApp(page, baseUrl);
  const persistedSearchValue = await page.$eval(SEARCH_INPUT_SELECTOR, (element) => element.value);
  assertEqual(persistedSearchValue, "SQL", "Search text should persist across reloads");
  const activeAfterReload = await getActiveChipLabels(page);
  assertDeepEqual(activeAfterReload, ["data"], "Tag selection should persist across reloads");
  const cardsAfterReload = await getVisibleCardIds(page);
  assertDeepEqual(cardsAfterReload, ["p04", "p18"], "Reload should respect persisted filters");

  const [jsCoverageEntries, cssCoverageEntries] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage()
  ]);
  await page.close();
  return {
    coverage: {
      js: summarizeCoverageEntries(jsCoverageEntries),
      css: summarizeCoverageEntries(cssCoverageEntries)
    }
  };
};
