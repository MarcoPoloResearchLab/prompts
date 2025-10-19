# PROJECT BRIEF — Build `mpr-ui.js` (Shared UI Library, CDN-first, Alpine-ready)

## Objectives (non-negotiable)

1. **Single file runtime:** Produce a single, dependency-free browser file `mpr-ui.js` (no bundlers, no npm required for runtime).
2. **CDN-loadable:** Must work when included via `<script defer src="https://cdn.jsdelivr.net/gh/MarcoPoloResearchLab/mpr-ui@1.0.0/mpr-ui.js"></script>`.
3. **Alpine.js integration:** Provide Alpine data factories so pages can use `x-data="mprHeader(...)"`, `x-data="mprFooter(...)"`, etc. Must also expose an imperative API on `window.MPRUI`.
4. **Per-site variation:** Support theming via CSS custom properties and option objects; content via JSON options or `data-*` attributes. No waiting for extra fetches.
5. **A11y & semantics:** Proper roles/labels, keyboard focus visible, sensible landmarks (`role="banner"`, `role="contentinfo"`, `nav[aria-label]`).
6. **Security & CSP-friendly:** No inline event handlers; no `eval`; sanitize text insertions; only set `innerHTML` on controlled templates.
7. **Performance:** Minimal bytes, zero external requests, render immediately after `alpine:init`. No FOUC on core areas.
8. **Code quality:** No single-letter variables; descriptive names only. No comments except a top-of-file short header. ES2015+ compatible in evergreen browsers.

## Deliverables (files & versions)

Create a new public repo `MarcoPoloResearchLab/mpr-ui` with the following files:

```
/
  LICENSE
  README.md
  CHANGELOG.md
  mpr-ui.js
  examples/
    index.basic.html
    index.data-attributes.html
    index.shadow-dom.html
    index.multiple-components.html
  tests/
    manual-checklist.md
    smoke.html
    (optional) puppeteer.smoke.js
```

Then:

* Commit as `feat: initial public release (header, footer, notice, breadcrumbs)`.
* Tag `v1.0.0`.
* Ensure the code works when loaded from jsDelivr using both `@1.0.0` and `@<commit-hash>`.

## Public API (runtime, in browser)

### Global namespace

* `window.MPRUI.renderHeader(element, options)`
* `window.MPRUI.renderFooter(element, options)`
* `window.MPRUI.renderNotice(element, options)`
* `window.MPRUI.renderBreadcrumbs(element, options)`
* Optional Shadow DOM variants: `window.MPRUI.attachShadow: boolean` (default `false`)

### Alpine.js data factories

Registered at `alpine:init`:

* `mprHeader(options)`
* `mprFooter(options)`
* `mprNotice(options)`
* `mprBreadcrumbs(options)`

Usage:

```html
<div x-data='mprHeader({ siteName: "Moving Maps", navItems: [...] })' x-init="init()"></div>
```

### Options schema

* **Common** `theme` supports CSS variables override or direct values:

  * Header: `headerBackground`, `headerForeground`, `headerAccent`
  * Footer: `footerBackground`, `footerForeground`
  * Notice: `noticeBackground`, `noticeForeground`, `noticeAccent`
  * Breadcrumbs: `crumbForeground`, `crumbMuted`, `separator`
* **Header**: `siteName` (string), `siteLink` (string), `logoUrl` (string), `navItems` (array of `{label, href}`), `cta` (`{label, href}`)
* **Footer**: `lines` (array of strings), `copyrightName` (string)
* **Notice**: `kind` enum `["info","success","warning","danger"]`, `text` (string), `closable` (bool, default `true`)
* **Breadcrumbs**: `items` (array of `{label, href|null}`), last item is current page (if `href` missing)

### `data-*` attribute fallbacks

Each component reads from its element’s dataset (strings or JSON):

* Header: `data-site-name`, `data-site-link`, `data-logo-url`, `data-nav-items`, `data-cta`, theme overrides like `data-header-bg`, `data-header-fg`, `data-header-accent`
* Footer: `data-lines`, `data-copyright-name`, `data-footer-bg`, `data-footer-fg`
* Notice: `data-kind`, `data-text`, `data-closable`, `data-notice-bg`, `data-notice-fg`, `data-notice-accent`
* Breadcrumbs: `data-items`, `data-crumb-fg`, `data-crumb-muted`, `data-separator`

### Theming via CSS variables (site-level)

Support these defaults (sites may override via `:root`):

```
--mpr-header-bg
--mpr-header-fg
--mpr-header-accent
--mpr-footer-bg
--mpr-footer-fg
--mpr-notice-bg
--mpr-notice-fg
--mpr-notice-accent
--mpr-crumb-fg
--mpr-crumb-muted
--mpr-separator
```

## Component requirements (HTML structure & a11y)

### Header

* `<header role="banner">`
* Brand link `<a class="mpr-brand" href="...">[img.logo][span name]</a>`
* `<nav class="mpr-nav" aria-label="Main">` list of links
* Optional CTA `<a class="mpr-cta">`
* Mobile: wrap gracefully, no JS hamburger required (keep simple)
* Focus styles visible for all links

### Footer

* `<footer role="contentinfo">`
* One to many `<small>` lines + `© YEAR NAME`

### Notice

* `<section role="status" aria-live="polite">` (or `role="alert"` if `kind="danger"`)
* Optional close button with `aria-label="Dismiss"`
* No persistence; closing only hides the element

### Breadcrumbs

* `<nav aria-label="Breadcrumb">`
* List of items separated by a text separator (default `"/"`), last item marked as current: `aria-current="page"`

## Implementation details

1. **Single style injector:** Insert one `<style id="mpr-ui-style">` with all component styles. Skip if present.
2. **Sanitization:** Sanitize all text nodes (escape `&<>"'`). Only allow `href`/`src` on anchors/img after escaping; do not allow `javascript:` URLs.
3. **Rendering:** Build strings and set `element.innerHTML = ...` once per render to minimize layout thrash.
4. **Alpine hookup:** Register an Alpine plugin on `alpine:init` that exposes factories:

   * Each factory merges `incoming options` + `data-*`.
   * Each factory returns `{ initialized: false, init(){ renderX(this.$el, merged); this.initialized = true; } }`.
5. **Shadow DOM (optional flag):** If `window.MPRUI.attachShadow === true`, render into a closed shadow root and inject a duplicate `<style>` there. Call `Alpine.initTree(shadowRoot)` if Alpine is present (only when needed).
6. **No external fonts/icons.** Keep it self-contained.
7. **No comments** in code except a short header block (license + version). No single-letter identifiers.

## Styling constraints

* Layout via flex only; no frameworks.
* Respect user’s base fonts; do not set custom font faces.
* Provide high-contrast defaults.
* Keep total injected CSS ≤ 5 KB minified target for v1.

## Browser support

* Evergreen (latest Chrome, Firefox, Safari, Edge). No IE.

## Examples (must ship)

### `examples/index.basic.html`

* Demonstrate header and footer with `x-data` objects.

### `examples/index.data-attributes.html`

* Same components configured entirely via `data-*` attributes.

### `examples/index.multiple-components.html`

* Header + Notice (closable) + Breadcrumbs + Footer in one page.

### `examples/index.shadow-dom.html`

* Set `window.MPRUI.attachShadow = true;` before any `x-init`, render header+footer to shadow root.

## README.md content (must include)

1. What is `mpr-ui` (CDN-first UI primitives with Alpine integration).
2. Quick start (copy-paste snippet):

   ```html
   <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
   <script>window.MPRUI = { attachShadow: false };</script>
   <script defer src="https://cdn.jsdelivr.net/gh/MarcoPoloResearchLab/mpr-ui@1.0.0/mpr-ui.js"></script>
   <div x-data='mprHeader({ siteName: "Moving Maps", navItems: [{label:"Features",href:"/features"}], cta:{label:"Start",href:"/start"} })' x-init="init()"></div>
   <main>...</main>
   <div x-data='mprFooter({ lines:["Support: support@mprlab.com"], copyrightName:"Marco Polo Research Lab" })' x-init="init()"></div>
   ```
3. Options reference (copy the schema above).
4. Theming guide (CSS variables + theme object).
5. Data-attributes guide with JSON examples.
6. Shadow DOM toggle.
7. Security notes (CSP, sanitization).
8. Version pinning with jsDelivr (`@version` or `@commit-hash`).
9. SemVer policy and CHANGELOG usage.

## CHANGELOG.md (initial entries)

* `1.0.0` — Initial release: header, footer, notice, breadcrumbs; Alpine integration; theming + data attributes; optional Shadow DOM.

## LICENSE

* MIT (plain).

## Tests

### `tests/manual-checklist.md` (must include concrete checks)

* Header renders brand, nav, cta; links keyboard-focusable; colors themeable via `:root`.
* Footer shows lines + © current year + name.
* Notice displays by kind; dismiss hides element; `danger` uses `role="alert"`.
* Breadcrumbs mark last item `aria-current="page"`.
* Data-attributes JSON parsing works (bad JSON is ignored safely).
* No console errors on load; no network requests other than the script itself.
* Works with `window.MPRUI.attachShadow = true` and Alpine present.
* All text escaped; anchors reject `javascript:`.

### `tests/smoke.html`

* Single page loading all components two times each (to prove idempotent style injection and multiple instances).

### `(optional) tests/puppeteer.smoke.js`

* If Node is available locally, open `examples/index.multiple-components.html`, assert presence of key text, assert click dismiss on notice, snapshot `document.querySelectorAll('[role="banner"],[role="contentinfo"]')`.

## Acceptance criteria (do not proceed unless all pass)

1. Running any `examples/*.html` in a browser **renders immediately** with Alpine.
2. Setting `document.documentElement.style.setProperty('--mpr-header-bg','#222')` affects header background live.
3. `data-*` attribute pages produce identical DOM to `x-data` versions (except for whitespace).
4. No inline styles beyond controlled theme application; a single style tag is injected once per document root.
5. No undeclared globals besides `window.MPRUI`.
6. No single-letter identifiers; names are descriptive.
7. The library functions without Alpine (imperative `window.MPRUI.renderX`) and with Alpine (data factories).
8. File size of `mpr-ui.js` ≤ 25 KB unminified target for v1 (informational; not a hard fail if slightly above).

## Repo automation & versioning

* Create repo, add files, commit.
* Tag `v1.0.0`.
* Usage via jsDelivr:

  * Latest tag: `https://cdn.jsdelivr.net/gh/MarcoPoloResearchLab/mpr-ui@1.0.0/mpr-ui.js`
  * Pin to commit: `https://cdn.jsdelivr.net/gh/MarcoPoloResearchLab/mpr-ui@<commit>/mpr-ui.js`
* Document upgrade policy in README (sites should pin minor versions; breaking changes only in major bumps).

## Execution order (for the agent)

1. Create repo layout and placeholder files.
2. Implement `mpr-ui.js` with components + style injector + sanitization + Alpine plugin + optional Shadow DOM.
3. Write examples.
4. Write tests (`smoke.html`, checklist; optional Puppeteer).
5. Fill README with quick start and API.
6. Fill CHANGELOG (1.0.0) and MIT LICENSE.
7. Commit + tag `v1.0.0`.
8. Provide final usage snippet (README “Quick start”) and confirm jsDelivr URLs.

## Output format (from the agent)

* Return **full file contents** for all files listed above (no diffs).
* Ensure code has **no comments** except the small header at top of `mpr-ui.js`.
* Use long, descriptive identifier names everywhere.

---

**End of brief.**
