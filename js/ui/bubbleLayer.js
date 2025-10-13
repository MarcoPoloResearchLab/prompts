// @ts-check

import { TIMINGS } from "../constants.js";
import { createLogger } from "../utils/logging.js";

const MAX_ACTIVE_BUBBLES = 6;
const DEFAULT_THEME = "light";
const MINIMUM_BUBBLE_SIZE = 24;

/**
 * @typedef {{ id: string; x: number; y: number; size: number; theme: "light" | "dark" }} Bubble
 */

/**
 * @param {{ logger?: ReturnType<typeof createLogger> }} [dependencies]
 */
export function BubbleLayer(dependencies = {}) {
  const logger = dependencies?.logger ?? createLogger();

  return {
    /** @type {Bubble[]} */
    bubbles: [],
    /**
     * @param {{ x?: number; y?: number; size?: number; theme?: string }} detail
     */
    spawn(detail) {
      if (
        !detail ||
        typeof detail.x !== "number" ||
        typeof detail.y !== "number" ||
        typeof detail.size !== "number"
      ) {
        logger.error("Bubble detail missing required coordinates", detail);
        return;
      }
      const theme = detail.theme === "dark" ? "dark" : DEFAULT_THEME;
      const identifier =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const bubble = {
        id: identifier,
        x: detail.x,
        y: detail.y,
        size: Math.max(MINIMUM_BUBBLE_SIZE, detail.size),
        theme
      };
      const trimmedBubbles =
        this.bubbles.length >= MAX_ACTIVE_BUBBLES
          ? this.bubbles.slice(this.bubbles.length - (MAX_ACTIVE_BUBBLES - 1))
          : this.bubbles;
      this.bubbles = [...trimmedBubbles, bubble];
      window.setTimeout(() => {
        this.remove(identifier);
      }, TIMINGS.bubbleLifetimeMs);
    },
    /**
     * @param {string} identifier
     */
    remove(identifier) {
      this.bubbles = this.bubbles.filter((bubble) => bubble.id !== identifier);
    },
    /**
     * @param {Bubble} bubble
     * @returns {string}
     */
    styleFor(bubble) {
      const halfSize = bubble.size / 2;
      const left = bubble.x - halfSize;
      const top = bubble.y - halfSize;
      return [
        `left:${left}px`,
        `top:${top}px`,
        `width:${bubble.size}px`,
        `height:${bubble.size}px`,
        `animation-duration:${TIMINGS.bubbleLifetimeMs}ms`
      ].join(";");
    }
  };
}
