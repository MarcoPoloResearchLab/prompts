# Migration Notes

## Overview

The PB-02 refactor replaces the bespoke layout with a Bootstrap 5 (Materia) experience powered by Alpine.js modules. The legacy global script under `assets/scripts/` has been decomposed into ES modules within `js/`, and the prompt catalog moved from `assets/data/` to `data/` with validation on load.

## UI Changes

- Fixed top navigation now combines brand, tagline, and global search; the fixed footer hosts the keyboard shortcut hint alongside the dark-mode switch.
- Prompt cards render via Alpine in a responsive Bootstrap grid (`row g-4`), guaranteeing consistent heights and Material accents.
- Card clicks now emit a floating bubble animation that mirrors the active theme for richer feedback.
- Copy/share controls emit toast notifications handled by a dedicated Alpine factory; toasts surface in the top-right corner instead of per-card banners.
- Hash deep-links highlight cards using `data-linked-card="true"` and trigger smooth scroll after render.

## Event Contracts

- `toast-show` (detail: `{ message: string }`) — dispatched by copy/share handlers; the toast region listens within the app shell.
- `theme-toggle` (detail: `{ mode: "light" | "dark" }`) — dispatched by the footer switch after applying the theme to `document.documentElement`.
- `card-bubble` (detail: `{ x: number; y: number; size: number; riseDistance: number; cardTop: number; theme: "light" | "dark" }`) — dispatched by cards to the bubble layer so bubbles travel from the click origin to the card's top edge.

## Developer Notes

- Modules live under `js/`: shared constants, utilities (clipboard, storage, logging, theming), pure core logic, and Alpine factories (`ui/`).
- Data fetches now target `./data/prompts.json`; the repository validates structure before exposing prompts and tags.
- Integration coverage runs through `npm test`, which launches Puppeteer against the static server; helpers rely on `data-test` attributes for stability.
- User-facing strings reside in `js/constants.js`; reuse constants instead of inline literals when extending the UI.
