/**
 * @typedef {object} DEVICE_TYPE
 * @property {string} mtp - MTP Device
 * @property {string} local - Local Device
 * */
export const DEVICE_TYPE = {
  mtp: 'mtp',
  local: 'local',
};

export const MTP_MODE = {
  legacy: 'legacy',
  kalam: 'kalam',
};

export const FILE_EXPLORER_VIEW_TYPE = {
  grid: 'grid',
  list: 'list',
};

export const APP_THEME_MODE_TYPE = {
  light: 'light',
  dark: 'dark',
  auto: 'auto',
};

export const APP_LANGUAGE_TYPE = {
  english: 'en',
  italian: 'it',
};

export const APP_FONT_FAMILY_TYPE = {
  system: 'system',
  facultyGlyphic: 'facultyGlyphic',
};

// Material 3 colour spec the palette is generated with (see
// scripts/m3/generate-color-tokens.mjs)
export const APP_COLOR_STYLE_TYPE = {
  classic: 'classic',
  vibrant: 'vibrant',
};

// Material 3 Expressive menu color styles (Compose MenuDefaults): standard
// sits on surfaceContainerLow, vibrant on tertiaryContainer
export const APP_MENU_STYLE_TYPE = {
  standard: 'standard',
  vibrant: 'vibrant',
};

export const FILE_TRANSFER_DIRECTION = {
  upload: 'upload',
  download: 'download',
};

export const USB_HOTPLUG_EVENTS = {
  attach: 'attach',
  detach: 'detach',
};
