# Migration Notes

## Overview

The PB-02 refactor replaces the bespoke layout with a Bootstrap 5 (Materia) experience powered by Alpine.js modules. The legacy global script under `assets/scripts/` has been decomposed into ES modules within `js/`, and the prompt catalog moved from `assets/data/` to `data/` with validation on load.

## UI Changes

- Fixed top navigation now combines brand, tagline, and global search; the fixed footer hosts the keyboard shortcut hint alongside the dark-mode switch.
- Prompt cards render via Alpine in a responsive Bootstrap grid (`row g-4`), guaranteeing consistent heights and Material accents.
- The bubble like toggle now emits a floating animation that mirrors the active theme for richer feedback.
- Copy/share controls emit toast notifications handled by a dedicated Alpine factory; toasts surface in the top-right corner instead of per-card banners.
- Card action rows now include a bubble like toggle; the button tracks a local count, reflects pressed state, and sits between copy and share.
- Copy and share buttons in light theme share the dark accent token so both labels remain legible against the outline treatment.
- The footer now includes a small Privacy • Terms link that routes to a standalone policy page under `/privacy/`.
- The tag chip bar now lives in a sticky capsule beneath the navbar so filters remain accessible while scrolling.
- Hash deep-links highlight cards using `data-linked-card="true"` and trigger smooth scroll after render.

## Event Contracts

- `toast-show` (detail: `{ message: string }`) — dispatched by copy/share handlers; the toast region listens within the app shell.
- `theme-toggle` (detail: `{ mode: "light" | "dark" }`) — dispatched by the footer switch after applying the theme to `document.documentElement`.
- `card-bubble` (detail: `{ x: number; y: number; size: number; riseDistance: number; cardTop: number; theme: "light" | "dark" }`) — dispatched by the like toggle to the bubble layer so bubbles travel from the interaction point to the card's top edge.

## Developer Notes

- Modules live under `js/`: shared constants, utilities (clipboard, storage, logging, theming), pure core logic, and Alpine factories (`ui/`).
- Data fetches now target `./data/prompts.json`; the repository validates structure before exposing prompts and tags.
- Like state persists through `localStorage` using the `prompt-bubbles-likes` key; `AppShell` owns helpers for toggling, persistence, and accessibility labels.
- Copy button styles rely on the new `--app-copy-button-*` tokens injected in `assets/css/material.css`; update those variables when adjusting action colors.
- Sticky filter styling is driven by `--app-filter-bar-*` tokens and the `.app-filter-bar` container; keep offsets in sync with the fixed top navbar height.
- The Puppeteer runner (`tests/run-tests.mjs`) announces each spec and seeds `window.__PROMPT_BUBBLES_RUNNER_PROGRESS`; call the provided `announceProgress` helper when wiring additional specs.
- Integration coverage runs through `npm test`, which launches Puppeteer against the static server; helpers rely on `data-test` attributes for stability.
- User-facing strings reside in `js/constants.js`; reuse constants instead of inline literals when extending the UI.
