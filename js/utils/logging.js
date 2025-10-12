// @ts-check

/**
 * @returns {{ error: (message: string, detail?: unknown) => void }}
 */
export function createLogger() {
  return {
    /**
     * @param {string} message
     * @param {unknown} detail
     * @returns {void}
     */
    error(message, detail) {
      console.error(`[PromptBubbles] ${message}`, detail);
    }
  };
}
