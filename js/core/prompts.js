// @ts-check

import { DATA_PATH, TAGS } from "../constants.js";
import { normalizeWhitespace } from "../utils/string.js";

/** @typedef {import("../types.d.js").Prompt} Prompt */
/** @typedef {import("../types.d.js").PromptFilters} PromptFilters */

/**
 * @param {{ fetchImpl?: typeof fetch }} [options]
 */
export function createPromptsRepository(options = {}) {
  const fetchImpl = options.fetchImpl ?? window.fetch.bind(window);

  return {
    /**
     * @returns {Promise<Prompt[]>}
     */
    async loadAll() {
      const response = await fetchImpl(DATA_PATH);
      if (!response.ok) {
        throw new Error(`Failed to load prompts: ${response.status} ${response.statusText}`);
      }
      const payload = await response.json();
      const records = validatePayload(payload);
      return records;
    },

    /**
     * @param {Prompt[]} prompts
     * @returns {string[]}
     */
    collectTags(prompts) {
      const tagSet = new Set();
      for (const prompt of prompts) {
        for (const tag of prompt.tags) {
          tagSet.add(tag);
        }
      }
      const sortedTags = Array.from(tagSet).sort((first, second) => first.localeCompare(second));
      return [TAGS.all, ...sortedTags];
    },

    /**
     * @param {Prompt[]} prompts
     * @param {PromptFilters} filters
     * @returns {Prompt[]}
     */
    filter(prompts, filters) {
      const normalizedQuery = normalizeWhitespace(filters.searchText);
      const tokens = normalizedQuery.length > 0 ? normalizedQuery.split(/\s+/u) : [];
      return prompts.filter((prompt) => matchesPrompt(prompt, filters.tag, tokens));
    }
  };
}

/**
 * @param {unknown} payload
 * @returns {Prompt[]}
 */
function validatePayload(payload) {
  if (!Array.isArray(payload)) {
    throw new Error("Prompt catalog must be an array");
  }
  return payload.map((record) => validateRecord(record));
}

/**
 * @param {unknown} record
 * @returns {Prompt}
 */
function validateRecord(record) {
  if (typeof record !== "object" || record === null) {
    throw new Error("Prompt record must be an object");
  }
  const candidate = /** @type {Partial<Prompt>} */ (record);
  if (!candidate.id || typeof candidate.id !== "string") {
    throw new Error("Prompt record must include an id string");
  }
  if (!candidate.title || typeof candidate.title !== "string") {
    throw new Error(`Prompt ${candidate.id} must include a title string`);
  }
  if (!candidate.text || typeof candidate.text !== "string") {
    throw new Error(`Prompt ${candidate.id} must include a text string`);
  }
  if (!Array.isArray(candidate.tags) || candidate.tags.some((tag) => typeof tag !== "string")) {
    throw new Error(`Prompt ${candidate.id} must include a tags array of strings`);
  }
  return {
    id: candidate.id,
    title: candidate.title,
    text: candidate.text,
    tags: [...candidate.tags]
  };
}

/**
 * @param {Prompt} prompt
 * @param {string} activeTag
 * @param {string[]} tokens
 * @returns {boolean}
 */
function matchesPrompt(prompt, activeTag, tokens) {
  const tagMatches = activeTag === TAGS.all || prompt.tags.includes(activeTag);
  if (tokens.length === 0) {
    return tagMatches;
  }
  const haystack = normalizeWhitespace(`${prompt.title} ${prompt.text} ${prompt.tags.join(" ")}`);
  return tagMatches && tokens.every((token) => haystack.includes(token));
}
