// @ts-check

export const DATA_PATH = "./data/prompts.json";

export const TAGS = Object.freeze({
  all: "all"
});

export const STORAGE_KEYS = Object.freeze({
  filters: "prompt-bubbles-filters",
  theme: "prompt-bubbles-theme",
  likes: "prompt-bubbles-likes"
});

export const EVENTS = Object.freeze({
  searchUpdated: "filters-search-updated",
  tagSelected: "filters-tag-selected",
  toastShow: "toast-show",
  themeToggle: "theme-toggle",
  cardBubble: "card-bubble"
});

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
  footerHint: "Press / to search • Enter to copy the focused card",
  themeToggleLabel: "Dark mode",
  footerBranding: "Prompt Bubbles",
  searchIconLabel: "Search icon",
  errorLoading: "Unable to load prompt catalog. Please refresh the page.",
  privacyLinkLabel: "Privacy • Terms",
  privacyLinkAriaLabel: "View privacy policy and terms"
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
