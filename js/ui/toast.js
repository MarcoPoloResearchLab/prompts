// @ts-check

import { TIMINGS } from "../constants.js";
import { createLogger } from "../utils/logging.js";

/** @typedef {import("../types.d.js").ToastDetail} ToastDetail */

/**
 * @param {{ logger?: ReturnType<typeof createLogger>, timingMs?: number }} [options]
 */
export function ToastRegion(options = {}) {
  const logger = options.logger ?? createLogger();
  const timingMs = options.timingMs ?? TIMINGS.toastDurationMs;

  return {
    isVisible: false,
    message: "",
    timeoutIdentifier: /** @type {number | null} */ (null),
    init() {
      this.$watch("isVisible", (value) => {
        if (!value) {
          this.clearTimer();
        }
      });
    },
    /**
     * @param {ToastDetail} detail
     */
    handleShow(detail) {
      if (!detail?.message) {
        logger.error("Toast requested without message");
        return;
      }
      this.message = detail.message;
      this.isVisible = true;
      this.clearTimer();
      this.timeoutIdentifier = window.setTimeout(() => {
        this.isVisible = false;
      }, timingMs);
    },
    dismiss() {
      this.isVisible = false;
    },
    clearTimer() {
      if (this.timeoutIdentifier !== null) {
        window.clearTimeout(this.timeoutIdentifier);
        this.timeoutIdentifier = null;
      }
    }
  };
}
