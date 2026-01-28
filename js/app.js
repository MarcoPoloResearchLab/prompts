// @ts-check

import Alpine from "https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/module.esm.js";
import { STRINGS } from "./constants.js";
import { createPromptsRepository } from "./core/prompts.js";
import { AppShell } from "./ui/appShell.js";
import { ensureAuthLoginButton, removeAuthLoginButton } from "./ui/authElements.js";
import { applyFooterElementAttributes } from "./ui/footerElements.js";
import { BubbleLayer } from "./ui/bubbleLayer.js";
import { ToastRegion } from "./ui/toast.js";
import { createLogger } from "./utils/logging.js";

const logger = createLogger();
const promptsRepository = createPromptsRepository();
const MPR_UI_BUNDLE_URL = "https://cdn.jsdelivr.net/gh/MarcoPoloResearchLab/mpr-ui@v3.6.2/mpr-ui.js";
const APP_ROOT_SELECTOR = "[x-data$=\"AppShell()\"]";
const AUTH_STATUS_AUTHENTICATED = "authenticated";
const AUTH_STATUS_UNAUTHENTICATED = "unauthenticated";
const AUTH_EVENT_AUTHENTICATED = "mpr-ui:auth:authenticated";
const AUTH_EVENT_UNAUTHENTICATED = "mpr-ui:auth:unauthenticated";

/** @typedef {import("./types.d.js").MprUiRuntimeConfig} MprUiRuntimeConfig */
/** @typedef {import("./types.d.js").AuthBootstrapState} AuthBootstrapState */

/**
 * @returns {Promise<void>}
 */
const loadMprUiBundle = () =>
  new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${MPR_UI_BUNDLE_URL}"]`);
    if (existingScript) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.defer = true;
    script.src = MPR_UI_BUNDLE_URL;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Failed to load mpr-ui bundle")));
    document.head.appendChild(script);
  });

/**
 * @returns {Promise<MprUiRuntimeConfig>}
 */
const applyMprUiConfig = async () => {
  if (!window.MPRUI || typeof window.MPRUI.applyYamlConfig !== "function") {
    throw new Error("MPRUI.applyYamlConfig is required before app bootstrap");
  }
  return window.MPRUI.applyYamlConfig({ configUrl: "/config.yaml" });
};

/**
 * @returns {HTMLElement | null}
 */
const resolveAppRoot = () => {
  const root = document.querySelector(APP_ROOT_SELECTOR);
  return root instanceof HTMLElement ? root : null;
};

/**
 * @param {AuthBootstrapState} state
 */
const dispatchAuthState = (state) => {
  const root = resolveAppRoot();
  if (!root) {
    return;
  }
  const eventName =
    state.status === AUTH_STATUS_AUTHENTICATED ? AUTH_EVENT_AUTHENTICATED : AUTH_EVENT_UNAUTHENTICATED;
  root.dispatchEvent(
    new CustomEvent(eventName, {
      detail: { profile: state.profile ?? null },
      bubbles: true
    })
  );
};

/**
 * @param {MprUiRuntimeConfig} runtimeConfig
 * @param {AuthBootstrapState} state
 */
const applyAuthUiState = (runtimeConfig, state) => {
  if (state.status === AUTH_STATUS_AUTHENTICATED) {
    removeAuthLoginButton();
    return;
  }
  if (!runtimeConfig.authButton) {
    throw new Error("Auth button config is required to render the login button");
  }
  ensureAuthLoginButton(runtimeConfig.auth, runtimeConfig.authButton);
};

/**
 * @param {MprUiRuntimeConfig} runtimeConfig
 * @param {(state: AuthBootstrapState) => void} onStateChange
 * @returns {Promise<AuthBootstrapState>}
 */
const bootstrapAuthState = (runtimeConfig, onStateChange) => {
  if (!runtimeConfig || !runtimeConfig.auth) {
    throw new Error("Auth config is required before bootstrapping TAuth");
  }
  if (typeof window.initAuthClient !== "function") {
    throw new Error("TAuth initAuthClient is required before app bootstrap");
  }
  let resolveInitial;
  const initialPromise = new Promise((resolve) => {
    resolveInitial = resolve;
  });
  let initialState = null;
  const updateState = (status, profile) => {
    const state = {
      status,
      profile: profile ?? null
    };
    applyAuthUiState(runtimeConfig, state);
    onStateChange(state);
    if (!initialState) {
      initialState = state;
      resolveInitial(state);
    }
  };
  try {
    const initResult = window.initAuthClient({
      baseUrl: runtimeConfig.auth.tauthUrl,
      tenantId: runtimeConfig.auth.tenantId,
      onAuthenticated: (profile) => {
        updateState(AUTH_STATUS_AUTHENTICATED, profile);
      },
      onUnauthenticated: () => {
        updateState(AUTH_STATUS_UNAUTHENTICATED, null);
      }
    });
    Promise.resolve(initResult).catch((error) => {
      logger.error("TAuth init failed", error);
      updateState(AUTH_STATUS_UNAUTHENTICATED, null);
    });
  } catch (error) {
    logger.error("TAuth init failed", error);
    updateState(AUTH_STATUS_UNAUTHENTICATED, null);
  }
  return initialPromise;
};

const bootstrap = async () => {
  const runtimeConfig = await applyMprUiConfig();
  let authEventsReady = false;
  let lastAuthState = null;
  const handleAuthState = (state) => {
    lastAuthState = state;
    if (authEventsReady) {
      dispatchAuthState(state);
    }
  };
  await bootstrapAuthState(runtimeConfig, handleAuthState);
  applyFooterElementAttributes();
  await loadMprUiBundle();

  document.addEventListener("alpine:init", () => {
    Alpine.data("AppShell", () => AppShell({ promptsRepository, logger }));
    Alpine.data("BubbleLayer", () => BubbleLayer({ logger }));
    Alpine.data("ToastRegion", () => ToastRegion({ logger }));
  });

  window.Alpine = Alpine;
  Alpine.store("app", { strings: STRINGS });
  Alpine.start();
  authEventsReady = true;
  if (lastAuthState) {
    dispatchAuthState(lastAuthState);
  }
};

bootstrap().catch((error) => {
  logger.error("Failed to load mpr-ui configuration", error);
  throw error;
});
