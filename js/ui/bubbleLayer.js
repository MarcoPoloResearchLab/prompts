// @ts-check

import { BUBBLE_CONFIG, TIMINGS } from "../constants.js";
import { createLogger } from "../utils/logging.js";
import { THEMES } from "../utils/theme.js";

/**
 * @typedef {{
 *   id: string;
 *   x: number;
 *   y: number;
 *   size: number;
 *   theme: "light" | "dark";
 *   translateY: number;
 *   scaleEnd: number;
 *   direction: "forward" | "reverse";
 *   cardTop: number;
 *   cardBottom: number;
 *   finalY: number;
 *   targetSize: number;
 * }} Bubble
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
     * @param {{ originX?: number; originY?: number; targetY?: number; originSize?: number; targetSize?: number; theme?: string; direction?: string; cardTop?: number; cardBottom?: number; cardLeft?: number; cardRight?: number }} detail
     */
    spawn(detail) {
      if (
        !detail ||
        typeof detail.originX !== "number" ||
        typeof detail.originY !== "number" ||
        typeof detail.targetY !== "number" ||
        typeof detail.originSize !== "number" ||
        typeof detail.targetSize !== "number"
      ) {
        logger.error("Bubble detail missing required coordinates", detail);
        return;
      }
      const theme = detail.theme === THEMES.dark ? THEMES.dark : THEMES.light;
      const identifier =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const startSize = Math.max(BUBBLE_CONFIG.minSizePx, detail.originSize);
      const targetSize = Math.max(BUBBLE_CONFIG.minSizePx, detail.targetSize);
      const startRadius = startSize / 2;
      const targetRadius = targetSize / 2;
      const cardTop = Number.isFinite(detail.cardTop) ? detail.cardTop : detail.originY - startRadius;
      const cardBottom = Number.isFinite(detail.cardBottom) ? detail.cardBottom : detail.originY + startRadius;
      const cardLeft = Number.isFinite(detail.cardLeft) ? detail.cardLeft : detail.originX - startRadius;
      const cardRight = Number.isFinite(detail.cardRight) ? detail.cardRight : detail.originX + startRadius;
      const clampX = (value, radius) => {
        const minimum = cardLeft + radius + BUBBLE_CONFIG.cardPaddingPx;
        const maximum = cardRight - radius - BUBBLE_CONFIG.cardPaddingPx;
        return Math.min(Math.max(value, minimum), maximum);
      };
      const clampY = (value, radius) => {
        const minimum = cardTop + radius + BUBBLE_CONFIG.cardPaddingPx;
        const maximum = cardBottom - radius - BUBBLE_CONFIG.cardPaddingPx;
        return Math.min(Math.max(value, minimum), maximum);
      };
      const largestRadius = Math.max(startRadius, targetRadius);
      const clampedOriginX = clampX(detail.originX, largestRadius);
      const clampedOriginY = clampY(detail.originY, startRadius);
      const clampedTargetY = clampY(detail.targetY, targetRadius);
      let translateY = clampedTargetY - clampedOriginY;
      if (Math.abs(translateY) < BUBBLE_CONFIG.minTravelPx) {
        const travelSign = translateY >= 0 ? 1 : -1;
        translateY = travelSign * BUBBLE_CONFIG.minTravelPx;
      }
      const finalY = clampedOriginY + translateY;
      const scaleEnd = targetSize / startSize;
      const direction = detail.direction === "reverse" ? "reverse" : "forward";
      const bubble = {
        id: identifier,
        x: clampedOriginX,
        y: clampedOriginY,
        size: startSize,
        translateY,
        scaleEnd,
        direction,
        cardTop,
        cardBottom,
        finalY,
        targetSize,
        theme
      };
      if (window.__PROMPT_BUBBLES_TESTING__ === true) {
        window.__lastBubbleState = {
          distance: Math.abs(translateY),
          translateY,
          direction,
          originY: clampedOriginY,
          finalY,
          originSize: startSize,
          targetSize
        };
      }
      const trimmedBubbles =
        this.bubbles.length >= BUBBLE_CONFIG.maxActiveBubbles
          ? this.bubbles.slice(this.bubbles.length - (BUBBLE_CONFIG.maxActiveBubbles - 1))
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
        `animation-duration:${TIMINGS.bubbleLifetimeMs}ms`,
        `--app-bubble-translate-y:${bubble.translateY}px`,
        `--app-bubble-scale-end:${bubble.scaleEnd}`
      ].join(";");
    }
  };
}
