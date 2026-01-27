// @ts-check

export const DATA_PATH = "/data/prompts.json";

export const PATHS = Object.freeze({
  privacy: "/privacy/",
  logoutRedirect: "#top"
});

export const TAGS = Object.freeze({
  all: "all"
});

export const STORAGE_KEYS = Object.freeze({
  filters: "prompt-bubbles-filters",
  theme: "prompt-bubbles-theme",
  likes: "prompt-bubbles-likes"
});

export const EVENTS = Object.freeze({
  toastShow: "toast-show",
  cardBubble: "card-bubble"
});

export const FOOTER_PROJECTS = Object.freeze([
  Object.freeze({ label: "Marco Polo Research Lab", url: "https://mprlab.com" }),
  Object.freeze({ label: "Gravity Notes", url: "https://gravity.mprlab.com" }),
  Object.freeze({ label: "LoopAware", url: "https://loopaware.mprlab.com" }),
  Object.freeze({ label: "Allergy Wheel", url: "https://allergy.mprlab.com" }),
  Object.freeze({ label: "Social Threader", url: "https://threader.mprlab.com" }),
  Object.freeze({ label: "RSVP", url: "https://rsvp.mprlab.com" }),
  Object.freeze({ label: "Countdown Calendar", url: "https://countdown.mprlab.com" }),
  Object.freeze({ label: "LLM Crossword", url: "https://llm-crossword.mprlab.com" }),
  Object.freeze({ label: "Prompt Bubbles", url: "https://prompts.mprlab.com" }),
  Object.freeze({ label: "Wallpapers", url: "https://wallpapers.mprlab.com" })
]);

export const STRINGS = Object.freeze({
  appTitle: "Prompt Bubbles",
  brandTagline: "Built for instant prompt workflows.",
  subtitle: "A visually stunning, zero-backend gallery of copy-ready prompts.",
  searchPlaceholder: "Search prompts (title, text, tags)…",
  searchAriaLabel: "Search prompts",
  noMatches: "No prompts match your search",
  copyButtonLabel: "Copy",
  copyAriaLabelPrefix: "Copy prompt:",
  shareAriaLabelPrefix: "Copy card link:",
  shareButtonLabel: "Share",
  clearSearchLabel: "Clear search",
  copyToast: "Prompt copied ✓",
  shareToast: "Link copied ✓",
  likeButtonLabel: "Like",
  likeButtonAriaPrefix: "Toggle like for",
  likeButtonCountPrefix: "Current likes:",
  likeButtonActiveHint: "Click to remove your like.",
  likeButtonInactiveHint: "Click to add your like.",
  toastDismiss: "Dismiss notification",
  tagFilterLabel: "Tag filters",
  allTagChipLabel: "★ ALL",
  footerHint: "Press / to search • Enter to copy the focused card",
  footerMenuLabel: "Built By Marco Polo Research Lab",
  themeToggleLabel: "Dark mode",
  searchIconLabel: "Search icon",
  errorLoading: "Unable to load prompt catalog. Please refresh the page.",
  privacyLinkLabel: "Privacy • Terms",
  signOutLabel: "Sign out",
  signInToast: "Welcome back!",
  signOutToast: "You have been signed out.",
  authErrorToast: "Sign in failed. Please try again."
});

const TAUTH_FALLBACK_ORIGIN = "https://computercat.tyemirov.net:4443";

/**
 * @returns {string}
 */
function resolveTauthUrl() {
  if (typeof window === "undefined" || !window.location) {
    return TAUTH_FALLBACK_ORIGIN;
  }
  const origin = window.location.origin;
  if (typeof origin !== "string" || origin.trim().length === 0) {
    return TAUTH_FALLBACK_ORIGIN;
  }
  return origin;
}

/**
 * Authentication configuration
 * Override via environment or runtime configuration
 */
export const AUTH_CONFIG = Object.freeze({
  tauthUrl: resolveTauthUrl(),
  googleClientId: "761199429759-ftho7a14blghha4j8bifetrelor0u6sn.apps.googleusercontent.com",
  tenantId: "prompt-bubbles",
  noncePath: "/auth/nonce",
  loginPath: "/auth/google",
  logoutPath: "/auth/logout"
});

export const AUTH_BUTTON_CONFIG = Object.freeze({
  text: "signin_with",
  size: "large",
  theme: "outline"
});

export const BUBBLE_CONFIG = Object.freeze({
  minSizePx: 24,
  cardPaddingPx: 2,
  minTravelPx: 12,
  maxActiveBubbles: 6
});

export const TIMINGS = Object.freeze({
  searchDebounceMs: 180,
  toastDurationMs: 1800,
  cardFeedbackDurationMs: 2400,
  bubbleLifetimeMs: 1700
});

export const ICONS = Object.freeze({
  copy: "content_copy",
  share: "share",
  like: "bubble_chart"
});
