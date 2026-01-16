// @ts-check
/**
 * Authentication module for TAuth integration
 * Handles Google Sign-In, session management, and user profile state.
 * @module core/auth
 */

import { log, warn, error as logError } from "../utils/logging.js";

/** @typedef {{ user_id: string; user_email: string; display: string; avatar_url: string; roles: string[]; expires: string }} UserProfile */
/** @typedef {"initializing" | "authenticated" | "unauthenticated" | "error"} AuthStatus */
/** @typedef {{ status: AuthStatus; profile: UserProfile | null; error: string | null }} AuthState */

/**
 * @typedef {Object} AuthConfig
 * @property {string} tauthUrl - Base URL of TAuth service
 * @property {string} googleClientId - Google OAuth Client ID
 * @property {string} tenantId - TAuth tenant identifier
 * @property {string} [noncePath=/auth/nonce] - Nonce endpoint path
 * @property {string} [loginPath=/auth/google] - Login endpoint path
 * @property {string} [logoutPath=/auth/logout] - Logout endpoint path
 * @property {string} [refreshPath=/auth/refresh] - Refresh endpoint path
 * @property {string} [profilePath=/me] - Profile endpoint path
 */

/** @type {AuthConfig} */
const DEFAULT_CONFIG = {
  tauthUrl: "http://localhost:8080",
  googleClientId: "",
  tenantId: "prompt-bubbles",
  noncePath: "/auth/nonce",
  loginPath: "/auth/google",
  logoutPath: "/auth/logout",
  refreshPath: "/auth/refresh",
  profilePath: "/me"
};

/** @type {AuthState} */
const INITIAL_STATE = {
  status: "initializing",
  profile: null,
  error: null
};

/**
 * Creates an authentication controller
 * @param {Partial<AuthConfig>} [config] - Configuration options
 * @returns {Object} Authentication controller instance
 */
export function createAuthController(config = {}) {
  /** @type {AuthConfig} */
  const cfg = { ...DEFAULT_CONFIG, ...config };

  /** @type {AuthState} */
  let state = { ...INITIAL_STATE };

  /** @type {Set<(state: AuthState) => void>} */
  const listeners = new Set();

  /** @type {string | null} */
  let currentNonce = null;

  /** @type {boolean} */
  let googleInitialized = false;

  /**
   * Notifies all listeners of state change
   */
  function notifyListeners() {
    listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        logError("Auth listener error:", err);
      }
    });
  }

  /**
   * Updates auth state and notifies listeners
   * @param {Partial<AuthState>} updates - State updates
   */
  function setState(updates) {
    state = { ...state, ...updates };
    notifyListeners();
    dispatchAuthEvent();
  }

  /**
   * Dispatches a custom auth state change event
   */
  function dispatchAuthEvent() {
    const event = new CustomEvent("auth-state-change", {
      bubbles: true,
      detail: { ...state }
    });
    document.dispatchEvent(event);
  }

  /**
   * Builds a full URL for TAuth endpoints
   * @param {string} path - Endpoint path
   * @returns {string} Full URL
   */
  function buildUrl(path) {
    return `${cfg.tauthUrl}${path}`;
  }

  /**
   * Makes an authenticated fetch request with tenant header
   * @param {string} url - Request URL
   * @param {RequestInit} [options] - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async function authFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("X-TAuth-Tenant", cfg.tenantId);
    headers.set("X-Requested-With", "XMLHttpRequest");

    return fetch(url, {
      ...options,
      headers,
      credentials: "include"
    });
  }

  /**
   * Fetches a new nonce token from TAuth
   * @returns {Promise<string>} Nonce token
   */
  async function fetchNonce() {
    const response = await authFetch(buildUrl(cfg.noncePath), {
      method: "POST"
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch nonce: ${response.status}`);
    }

    const data = await response.json();
    return data.nonce || data.nonce_token;
  }

  /**
   * Exchanges Google credential for TAuth session
   * @param {string} googleIdToken - Google ID token
   * @param {string} nonceToken - Nonce token
   * @returns {Promise<UserProfile>} User profile
   */
  async function exchangeCredential(googleIdToken, nonceToken) {
    const response = await authFetch(buildUrl(cfg.loginPath), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        google_id_token: googleIdToken,
        nonce_token: nonceToken
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Login failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetches the current user profile
   * @returns {Promise<UserProfile | null>} User profile or null
   */
  async function fetchProfile() {
    try {
      const response = await authFetch(buildUrl(cfg.profilePath));

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Profile fetch failed: ${response.status}`);
      }

      return response.json();
    } catch (err) {
      warn("Profile fetch error:", err);
      return null;
    }
  }

  /**
   * Attempts to refresh the session
   * @returns {Promise<boolean>} Success status
   */
  async function refreshSession() {
    try {
      const response = await authFetch(buildUrl(cfg.refreshPath), {
        method: "POST"
      });
      return response.ok;
    } catch (err) {
      warn("Session refresh failed:", err);
      return false;
    }
  }

  /**
   * Handles Google Sign-In credential response
   * @param {Object} credentialResponse - Google credential response
   */
  async function handleGoogleCredential(credentialResponse) {
    try {
      if (!currentNonce) {
        throw new Error("No nonce available");
      }

      const profile = await exchangeCredential(
        credentialResponse.credential,
        currentNonce
      );

      setState({
        status: "authenticated",
        profile,
        error: null
      });

      log("User authenticated:", profile.user_email);
    } catch (err) {
      logError("Authentication error:", err);
      setState({
        status: "error",
        profile: null,
        error: err instanceof Error ? err.message : "Authentication failed"
      });
    } finally {
      currentNonce = null;
    }
  }

  /**
   * Initializes Google Identity Services
   */
  async function initializeGoogle() {
    if (googleInitialized || !cfg.googleClientId) {
      return;
    }

    // @ts-ignore - Google Identity Services global
    if (typeof google === "undefined" || !google.accounts) {
      warn("Google Identity Services not loaded");
      return;
    }

    try {
      currentNonce = await fetchNonce();

      // @ts-ignore - Google Identity Services API
      google.accounts.id.initialize({
        client_id: cfg.googleClientId,
        callback: handleGoogleCredential,
        nonce: currentNonce,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      googleInitialized = true;
      log("Google Identity Services initialized");
    } catch (err) {
      logError("Failed to initialize Google Sign-In:", err);
    }
  }

  /**
   * Prompts Google Sign-In
   */
  async function promptSignIn() {
    if (!googleInitialized) {
      await initializeGoogle();
    }

    // Refresh nonce for each sign-in attempt
    try {
      currentNonce = await fetchNonce();

      // @ts-ignore - Google Identity Services API
      google.accounts.id.initialize({
        client_id: cfg.googleClientId,
        callback: handleGoogleCredential,
        nonce: currentNonce,
        auto_select: false
      });

      // @ts-ignore - Google Identity Services API
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          log("Sign-in prompt not displayed:", notification.getNotDisplayedReason());
        }
      });
    } catch (err) {
      logError("Sign-in prompt error:", err);
    }
  }

  /**
   * Renders Google Sign-In button
   * @param {HTMLElement} element - Container element
   * @param {Object} [options] - Button options
   */
  async function renderSignInButton(element, options = {}) {
    if (!googleInitialized) {
      await initializeGoogle();
    }

    // @ts-ignore - Google Identity Services API
    if (typeof google !== "undefined" && google.accounts) {
      // @ts-ignore - Google Identity Services API
      google.accounts.id.renderButton(element, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        ...options
      });
    }
  }

  /**
   * Signs out the current user
   */
  async function signOut() {
    try {
      await authFetch(buildUrl(cfg.logoutPath), {
        method: "POST"
      });

      // @ts-ignore - Google Identity Services API
      if (typeof google !== "undefined" && google.accounts) {
        // @ts-ignore - Google Identity Services API
        google.accounts.id.disableAutoSelect();
      }

      setState({
        status: "unauthenticated",
        profile: null,
        error: null
      });

      log("User signed out");
    } catch (err) {
      logError("Sign out error:", err);
      // Still mark as unauthenticated locally
      setState({
        status: "unauthenticated",
        profile: null,
        error: null
      });
    }
  }

  /**
   * Initializes authentication state by checking existing session
   */
  async function initialize() {
    try {
      const profile = await fetchProfile();

      if (profile) {
        setState({
          status: "authenticated",
          profile,
          error: null
        });
        log("Existing session found:", profile.user_email);
      } else {
        setState({
          status: "unauthenticated",
          profile: null,
          error: null
        });
      }

      await initializeGoogle();
    } catch (err) {
      logError("Auth initialization error:", err);
      setState({
        status: "unauthenticated",
        profile: null,
        error: null
      });
    }
  }

  /**
   * Subscribes to auth state changes
   * @param {(state: AuthState) => void} listener - State change listener
   * @returns {() => void} Unsubscribe function
   */
  function subscribe(listener) {
    listeners.add(listener);
    // Immediately call with current state
    listener(state);
    return () => listeners.delete(listener);
  }

  /**
   * Gets the current auth state
   * @returns {AuthState} Current state
   */
  function getState() {
    return { ...state };
  }

  /**
   * Checks if user is authenticated
   * @returns {boolean} Authentication status
   */
  function isAuthenticated() {
    return state.status === "authenticated" && state.profile !== null;
  }

  return {
    initialize,
    getState,
    subscribe,
    isAuthenticated,
    promptSignIn,
    renderSignInButton,
    signOut,
    refreshSession,
    fetchProfile
  };
}

/**
 * Creates an Alpine.js data component for authentication
 * @param {Partial<AuthConfig>} [config] - Auth configuration
 * @returns {Object} Alpine component factory
 */
export function createAuthComponent(config = {}) {
  return () => {
    const controller = createAuthController(config);

    return {
      status: "initializing",
      profile: null,
      error: null,
      showSignIn: false,

      async init() {
        controller.subscribe((state) => {
          this.status = state.status;
          this.profile = state.profile;
          this.error = state.error;
        });

        await controller.initialize();
      },

      get isAuthenticated() {
        return this.status === "authenticated" && this.profile !== null;
      },

      get isLoading() {
        return this.status === "initializing";
      },

      get userName() {
        return this.profile?.display || this.profile?.user_email || "";
      },

      get userEmail() {
        return this.profile?.user_email || "";
      },

      get userAvatar() {
        return this.profile?.avatar_url || "";
      },

      async signIn() {
        await controller.promptSignIn();
      },

      async signOut() {
        await controller.signOut();
      },

      renderButton(element) {
        controller.renderSignInButton(element);
      }
    };
  };
}

/** @type {ReturnType<typeof createAuthController> | null} */
let globalController = null;

/**
 * Gets or creates the global auth controller
 * @param {Partial<AuthConfig>} [config] - Auth configuration
 * @returns {ReturnType<typeof createAuthController>} Auth controller
 */
export function getAuthController(config = {}) {
  if (!globalController) {
    globalController = createAuthController(config);
  }
  return globalController;
}

export default {
  createAuthController,
  createAuthComponent,
  getAuthController
};
