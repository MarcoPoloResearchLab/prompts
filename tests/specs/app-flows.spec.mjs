// @ts-check
import { assertDeepEqual, assertEqual } from "../assert.js";

const WAIT_AFTER_INTERACTION_MS = 180;
const SEARCH_INPUT_SELECTOR = "[data-test='search-input']";
const CHIP_SELECTOR = "[data-test='tag-chip']";
const CARD_SELECTOR = "[data-test='prompt-card']";
const COPY_BUTTON_SELECTOR = "[data-test='copy-button']";
const SHARE_BUTTON_SELECTOR = "[data-test='share-button']";
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
const BRAND_TAGLINE_TEXT = "Built for instant prompt workflows.";
const FOOTER_SHORTCUT_TEXT = "Press / to search • Enter to copy the focused card";
const EXPECTED_DESKTOP_COLUMNS = 4;
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
const EMPTY_STATE_LIGHT_BACKGROUND = "rgb(232, 240, 255)";
const EMPTY_STATE_LIGHT_TEXT = "rgb(13, 34, 71)";
const EMPTY_STATE_DARK_BACKGROUND = "rgb(26, 44, 92)";
const EMPTY_STATE_DARK_TEXT = "rgb(217, 230, 255)";
const PLACEHOLDER_OVERFLOW_TOLERANCE_PX = 1.5;

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
      shareIconColor: shareIcon ? getComputedStyle(shareIcon).getPropertyValue("color") : ""
    };
  });
const parsePixels = (value) => Number.parseFloat(String(value).replace("px", "")) || 0;
const parseRgbComponents = (value) => (String(value).match(/\d+/g) ?? []).map(Number);
const colorsAreClose = (actual, expected) => {
  const actualComponents = parseRgbComponents(actual);
  const expectedComponents = parseRgbComponents(expected);
  if (actualComponents.length !== 3 || expectedComponents.length !== 3) {
    return false;
  }
  return actualComponents.every((component, index) =>
    Math.abs(component - expectedComponents[index]) <= COLOR_COMPONENT_TOLERANCE
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

const triggerCardBubble = async (page, cardId) => {
  const pointerPosition = await page.evaluate(
    (selector, id) => {
      const card = document.querySelector(`${selector}#${CSS.escape(id)}`);
      if (!card) {
        return null;
      }
      const rect = card.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.bottom - 6
      };
    },
    CARD_SELECTOR,
    cardId
  );
  if (!pointerPosition) {
    throw new Error(`Card "${cardId}" not found for bubble trigger`);
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
export const run = async ({ browser, baseUrl }) => {
  const page = await browser.newPage();
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
  const maxPlaceholderOverflow = placeholderSnapshots.reduce(
    (maximum, snapshot) => Math.max(maximum, snapshot.overflowBy),
    0
  );
  assertEqual(
    maxPlaceholderOverflow <= PLACEHOLDER_OVERFLOW_TOLERANCE_PX,
    true,
    `Placeholder inputs should remain within card boundaries (max overflow ${maxPlaceholderOverflow.toFixed(2)}px)`
  );
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
    return {
      brandTaglineText: taglineElement?.textContent?.trim() ?? "",
      footerShortcutText: footerShortcutElement?.textContent?.trim() ?? "",
      footerShortcutIsInFooter: Boolean(footerShortcutElement?.closest("nav.navbar.fixed-bottom")),
      shortcutInMain: Boolean(mainShortcutElement)
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
  const desktopRowCounts = await page.evaluate((cardSelector) => {
    const cards = Array.from(document.querySelectorAll(cardSelector));
    const tops = [];
    const counts = [];
    for (const card of cards) {
      const rectTop = Math.round(card.getBoundingClientRect().top);
      const existingIndex = tops.indexOf(rectTop);
      if (existingIndex === -1) {
        tops.push(rectTop);
        counts.push(1);
      } else {
        counts[existingIndex] += 1;
      }
    }
    return counts;
  }, CARD_SELECTOR);
  assertEqual(
    desktopRowCounts[0],
    EXPECTED_DESKTOP_COLUMNS,
    `Desktop grid should render ${EXPECTED_DESKTOP_COLUMNS} cards per row`
  );
  const interiorDesktopCounts = desktopRowCounts.slice(0, -1);
  const interiorDesktopConsistent =
    interiorDesktopCounts.length === 0 ||
    interiorDesktopCounts.every((count) => count === EXPECTED_DESKTOP_COLUMNS);
  assertEqual(
    interiorDesktopConsistent,
    true,
    `Each desktop row before the final partial row should contain ${EXPECTED_DESKTOP_COLUMNS} cards`
  );
  const lastRowCount = desktopRowCounts[desktopRowCounts.length - 1] ?? EXPECTED_DESKTOP_COLUMNS;
  assertEqual(
    lastRowCount <= EXPECTED_DESKTOP_COLUMNS,
    true,
    "The final desktop row should not exceed the expected column count"
  );
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

  for (const scenario of searchScenarios) {
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
    assertEqual(
      Boolean(emptyStateSnapshot),
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
  }

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

  const initialThemeMode = await page.evaluate(() => document.documentElement.getAttribute("data-bs-theme") ?? "light");
  const initialThemeSnapshot = await captureThemeSnapshot(page);
  const expectedInitialShareIconColor =
    initialThemeMode === "dark" ? SHARE_ICON_DARK_COLOR : SHARE_ICON_LIGHT_COLOR;
  assertEqual(
    colorsAreClose(initialThemeSnapshot.shareIconColor.trim(), expectedInitialShareIconColor),
    true,
    "Share icon should match the active theme color"
  );
  await triggerCardBubble(page, "p01");
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
  await triggerCardBubble(page, "p01");
  const toggledBubbleSnapshot = await snapshotBubble(page, "p01");
  assertEqual(
    toggledBubbleSnapshot !== null,
    true,
    "Bubble should render after toggling theme"
  );
  if (!toggledBubbleSnapshot) {
    throw new Error("Toggled bubble snapshot missing");
  }
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

  await page.close();
};
