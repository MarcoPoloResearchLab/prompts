# Prompt Bubbles

Prompt Bubbles is a browser-first prompt library styled with Bootstrap’s Materia theme and Alpine.js. The site runs entirely on static assets, provides instant search, and keeps the experience consistent across devices.

## Highlights

- **Material layout:** fixed top navigation hosts the brand, tagline, and global search; prompt cards flow in a responsive Bootstrap grid with consistent heights; the fixed footer surfaces the keyboard shortcut hint alongside the dark mode switch.
- **Inline editing:** placeholders render as inline inputs so prompts can be tailored before copying.
- **Persisted context:** the active tag and search query survive reloads through local storage.
- **Shareable cards:** each card copies a deep link and the layout highlights the linked card when visiting `#card-id`.
- **Notifications:** copy and share actions raise an event-scoped toast; no inline handlers or global mutations.

## Front-End Architecture

- **Modules:** ES modules live under `js/` (`constants.js`, `utils/`, `core/`, `ui/`, `app.js`). Alpine factories own component state; pure helpers live in `core/` and `utils/`.
- **Styling:** Bootstrap 5.3 (Materia) is sourced from CDN. Custom overrides reside in `assets/css/material.css` and respect `prefers-reduced-motion`.
- **Data:** Prompt catalog loads from `data/prompts.json` and is validated on boot before rendering.
- **Events:**  
  - `toast-show` — emitted after copy/share to display the global toast.  
  - `theme-toggle` — emitted when the footer switch changes modes.  
  Both events bubble within the root container so components remain DOM-scoped.

## Local Development

```bash
npm install
npm test
```

`npm test` starts a static server, launches Puppeteer, and exercises the end-to-end flows (search, filtering, copy/share, hash highlighting, and persisted filters).

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
