/**
 * Constants
 * Note: Don't import log helper file from utils here
 */

const isDev = process.env.NODE_ENV !== 'production';
const isProd = process.env.NODE_ENV === 'production';
const isDebug = process.env.DEBUG_PROD === 'true';

const config = {
  dev: {
    reportToSenty: false,
    enableGoogleAnalytics: false,
    enableMixpanelAnalytics: false,
    enableAppUpdates: false,
    disableReactWarnings: true,
    allowDevelopmentEnvironment: true,
  },
  prod: {
    // This independent fork must not send data to the upstream author's
    // telemetry projects. Services can be re-enabled only after configuring
    // fork-owned endpoints and documenting user consent.
    reportToSenty: false,
    enableGoogleAnalytics: false,
    enableMixpanelAnalytics: false,
    enableAppUpdates: false,
    disableReactWarnings: false,
    allowDevelopmentEnvironment: false,
  },
  debug: {
    reportToSenty: false,
    enableGoogleAnalytics: false,
    enableMixPanelAnalytics: false,
    enableAppUpdates: false,
    disableReactWarnings: false,
    allowDevelopmentEnvironment: true,
  },
};

let _env = 'dev';

if (isProd) {
  _env = 'prod';
} else if (isDebug) {
  _env = 'debug';
}

module.exports.ENV_FLAVOR = config[_env];

module.exports.IS_DEV = isDev;

module.exports.IS_PROD = isProd;

module.exports.DEBUG_PROD = isDebug;

module.exports.IS_RENDERER = process && process.type === 'renderer';
