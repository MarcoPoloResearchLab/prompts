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
const BRAND_ACCENT_COLOR = "#1976d2";
const CARD_FEEDBACK_SELECTOR = "[data-test='card-feedback']";
const COPY_FEEDBACK_MESSAGE = "Prompt copied \u2713";
const SHARE_FEEDBACK_MESSAGE = "Link copied \u2713";
const THEME_TOGGLE_SELECTOR = "#themeToggle";
const MIN_SEARCH_ADDON_PADDING_PX = 24;
const MAX_THEME_ALIGNMENT_DELTA_PX = 2;
const SHARE_ICON_LIGHT_COLOR = "rgb(13, 34, 71)";
const SHARE_ICON_DARK_COLOR = "rgb(217, 230, 255)";
const COLOR_COMPONENT_TOLERANCE = 1;

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

export const run = async ({ browser, baseUrl }) => {
  const page = await browser.newPage();
  await stubClipboard(page);
  await page.goto("about:blank");
  await page.goto(baseUrl, { waitUntil: "networkidle0" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForSelector(CARD_SELECTOR);

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
  const extraClearButtonCount = await page.evaluate(() => document.querySelectorAll("#clearSearch").length);
  assertEqual(extraClearButtonCount, 0, "Search input should not render a duplicate clear button");
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
    const emptyMessageVisible = await page.evaluate(() => {
      const messageElement = document.querySelector("[data-test='empty-state']");
      return Boolean(messageElement && messageElement.textContent?.includes("No prompts match"));
    });
    assertEqual(
      emptyMessageVisible,
      scenario.expectEmptyMessage,
      `Search scenario "${scenario.description}" should ${scenario.expectEmptyMessage ? "" : "not "}show empty message`
    );
  }

  await clearSearch(page);
  await waitForCardCount(page, initialCardIds.length);

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
