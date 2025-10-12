// @ts-check

import { EVENTS, ICONS, STORAGE_KEYS, STRINGS, TAGS } from "../constants.js";
import { createPlaceholderFragment, resolvePlaceholderText } from "../core/placeholders.js";
import { createLogger } from "../utils/logging.js";
import { escapeIdentifier } from "../utils/dom.js";
import { loadJson, saveJson } from "../utils/storage.js";
import { writeText, writeUrl } from "../utils/clipboard.js";

/** @typedef {import("../types.d.js").Prompt} Prompt */
/** @typedef {import("../types.d.js").PromptFilters} PromptFilters */

const DEFAULT_FILTERS = Object.freeze({
  searchText: "",
  tag: TAGS.all
});

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
    init() {
      this.restoreFilters();
      this.$watch("filters.searchText", () => {
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
    },
    persistFilters() {
      saveJson(STORAGE_KEYS.filters, this.filters);
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
    applyFilters() {
      this.filteredPrompts = promptsRepository.filter(this.prompts, this.filters);
      requestAnimationFrame(() => this.highlightLinkedCard());
    },
    clearSearch() {
      this.filters.searchText = "";
      const searchInput = this.$refs.searchInput;
      if (searchInput instanceof HTMLInputElement) {
        searchInput.focus();
      }
    },
    selectTag(tag) {
      this.filters.tag = tag;
    },
    isActiveTag(tag) {
      return this.filters.tag === tag;
    },
    /**
     * @param {HTMLElement} textContainer
     * @param {string} content
     */
    renderPromptText(textContainer, content) {
      textContainer.replaceChildren(createPlaceholderFragment(content));
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
      const textElement = cardElement.querySelector("[data-role='prompt-text']");
      if (!(textElement instanceof HTMLElement)) {
        logger.error("Copy requested without prompt text element");
        return;
      }
      const resolvedText = resolvePlaceholderText(textElement).trim();
      await writeText(resolvedText);
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
      this.$dispatch(EVENTS.toastShow, { message: STRINGS.shareToast });
      requestAnimationFrame(() => this.highlightLinkedCard());
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
    /**
     * @returns {string}
     */
    emptyMessage() {
      return STRINGS.noMatches;
    }
  };
}
