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
 * @typedef {Object} AuthRuntimeConfig
 * @property {string} tauthUrl
 * @property {string} googleClientId
 * @property {string} tenantId
 * @property {string} loginPath
 * @property {string} logoutPath
 * @property {string} noncePath
 */

/**
 * @typedef {Object} AuthButtonConfig
 * @property {string} text
 * @property {string} size
 * @property {string} theme
 */

/**
 * @typedef {Object} RuntimeConfig
 * @property {AuthRuntimeConfig} auth
 * @property {AuthButtonConfig} authButton
 */

/**
 * @typedef {Object} RuntimeEnvironmentConfig
 * @property {string} type
 * @property {string[]} [origins]
 * @property {AuthRuntimeConfig} auth
 * @property {AuthButtonConfig} authButton
 */
