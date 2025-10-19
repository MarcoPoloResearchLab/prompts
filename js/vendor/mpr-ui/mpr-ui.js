// @ts-check
/*! mpr-ui local preview */

const COMPONENT_NAME = "mpr-footer";
const LIBRARY_NAME = "mpr-ui";
const SAFE_URL_PATTERN = /^(https?:)?\/\//i;
let footerInstanceCounter = 0;

/**
 * @param {unknown} value
 * @returns {string}
 */
function sanitizeText(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function sanitizeUrl(value) {
  if (typeof value !== "string") {
    return "#";
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "#";
  }
  if (!SAFE_URL_PATTERN.test(trimmed) && !trimmed.startsWith("/")) {
    return "#";
  }
  if (trimmed.toLowerCase().startsWith("javascript:")) {
    return "#";
  }
  return trimmed;
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * @param {Array<unknown>} rawLinks
 * @returns {Array<{ label: string; href: string }>}
 */
function sanitizeProjects(rawLinks) {
  if (!Array.isArray(rawLinks)) {
    return [];
  }
  return rawLinks
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const label = sanitizeText(
        /** @type {{ label?: unknown; name?: unknown }} */ (entry).label ??
          /** @type {{ label?: unknown; name?: unknown }} */ (entry).name ??
          ""
      );
      const href = sanitizeUrl(
        /** @type {{ url?: unknown; href?: unknown }} */ (entry).url ??
          /** @type {{ url?: unknown; href?: unknown }} */ (entry).href ??
          ""
      );
      if (label.length === 0 || href.length === 0) {
        return null;
      }
      return { label, href };
    })
    .filter((value) => value !== null);
}

/**
 * @param {Element | null | undefined} element
 * @returns {{ privacyHref?: string; privacyLabel?: string; privacyAria?: string; hintText?: string; themeToggleLabel?: string; menuLabel?: string; menuAriaLabel?: string; projects?: Array<{ label: string; href: string }> }}
 */
function extractDataAttributes(element) {
  if (!(element instanceof HTMLElement)) {
    return {};
  }
  const dataset = element.dataset ?? {};
  /** @type {Array<{ label: string; href: string }>} */
  let projects = [];
  if (typeof dataset.projects === "string") {
    try {
      const parsed = JSON.parse(dataset.projects);
      if (Array.isArray(parsed)) {
        projects = sanitizeProjects(parsed);
      }
    } catch {
      projects = [];
    }
  }
  return {
    privacyHref: dataset.privacyHref,
    privacyLabel: dataset.privacyLabel,
    privacyAria: dataset.privacyAriaLabel ?? dataset.privacyAria,
    hintText: dataset.hintText,
    themeToggleLabel: dataset.themeToggleLabel,
    menuLabel: dataset.menuLabel,
    menuAriaLabel: dataset.menuAriaLabel,
    projects
  };
}

/**
 * @param {unknown} rawOptions
 * @param {HTMLElement | null} [element]
 * @returns {{
 *  privacy: { href: string; label: string; ariaLabel: string };
 *  hintText: string;
 *  themeToggleLabel: string;
 *  menu: { label: string; ariaLabel: string };
 *  projects: Array<{ label: string; href: string }>;
 * }}
 */
function sanitizeFooterOptions(rawOptions, element) {
  /** @type {{ privacy?: { href?: unknown; label?: unknown; ariaLabel?: unknown }; hintText?: unknown; themeToggleLabel?: unknown; menu?: { label?: unknown; ariaLabel?: unknown }; projects?: Array<unknown> }} */
  const options = (rawOptions && typeof rawOptions === "object" ? rawOptions : {});
  const datasetFallback = extractDataAttributes(element ?? null);
  const rawPrivacy = options.privacy ?? {};
  const privacyLabel =
    sanitizeText(rawPrivacy.label ?? datasetFallback.privacyLabel ?? "") || "Privacy";
  const privacyHref = sanitizeUrl(rawPrivacy.href ?? datasetFallback.privacyHref ?? "#");
  const privacyAria =
    sanitizeText(rawPrivacy.ariaLabel ?? datasetFallback.privacyAria ?? "") || privacyLabel;
  const hintText =
    sanitizeText(options.hintText ?? datasetFallback.hintText ?? "") ||
    "Press / to search • Enter to copy the focused card";
  const themeToggleLabel =
    sanitizeText(options.themeToggleLabel ?? datasetFallback.themeToggleLabel ?? "") || "Dark mode";
  const rawMenu = options.menu ?? {};
  const menuLabel =
    sanitizeText(rawMenu.label ?? datasetFallback.menuLabel ?? "") || "Built By Marco Polo Research Lab";
  const menuAriaLabel =
    sanitizeText(rawMenu.ariaLabel ?? datasetFallback.menuAriaLabel ?? "") ||
    "Browse Marco Polo Research Lab projects";
  const projects =
    sanitizeProjects(options.projects ?? datasetFallback.projects ?? []) ??
    sanitizeProjects(datasetFallback.projects ?? []);

  return {
    privacy: {
      href: privacyHref,
      label: privacyLabel,
      ariaLabel: privacyAria
    },
    hintText,
    themeToggleLabel,
    menu: {
      label: menuLabel,
      ariaLabel: menuAriaLabel
    },
    projects
  };
}

/**
 * @param {{ projectsToggleId?: unknown; projectsMenuId?: unknown; themeToggleId?: unknown }} explicitIds
 * @returns {{ projectsToggleId: string; projectsMenuId: string; themeToggleId: string }}
 */
function assignFooterIdentifiers(explicitIds = {}) {
  footerInstanceCounter += 1;
  const suffix = `${footerInstanceCounter}`;
  const supportsString = (value) => typeof value === "string" && value.trim().length > 0;
  return {
    projectsToggleId: supportsString(explicitIds.projectsToggleId)
      ? /** @type {string} */ (explicitIds.projectsToggleId)
      : `mprFooterProjectsToggle-${suffix}`,
    projectsMenuId: supportsString(explicitIds.projectsMenuId)
      ? /** @type {string} */ (explicitIds.projectsMenuId)
      : `mprFooterProjectsMenu-${suffix}`,
    themeToggleId: supportsString(explicitIds.themeToggleId)
      ? /** @type {string} */ (explicitIds.themeToggleId)
      : "themeToggle"
  };
}

/**
 * @param {unknown} rawOptions
 * @returns {{ projectsToggleId?: unknown; projectsMenuId?: unknown; themeToggleId?: unknown }}
 */
function extractExplicitIdentifiers(rawOptions) {
  if (!rawOptions || typeof rawOptions !== "object") {
    return {};
  }
  const candidate = /** @type {{ ids?: unknown }} */ (rawOptions).ids;
  if (!candidate || typeof candidate !== "object") {
    return {};
  }
  return /** @type {{ projectsToggleId?: unknown; projectsMenuId?: unknown; themeToggleId?: unknown }} */ (candidate);
}

/**
 * @param {{ privacy: { href: string; label: string; ariaLabel: string }; hintText: string; themeToggleLabel: string; menu: { label: string; ariaLabel: string }; projects: Array<{ label: string; href: string }> }} options
 * @param {{ projectsToggleId: string; projectsMenuId: string; themeToggleId: string }} identifiers
 * @returns {string}
 */
function createFooterMarkup(options, identifiers) {
  const projectsMarkup =
    options.projects.length === 0
      ? ""
      : options.projects
          .map(
            (project) =>
              `<li>
                <a class="dropdown-item small" data-role="footer-projects-item" href="${escapeHtml(
                  project.href
                )}" target="_blank" rel="noopener noreferrer" role="menuitem">${escapeHtml(
                project.label
              )}</a>
              </li>`
          )
          .join("");

  return `
    <div class="container-fluid align-items-center gap-3" data-role="footer-inner">
      <a
        class="text-muted text-decoration-none"
        data-role="privacy-link"
        href="${escapeHtml(options.privacy.href)}"
        aria-label="${escapeHtml(options.privacy.ariaLabel)}"
        title="${escapeHtml(options.privacy.ariaLabel)}"
      >
        <span class="fw-medium">${escapeHtml(options.privacy.label)}</span>
      </a>
      <div
        class="form-check form-switch mb-0 d-flex align-items-center gap-2 flex-shrink-0 ms-3"
        data-role="footer-theme-toggle"
        x-data="ThemeToggle()"
        x-init="init()"
      >
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="${identifiers.themeToggleId}"
          x-on:change="toggle()"
          x-bind:checked="mode === 'dark'"
          x-bind:aria-label="options.themeToggleLabel"
        />
        <label class="form-check-label" for="${identifiers.themeToggleId}">${escapeHtml(
          options.themeToggleLabel
        )}</label>
      </div>
      <div class="flex-grow-1" data-role="footer-spacer"></div>
      <span class="small text-muted" data-role="footer-shortcuts">${escapeHtml(options.hintText)}</span>
      <div
        class="dropup"
        data-role="footer-projects"
        x-ref="projectsContainer"
      >
        <button
          type="button"
          class="btn btn-link btn-sm dropdown-toggle text-decoration-none text-muted px-0 fw-semibold"
          data-role="footer-projects-toggle"
          id="${identifiers.projectsToggleId}"
          x-ref="projectsToggle"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="${identifiers.projectsMenuId}"
          aria-label="${escapeHtml(options.menu.ariaLabel)}"
        >
          <span>${escapeHtml(options.menu.label)}</span>
        </button>
        <ul
          class="dropdown-menu dropdown-menu-end shadow-sm"
          data-role="footer-projects-menu"
          id="${identifiers.projectsMenuId}"
          aria-labelledby="${identifiers.projectsToggleId}"
          role="menu"
          x-ref="projectsMenu"
        >
          ${projectsMarkup}
        </ul>
      </div>
    </div>
  `;
}

/**
 * @param {boolean} menuOpen
 * @param {HTMLElement | null | undefined} toggleElement
 * @param {HTMLElement | null | undefined} menuElement
 * @returns {void}
 */
function syncMenuState(menuOpen, toggleElement, menuElement) {
  if (menuElement instanceof HTMLElement) {
    if (menuOpen) {
      menuElement.classList.add("show");
    } else {
      menuElement.classList.remove("show");
    }
  }
  if (toggleElement instanceof HTMLElement) {
    toggleElement.setAttribute("aria-expanded", menuOpen ? "true" : "false");
  }
}

/**
 * @param {HTMLElement} element
 * @returns {() => void}
 */
function attachImperativeFooterBehavior(element) {
  const projectsContainer = element.querySelector("[data-role='footer-projects']");
  const projectsToggle = element.querySelector("[data-role='footer-projects-toggle']");
  const projectsMenu = element.querySelector("[data-role='footer-projects-menu']");
  if (!(projectsContainer instanceof HTMLElement) || !(projectsToggle instanceof HTMLElement) || !(projectsMenu instanceof HTMLElement)) {
    return () => {};
  }
  let menuOpen = false;
  const pointerHandler = (event) => {
    if (!(event.target instanceof Node)) {
      return;
    }
    if (!projectsContainer.contains(event.target)) {
      menuOpen = false;
      syncMenuState(menuOpen, projectsToggle, projectsMenu);
    }
  };
  const toggleHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();
    menuOpen = !menuOpen;
    syncMenuState(menuOpen, projectsToggle, projectsMenu);
  };
  const clickCloseHandler = () => {
    if (menuOpen) {
      menuOpen = false;
      syncMenuState(menuOpen, projectsToggle, projectsMenu);
    }
  };
  const focusOutHandler = (event) => {
    const related = event.relatedTarget;
    if (!(related instanceof HTMLElement) || !projectsContainer.contains(related)) {
      menuOpen = false;
      syncMenuState(menuOpen, projectsToggle, projectsMenu);
    }
  };
  const escapeHandler = (event) => {
    if (event.key !== "Escape") {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    menuOpen = false;
    syncMenuState(menuOpen, projectsToggle, projectsMenu);
    projectsToggle.focus();
  };
  projectsToggle.addEventListener("click", toggleHandler);
  projectsMenu.addEventListener("click", clickCloseHandler);
  projectsContainer.addEventListener("focusout", focusOutHandler);
  projectsContainer.addEventListener("keydown", escapeHandler);
  document.addEventListener("pointerdown", pointerHandler);
  syncMenuState(menuOpen, projectsToggle, projectsMenu);
  return () => {
    projectsToggle.removeEventListener("click", toggleHandler);
    projectsMenu.removeEventListener("click", clickCloseHandler);
    projectsContainer.removeEventListener("focusout", focusOutHandler);
    projectsContainer.removeEventListener("keydown", escapeHandler);
    document.removeEventListener("pointerdown", pointerHandler);
  };
}

/**
 * @param {HTMLElement} element
 * @param {unknown} rawOptions
 * @returns {() => void}
 */
function renderFooter(element, rawOptions = {}) {
  if (!(element instanceof HTMLElement)) {
    throw new Error("MPRUI.renderFooter requires a DOM element");
  }
  if (typeof element.__mprUiCleanup === "function") {
    element.__mprUiCleanup();
  }
  const options = sanitizeFooterOptions(rawOptions, element);
  const identifiers = assignFooterIdentifiers(extractExplicitIdentifiers(rawOptions));
  element.setAttribute("data-component", COMPONENT_NAME);
  element.setAttribute("data-library", LIBRARY_NAME);
  element.innerHTML = createFooterMarkup(options, identifiers);
  const cleanup = attachImperativeFooterBehavior(element);
  Object.defineProperty(element, "__mprUiCleanup", {
    value: cleanup,
    configurable: true,
    writable: true
  });
  return cleanup;
}

/**
 * @param {unknown} rawOptions
 * @returns {Record<string, unknown>}
 */
function createFooterFactory(rawOptions = {}) {
  const options = sanitizeFooterOptions(rawOptions);
  const identifiers = assignFooterIdentifiers(extractExplicitIdentifiers(rawOptions));
  return {
    options,
    identifiers,
    menuOpen: false,
    cleanupHandlers: [],
    init() {
      this.render();
      this.$watch("menuOpen", () => {
        this.applyMenuState();
      });
      if (this.$el instanceof HTMLElement) {
        this.$el.addEventListener("alpine:destroy", () => {
          this.teardownEventHandlers();
        });
      }
    },
    render() {
      this.teardownEventHandlers();
      this.$el.setAttribute("data-component", COMPONENT_NAME);
      this.$el.setAttribute("data-library", LIBRARY_NAME);
      this.$el.innerHTML = createFooterMarkup(this.options, this.identifiers);
      if (window.Alpine && typeof window.Alpine.initTree === "function") {
        Array.from(this.$el.children).forEach((child) => {
          window.Alpine.initTree(child);
        });
      }
      this.setupEventHandlers();
      this.$nextTick(() => {
        this.applyMenuState();
      });
    },
    applyMenuState() {
      const menuElement = this.$refs.projectsMenu ?? this.$el.querySelector("[data-role='footer-projects-menu']");
      const toggleElement =
        this.$refs.projectsToggle ?? this.$el.querySelector("[data-role='footer-projects-toggle']");
      syncMenuState(this.menuOpen, toggleElement instanceof HTMLElement ? toggleElement : null, menuElement instanceof HTMLElement ? menuElement : null);
    },
    toggleMenu(event) {
      if (event instanceof Event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.menuOpen = !this.menuOpen;
      this.applyMenuState();
    },
    closeMenu() {
      if (!this.menuOpen) {
        return;
      }
      this.menuOpen = false;
      this.applyMenuState();
    },
    handleMenuFocusOut(event) {
      const relatedTarget = event?.relatedTarget;
      const container =
        this.$refs.projectsContainer ?? this.$el.querySelector("[data-role='footer-projects']");
      if (!(container instanceof HTMLElement)) {
        this.closeMenu();
        return;
      }
      if (!(relatedTarget instanceof HTMLElement) || !container.contains(relatedTarget)) {
        this.closeMenu();
      }
    },
    handleEscape(event) {
      if (event instanceof KeyboardEvent) {
        event.stopPropagation();
        event.preventDefault();
      }
      this.closeMenu();
      const toggleElement =
        this.$refs.projectsToggle ?? this.$el.querySelector("[data-role='footer-projects-toggle']");
      if (toggleElement instanceof HTMLElement) {
        toggleElement.focus();
      }
    },
    setupEventHandlers() {
      const cleanupHandlers = [];
      const container =
        this.$refs.projectsContainer ?? this.$el.querySelector("[data-role='footer-projects']");
      const toggleElement =
        this.$refs.projectsToggle ?? this.$el.querySelector("[data-role='footer-projects-toggle']");
      const menuElement =
        this.$refs.projectsMenu ?? this.$el.querySelector("[data-role='footer-projects-menu']");
      if (toggleElement instanceof HTMLElement) {
        const clickHandler = (event) => this.toggleMenu(event);
        const keydownHandler = (event) => {
          if (event instanceof KeyboardEvent && event.key === "Escape") {
            this.handleEscape(event);
          }
        };
        toggleElement.addEventListener("click", clickHandler);
        toggleElement.addEventListener("keydown", keydownHandler);
        cleanupHandlers.push(() => {
          toggleElement.removeEventListener("click", clickHandler);
          toggleElement.removeEventListener("keydown", keydownHandler);
        });
      }
      if (menuElement instanceof HTMLElement) {
        const menuClickHandler = () => this.closeMenu();
        const menuKeydownHandler = (event) => {
          if (event instanceof KeyboardEvent && event.key === "Escape") {
            this.handleEscape(event);
          }
        };
        menuElement.addEventListener("click", menuClickHandler);
        menuElement.addEventListener("keydown", menuKeydownHandler);
        cleanupHandlers.push(() => {
          menuElement.removeEventListener("click", menuClickHandler);
          menuElement.removeEventListener("keydown", menuKeydownHandler);
        });
      }
      if (container instanceof HTMLElement) {
        const focusOutHandler = (event) => this.handleMenuFocusOut(event);
        container.addEventListener("focusout", focusOutHandler);
        cleanupHandlers.push(() => {
          container.removeEventListener("focusout", focusOutHandler);
        });
      }
      const pointerDownHandler = (event) => {
        if (!(container instanceof HTMLElement)) {
          return;
        }
        const targetNode = event?.target;
        if (targetNode instanceof Node && !container.contains(targetNode)) {
          this.closeMenu();
        }
      };
      document.addEventListener("pointerdown", pointerDownHandler);
      cleanupHandlers.push(() => {
        document.removeEventListener("pointerdown", pointerDownHandler);
      });
      this.cleanupHandlers = cleanupHandlers;
    },
    teardownEventHandlers() {
      if (Array.isArray(this.cleanupHandlers)) {
        for (const cleanup of this.cleanupHandlers) {
          if (typeof cleanup === "function") {
            cleanup();
          }
        }
      }
      this.cleanupHandlers = [];
    }
  };
}

document.addEventListener("alpine:init", () => {
  const Alpine = window.Alpine ?? null;
  if (!Alpine || typeof Alpine.data !== "function") {
    return;
  }
  Alpine.data("mprFooter", (options = {}) => createFooterFactory(options));
});

const namespace = window.MPRUI && typeof window.MPRUI === "object" ? window.MPRUI : {};
namespace.renderFooter = renderFooter;
namespace.factories = Object.assign({}, namespace.factories, {
  footer: (options = {}) => createFooterFactory(options)
});
window.MPRUI = namespace;
