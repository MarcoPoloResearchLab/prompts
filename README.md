# Prompt Bubbles

Prompt Bubbles is a browser-first prompt library styled with Bootstrap’s Materia theme and Alpine.js. The site runs entirely on static assets, provides instant search, and keeps the experience consistent across devices.

## Highlights

- **Material layout:** fixed top navigation hosts the brand, tagline, and global search; prompt cards flow in a responsive Bootstrap grid with consistent heights; the fixed footer surfaces the keyboard shortcut hint alongside the dark mode switch.
- **Inline editing:** placeholders render as inline inputs so prompts can be tailored before copying.
- **Persisted context:** the active tag and search query survive reloads through local storage.
- **Shareable cards:** each card copies a deep link and the layout highlights the linked card when visiting `#card-id`.
- **Per-card likes:** every prompt includes a bubble like toggle with a counter that persists locally and exposes proper pressed state for assistive tech.
- **Readable actions:** the copy and share controls now share the dark accent outline in light theme for higher contrast and clarity.
- **Privacy routing:** the footer surfaces a small Privacy • Terms link that navigates to the static privacy policy.
- **Sticky filters:** the tag chip bar stays affixed beneath the navbar so filters remain within reach while browsing.
- **Notifications:** copy and share actions raise an event-scoped toast; no inline handlers or global mutations.
- **Atmospheric feedback:** pressing the bubble like toggle emits a theme-aware bubble animation that fades after the interaction.

## Front-End Architecture

- **Modules:** ES modules live under `js/` (`constants.js`, `utils/`, `core/`, `ui/`, `app.js`). Alpine factories own component state; pure helpers live in `core/` and `utils/`.
- **Styling:** Bootstrap 5.3 (Materia) is sourced from CDN. Custom overrides reside in `assets/css/material.css` and respect `prefers-reduced-motion`.
- **Data:** Prompt catalog loads from `data/prompts.json` and is validated on boot before rendering.
- **Events:**  
  - `toast-show` — emitted after copy/share to display the global toast.  
  - `theme-toggle` — emitted when the footer switch changes modes.  
- `card-bubble` — dispatched by the like toggle toward the bubble layer with `{ x, y, size, riseDistance, cardTop, theme }` so the bubble originates at the interaction point and rises to the card's top edge.  
  Both events bubble within the root container so components remain DOM-scoped.

## Local Development

```bash
npm install
npm test
```

`npm test` starts a static server, launches Puppeteer, and exercises the end-to-end flows (search, filtering, copy/share, like toggles, hash highlighting, and persisted filters). The runner now prints each spec name (e.g., `Running specs/app-flows.spec.mjs`) so progress is visible in the CLI.

## Project Layout

```
assets/
  css/material.css   # custom theme refinements
data/prompts.json    # prompt catalog
js/
  constants.js
  types.d.js
  utils/
  core/
  ui/
  app.js             # Alpine composition root
tests/               # Puppeteer integration specs
```

## License

This project is proprietary software. All rights reserved by Marco Polo Research Lab. See [LICENSE](./LICENSE).
