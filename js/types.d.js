// @ts-check

/**
 * @typedef {Object} Prompt
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {string[]} tags
 */

/**
 * @typedef {Object} PromptFilters
 * @property {string} searchText
 * @property {string} tag
 */

/**
 * @typedef {Object} FooterProjectLink
 * @property {string} label
 * @property {string} url
 */

/**
 * @typedef {Record<string, number>} PromptLikeCounts
 */

/**
 * @typedef {Object} ToastDetail
 * @property {string} message
 */

/**
 * @typedef {Object} ThemeState
 * @property {"light" | "dark"} mode
 */

/**
 * @typedef {Object} MprUiAuthConfig
 * @property {string} tauthUrl
 * @property {string} googleClientId
 * @property {string} tenantId
 * @property {string} loginPath
 * @property {string} logoutPath
 * @property {string} noncePath
 */

/**
 * @typedef {Object} MprUiAuthButtonConfig
 * @property {string} text
 * @property {string} size
 * @property {string} theme
 * @property {string=} shape
 */

/**
 * @typedef {Object} MprUiRuntimeConfig
 * @property {string} description
 * @property {string[]} origins
 * @property {MprUiAuthConfig} auth
 * @property {MprUiAuthButtonConfig | null} authButton
 */

/**
 * @typedef {Object} AuthBootstrapState
 * @property {"authenticated" | "unauthenticated"} status
 * @property {unknown | null} profile
 */
