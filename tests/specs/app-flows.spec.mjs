// @ts-check
import { assertDeepEqual, assertEqual } from "../assert.js";

const WAIT_AFTER_INTERACTION_MS = 180;
const SEARCH_INPUT_SELECTOR = "[data-test='search-input']";
const CHIP_SELECTOR = "[data-test='tag-chip']";
const CARD_SELECTOR = "[data-test='prompt-card']";
const COPY_BUTTON_SELECTOR = "[data-test='copy-button']";
const SHARE_BUTTON_SELECTOR = "[data-test='share-button']";
const TOAST_SELECTOR = "[data-test='copy-toast']";

const delay = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

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

const getToastState = (page, cardId) =>
  page.evaluate(
    (id, selector) => {
      const card = document.getElementById(id);
      if (!card) {
        return "missing";
      }
      const toast = card.querySelector(selector);
      return toast?.getAttribute("data-show") ?? "false";
    },
    cardId,
    TOAST_SELECTOR
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

  const initialCardIds = await getVisibleCardIds(page);
  assertEqual(initialCardIds.length > 0, true, "Initial load should render cards");

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

  const chipScenarios = [
    {
      label: "writing",
      verify: async () => {
        const activeChipLabels = await getActiveChipLabels(page);
        assertDeepEqual(activeChipLabels, ["writing"], "Only the writing chip should be active after selecting it");
        const allCardsTagged = await page.$$eval(CARD_SELECTOR, (cards) =>
          cards.every((card) =>
            Array.from(card.querySelectorAll(".tag")).some((tag) => tag.textContent?.trim() === "writing")
          )
        );
        assertEqual(allCardsTagged, true, "All visible cards should include the writing tag");
      }
    },
    {
      label: "all",
      verify: async () => {
        const activeChipLabels = await getActiveChipLabels(page);
        assertDeepEqual(activeChipLabels, ["all"], "All chip should become the active filter");
        const currentIds = await getVisibleCardIds(page);
        assertEqual(currentIds.length >= initialCardIds.length, true, "All chip should restore the full grid");
      }
    }
  ];

  for (const scenario of chipScenarios) {
    await clickChipByLabel(page, scenario.label);
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
  const copyToastState = await getToastState(page, "p01");
  assertEqual(copyToastState, "true", "Copy toast should appear after clicking copy");
  const copiedText = await getClipboardText(page);
  assertEqual(
    copiedText.includes("Summarize the following bug/incident"),
    true,
    "Copy action should write card text"
  );

  await page.evaluate(() => {
    window.__copiedText = "";
  });
  await clickCardButton(page, "p01", "share");
  const shareText = await getClipboardText(page);
  assertEqual(shareText.endsWith("#p01"), true, "Share button should copy card URL");

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
