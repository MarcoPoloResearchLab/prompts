// @ts-check

import { EVENTS, ICONS, STORAGE_KEYS, STRINGS, TAGS, TIMINGS } from "../constants.js";
import { createPlaceholderFragment, resolvePlaceholderText } from "../core/placeholders.js";
import { createLogger } from "../utils/logging.js";
import { escapeIdentifier } from "../utils/dom.js";
import { loadJson, saveJson } from "../utils/storage.js";
import { writeText, writeUrl } from "../utils/clipboard.js";

/** @typedef {import("../types.d.js").Prompt} Prompt */
/** @typedef {import("../types.d.js").PromptFilters} PromptFilters */
/** @typedef {import("../types.d.js").PromptLikeCounts} PromptLikeCounts */

const DEFAULT_FILTERS = Object.freeze({
  searchText: "",
  tag: TAGS.all
});

const CARD_FEEDBACK_VARIANTS = Object.freeze({
  copy: "text-success",
  share: "text-info"
});

/**
 * @returns {PromptLikeCounts}
 */
function createLikeCountMap() {
  return /** @type {PromptLikeCounts} */ (Object.create(null));
}

/**
 * @param {unknown} value
 * @returns {PromptLikeCounts}
 */
function sanitizeLikeCounts(value) {
  const sanitized = createLikeCountMap();
  if (!value || typeof value !== "object") {
    return sanitized;
  }
  const entries = Object.entries(value);
  for (const [rawKey, rawCount] of entries) {
    if (typeof rawKey !== "string" || rawKey.trim().length === 0) {
      continue;
    }
    const numericCount =
      typeof rawCount === "number" && Number.isFinite(rawCount)
        ? rawCount
        : Number.parseInt(String(rawCount), 10);
    if (Number.isFinite(numericCount) && numericCount >= 1) {
      sanitized[rawKey] = 1;
    }
  }
  return sanitized;
}

/**
 * @param {PromptLikeCounts} likeCounts
 * @param {Set<string>} allowedIds
 * @returns {PromptLikeCounts}
 */
function pruneLikeCounts(likeCounts, allowedIds) {
  const pruned = createLikeCountMap();
  const entries = Object.entries(likeCounts);
  for (const [identifier, count] of entries) {
    if (!allowedIds.has(identifier)) {
      continue;
    }
    if (Number.isFinite(count) && count >= 1) {
      pruned[identifier] = 1;
    }
  }
  return pruned;
}

/**
 * @param {{ promptsRepository: ReturnType<typeof import("../core/prompts.js").createPromptsRepository>, logger?: ReturnType<typeof createLogger> }} dependencies
 */
export function AppShell(dependencies) {
  const promptsRepository = dependencies.promptsRepository;
  const logger = dependencies.logger ?? createLogger();

  return {
    strings: STRINGS,
    isLoading: true,
    hasError: false,
    prompts: /** @type {Prompt[]} */ ([]),
    filteredPrompts: /** @type {Prompt[]} */ ([]),
    tags: /** @type {string[]} */ ([]),
    filters: /** @type {PromptFilters} */ ({ ...DEFAULT_FILTERS }),
    searchHasText: false,
    likeCountsById: createLikeCountMap(),
    cardFeedbackById: Object.create(null),
    cardFeedbackTimers: Object.create(null),
    init() {
      this.restoreFilters();
      this.restoreLikes();
      this.$watch("filters.searchText", (value) => {
        this.searchHasText = typeof value === "string" && value.trim().length > 0;
        this.persistFilters();
        this.applyFilters();
      });
      this.$watch("filters.tag", () => {
        this.persistFilters();
        this.applyFilters();
      });
      window.addEventListener("hashchange", () => {
        this.highlightLinkedCard();
      });
      window.addEventListener("keydown", (event) => {
        this.handleGlobalKeydown(event);
      });
      this.loadPrompts();
    },
    handleGlobalKeydown(event) {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }
      if (event.key === "/" && this.$refs.searchInput instanceof HTMLInputElement) {
        if (document.activeElement === this.$refs.searchInput) {
          return;
        }
        event.preventDefault();
        this.$refs.searchInput.focus();
        this.$refs.searchInput.select();
      }
    },
    async loadPrompts() {
      try {
        this.prompts = await promptsRepository.loadAll();
        this.tags = promptsRepository.collectTags(this.prompts);
        this.pruneStoredLikes();
        this.applyFilters();
      } catch (error) {
        this.hasError = true;
        logger.error("Unable to load prompts", error);
      } finally {
        this.isLoading = false;
        requestAnimationFrame(() => this.highlightLinkedCard());
      }
    },
    restoreFilters() {
      const storedFilters = loadJson(STORAGE_KEYS.filters, DEFAULT_FILTERS);
      this.filters = { ...DEFAULT_FILTERS, ...storedFilters };
      const currentSearchValue = this.filters.searchText;
      this.searchHasText = typeof currentSearchValue === "string" && currentSearchValue.trim().length > 0;
    },
    persistFilters() {
      saveJson(STORAGE_KEYS.filters, this.filters);
    },
    restoreLikes() {
      const storedLikes = loadJson(STORAGE_KEYS.likes, createLikeCountMap());
      this.likeCountsById = sanitizeLikeCounts(storedLikes);
    },
    persistLikes() {
      saveJson(STORAGE_KEYS.likes, this.likeCountsById);
    },
    pruneStoredLikes() {
      const allowedIds = new Set(this.prompts.map((prompt) => prompt.id));
      this.likeCountsById = pruneLikeCounts(this.likeCountsById, allowedIds);
      this.persistLikes();
    },
    forwardToast(detail) {
      if (!detail || typeof detail.message !== "string") {
        logger.error("Toast detail missing message", detail);
        return;
      }
      const toastRegion = this.$root.querySelector("[data-role='toast-region']");
      if (!(toastRegion instanceof HTMLElement)) {
        logger.error("Toast region missing");
        return;
      }
      this.$root.setAttribute("data-last-toast", detail.message);
      toastRegion.dispatchEvent(new CustomEvent("toast-show-internal", { detail, bubbles: false }));
    },
    clearSearch() {
      this.filters.searchText = "";
      this.searchHasText = false;
      if (this.$refs.searchInput instanceof HTMLInputElement) {
        this.$refs.searchInput.focus();
      }
    },
    applyFilters() {
      this.filteredPrompts = promptsRepository.filter(this.prompts, this.filters);
      requestAnimationFrame(() => this.highlightLinkedCard());
    },
    selectTag(tag) {
      this.filters.tag = tag;
    },
    isActiveTag(tag) {
      return this.filters.tag === tag;
    },
    /**
     * @param {string} cardId
     * @returns {number}
     */
    likeCountValue(cardId) {
      const storedValue = this.likeCountsById[cardId];
      if (typeof storedValue !== "number" || !Number.isFinite(storedValue)) {
        return 0;
      }
      return storedValue >= 1 ? 1 : 0;
    },
    /**
     * @param {string} cardId
     * @returns {string}
     */
    likeCountDisplay(cardId) {
      return String(this.likeCountValue(cardId));
    },
    /**
     * @param {string} cardId
     * @returns {boolean}
     */
    isCardLiked(cardId) {
      return this.likeCountValue(cardId) >= 1;
    },
    likeButtonClass(cardId) {
      return this.isCardLiked(cardId) ? "btn-primary" : "btn-outline-primary";
    },
    /**
     * @param {Prompt} prompt
     * @returns {string}
     */
    likeButtonAriaLabel(prompt) {
      const likeCount = this.likeCountValue(prompt.id);
      const stateHint = this.isCardLiked(prompt.id) ? STRINGS.likeButtonActiveHint : STRINGS.likeButtonInactiveHint;
      return `${STRINGS.likeButtonAriaPrefix} ${prompt.title}. ${STRINGS.likeButtonCountPrefix} ${likeCount}. ${stateHint}`;
    },
    /**
     * @param {string} cardId
     * @returns {void}
     */
    toggleLike(cardId) {
      if (typeof cardId !== "string") {
        logger.error("Like toggle requested without identifier");
        return;
      }
      const trimmedCardId = cardId.trim();
      if (trimmedCardId.length === 0) {
        logger.error("Like toggle requested without identifier");
        return;
      }
      const promptExists = this.prompts.some((prompt) => prompt.id === trimmedCardId);
      if (!promptExists) {
        logger.error("Like toggle requested for unknown card", trimmedCardId);
        return;
      }
      const isCurrentlyLiked = this.isCardLiked(trimmedCardId);
      const nextCounts = { ...this.likeCountsById };
      if (isCurrentlyLiked) {
        delete nextCounts[trimmedCardId];
      } else {
        nextCounts[trimmedCardId] = 1;
      }
      this.likeCountsById = sanitizeLikeCounts(nextCounts);
      this.persistLikes();
    },
    /**
     * @param {HTMLElement} textContainer
     * @param {string} content
     */
    renderPromptText(textContainer, content) {
      textContainer.replaceChildren(createPlaceholderFragment(content));
    },
    setCardFeedback(cardId, message, variantKey) {
      if (typeof cardId !== "string" || cardId.length === 0) {
        logger.error("Card feedback requested without identifier");
        return;
      }
      const nextClassName = CARD_FEEDBACK_VARIANTS[variantKey] ?? CARD_FEEDBACK_VARIANTS.copy;
      this.cardFeedbackById = {
        ...this.cardFeedbackById,
        [cardId]: { message, className: nextClassName }
      };
      const activeTimer = this.cardFeedbackTimers[cardId];
      if (typeof activeTimer === "number") {
        window.clearTimeout(activeTimer);
      }
      this.cardFeedbackTimers[cardId] = window.setTimeout(() => {
        const remainingFeedback = { ...this.cardFeedbackById };
        delete remainingFeedback[cardId];
        this.cardFeedbackById = remainingFeedback;
        delete this.cardFeedbackTimers[cardId];
      }, TIMINGS.cardFeedbackDurationMs);
    },
    /**
     * @param {Event} event
     */
    async copyCard(event) {
      const cardElement = this.findCardElement(event.currentTarget);
      if (!cardElement) {
        logger.error("Copy requested without card context");
        return;
      }
      const cardIdentifier = cardElement.id;
      if (!cardIdentifier) {
        logger.error("Copy requested without card identifier");
        return;
      }
      const textElement = cardElement.querySelector("[data-role='prompt-text']");
      if (!(textElement instanceof HTMLElement)) {
        logger.error("Copy requested without prompt text element");
        return;
      }
      const resolvedText = resolvePlaceholderText(textElement).trim();
      await writeText(resolvedText);
      this.setCardFeedback(cardIdentifier, STRINGS.copyToast, "copy");
      this.$dispatch(EVENTS.toastShow, { message: STRINGS.copyToast });
    },
    /**
     * @param {Event} event
     * @param {Prompt} prompt
     */
    async shareCard(event, prompt) {
      const baseUrl = window.location.href.split("#")[0];
      const cardUrl = `${baseUrl}#${prompt.id}`;
      await writeUrl(cardUrl);
      window.history.replaceState({}, "", `#${prompt.id}`);
      this.setCardFeedback(prompt.id, STRINGS.shareToast, "share");
      this.$dispatch(EVENTS.toastShow, { message: STRINGS.shareToast });
      requestAnimationFrame(() => this.highlightLinkedCard());
    },
    /**
     * @param {Event} event
     */
    handleCardClick(event) {
      const target = event?.currentTarget ?? event?.target ?? null;
      const cardElement = this.findCardElement(target);
      if (!cardElement) {
        logger.error("Bubble requested without card context");
        return;
      }
      const bubbleDetail = this.createBubbleDetail(cardElement, event);
      if (!bubbleDetail) {
        logger.error("Bubble detail missing coordinates");
        return;
      }
      const bubbleLayerHost = this.$root.querySelector("[data-role='bubble-layer']");
      if (!(bubbleLayerHost instanceof HTMLElement)) {
        logger.error("Bubble layer host missing");
        return;
      }
      bubbleLayerHost.dispatchEvent(new CustomEvent(EVENTS.cardBubble, { detail: bubbleDetail }));
    },
    /**
     * @param {Event} event
     */
    handleCardKeydown(event) {
      if (event instanceof KeyboardEvent && event.key === "Enter") {
        event.preventDefault();
        this.copyCard(event);
      }
    },
    highlightLinkedCard() {
      const gridElement = this.$refs.grid;
      if (!(gridElement instanceof HTMLElement)) {
        return;
      }
      gridElement.querySelectorAll("[data-linked-card='true']").forEach((element) => {
        element.removeAttribute("data-linked-card");
      });
      const hashValue = window.location.hash.slice(1);
      if (!hashValue) {
        return;
      }
      const targetCard = gridElement.querySelector(`#${escapeIdentifier(hashValue)}`);
      if (targetCard instanceof HTMLElement) {
        targetCard.setAttribute("data-linked-card", "true");
        targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    /**
     * @param {unknown} target
     * @returns {HTMLElement | null}
     */
    findCardElement(target) {
      if (!(target instanceof HTMLElement)) {
        return null;
      }
      return target.closest("[data-test='prompt-card']");
    },
    icon(name) {
      return ICONS[name];
    },
    /**
     * @param {string} tag
     * @returns {string}
     */
    chipLabel(tag) {
      return tag;
    },
    cardFeedbackClass(cardId) {
      const feedback = this.cardFeedbackById[cardId];
      return feedback?.className ?? CARD_FEEDBACK_VARIANTS.copy;
    },
    /**
     * @returns {string}
     */
    emptyMessage() {
      return STRINGS.noMatches;
    },
    /**
     * @param {HTMLElement} cardElement
     * @param {Event} event
     * @returns {{ x: number; y: number; size: number; theme: "light" | "dark"; riseDistance: number } | null}
     */
    createBubbleDetail(cardElement, event) {
      const rect = cardElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return null;
      }
      const defaultX = rect.left + rect.width / 2;
      const defaultY = rect.top + rect.height / 2;
      const hasPointerEvent = typeof PointerEvent !== "undefined";
      const isPointerEvent = hasPointerEvent && event instanceof PointerEvent;
      const isMouseEvent = event instanceof MouseEvent;
      const clientX = isPointerEvent || isMouseEvent ? event.clientX : defaultX;
      const clientY = isPointerEvent || isMouseEvent ? event.clientY : defaultY;
      const bubbleSize = rect.width * 0.25;
      const bubbleRadius = bubbleSize / 2;
      const targetCenterY = rect.top + bubbleRadius;
      const currentCenterY = clientY;
      const riseDistance = Math.max(0, currentCenterY - targetCenterY);
      const themeAttribute = document.documentElement.getAttribute("data-bs-theme");
      return {
        x: clientX,
        y: clientY,
        size: bubbleSize,
        riseDistance,
        cardTop: rect.top,
        theme: themeAttribute === "dark" ? "dark" : "light"
      };
    }
  };
}
