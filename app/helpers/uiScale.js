import { webFrame } from 'electron';
import { settingsStorage } from './storageHelper';

// Interface size: one zoom factor for the whole window, so icons, text and
// spacing grow or shrink together and every layout rule (including the
// toolbar's narrow-window steps) keeps working. "auto" picks a size from
// the width of the screen the window is on.

export const UI_SCALE_AUTO = 'auto';
export const UI_SCALE_STEPS = [80, 90, 100, 110, 120, 130];
export const UI_SCALE_DEFAULT = 100;

// Small laptop screens (e.g. a 13" MacBook at its default "looks like"
// resolution, 1440 or 1470 points wide) get a slightly smaller interface
export const autoUiScale = (screenWidth) => {
  if (!Number.isFinite(screenWidth) || screenWidth <= 0) {
    return UI_SCALE_DEFAULT;
  }

  if (screenWidth < 1300) {
    return 80;
  }

  if (screenWidth < 1500) {
    return 90;
  }

  return UI_SCALE_DEFAULT;
};

export const normalizeUiScale = (value) =>
  value === UI_SCALE_AUTO || UI_SCALE_STEPS.includes(value)
    ? value
    : UI_SCALE_DEFAULT;

// width of the screen the window is on, in points
const currentScreenWidth = () => {
  try {
    // eslint-disable-next-line global-require
    const remote = require('@electron/remote');
    const display = remote.screen.getDisplayMatching(
      remote.getCurrentWindow().getBounds()
    );

    return display.workAreaSize.width;
  } catch (e) {
    return window.screen?.availWidth;
  }
};

export const resolveUiScale = (setting, screenWidth = currentScreenWidth()) => {
  const value = normalizeUiScale(setting);

  return value === UI_SCALE_AUTO ? autoUiScale(screenWidth) : value;
};

export const getUiScaleSetting = () => {
  try {
    return normalizeUiScale(
      settingsStorage.getItems(['appUiScale']).appUiScale
    );
  } catch (e) {
    return UI_SCALE_DEFAULT;
  }
};

export const applyUiScale = (setting = getUiScaleSetting()) => {
  const factor = resolveUiScale(setting) / 100;

  if (Math.abs(webFrame.getZoomFactor() - factor) > 0.001) {
    webFrame.setZoomFactor(factor);
  }
};
