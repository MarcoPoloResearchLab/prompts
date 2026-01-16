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
- **Lab menu:** the footer credits Marco Polo Research Lab and exposes a dropdown of sister projects for quick exploration.
- **Sticky filters:** the tag chip bar stays affixed beneath the navbar as a subtle single-row rail with horizontal scroll, keeping tags reachable without dominating the layout.
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

### Basic (Static)

```bash
npm install
npm test
```

`npm test` starts a static server, launches Puppeteer, and exercises the end-to-end flows (search, filtering, copy/share, like toggles, hash highlighting, and persisted filters). The runner prints each spec name (`Running specs/app-flows.spec.mjs`, `✓ specs/app-flows.spec.mjs`), reports scenario metadata through `globalThis.__PROMPT_BUBBLES_TEST_PROGRESS`, and emits a coverage summary highlighting total, JS, and CSS execution (e.g., `Coverage summary: Total 82.41% (JS 88.10%, CSS 74.90%)`).

### With Authentication (Docker)

The application supports user authentication via [TAuth](https://github.com/tyemirov/TAuth) and [mpr-ui](https://github.com/MarcoPoloResearchLab/mpr-ui) components.

#### Prerequisites

1. **Docker and Docker Compose** - Required for running the authentication service
2. **Google OAuth Client ID** - Required for Google Sign-In

#### Setup

1. **Create environment file**
   ```bash
   cp .env.tauth.example .env.tauth
   ```

2. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new OAuth 2.0 Client ID for Web application
   - Add authorized JavaScript origins:
     - `http://localhost:8000` (frontend)
     - `http://localhost:8080` (TAuth service)
   - Copy the Client ID to `.env.tauth`:
     ```
     GOOGLE_WEB_CLIENT_ID=your-client-id.apps.googleusercontent.com
     ```

3. **Generate a JWT signing key** (for production)
   ```bash
   # Generate a secure random key
   openssl rand -base64 32
   ```
   Update `TAUTH_JWT_SIGNING_KEY` in `.env.tauth` with the generated key.

4. **Start the services**
   ```bash
   docker compose up
   ```

5. **Access the application**
   - Frontend: http://localhost:8000
   - TAuth API: http://localhost:8080

#### Configuration Files

- **`docker-compose.yml`** - Orchestrates frontend and TAuth services
- **`tauth-config.yaml`** - TAuth tenant configuration (tenant ID, cookie settings, TTLs)
- **`.env.tauth`** - Environment variables (secrets, client IDs)
- **`.env.tauth.example`** - Template for environment variables

#### Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐   │
│  │  Prompt       │    │  Google       │    │  TAuth        │   │
│  │  Bubbles UI   │───►│  Sign-In      │───►│  Client       │   │
│  └───────────────┘    └───────────────┘    └───────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                                           │
         │ HTTP :8000                                │ HTTP :8080
         ▼                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Compose                               │
│  ┌───────────────┐                      ┌───────────────────┐   │
│  │  Frontend     │                      │  TAuth Service    │   │
│  │  (ghttp)      │                      │  - Session cookies│   │
│  │  - Static     │                      │  - JWT tokens     │   │
│  │    assets     │                      │  - Refresh tokens │   │
│  └───────────────┘                      └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### Authentication Flow

1. User clicks "Sign in" button
2. Google Identity Services displays sign-in prompt
3. User authenticates with Google
4. TAuth validates Google token and issues session cookies
5. Frontend receives user profile and updates UI
6. Session persists via HTTP-only cookies with silent refresh

## Continuous Integration

Pull requests targeting `master` trigger a GitHub Actions workflow (`.github/workflows/tests.yml`) that runs `npm ci` and `npm test` whenever application code, assets, or test files change. Keep the browser suite green locally before submitting a PR to avoid CI failures.

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
