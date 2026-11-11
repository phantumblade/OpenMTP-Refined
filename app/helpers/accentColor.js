import { systemPreferences } from 'electron';
import { APP_ACCENT_COLOR_TYPE } from '../enums';
import { getRemoteWindow } from './remoteWindowHelpers';

// Hue (HSL degrees) of each app colour, to match the macOS accent colour.
const ACCENT_HUES = {
  [APP_ACCENT_COLOR_TYPE.red]: 358,
  [APP_ACCENT_COLOR_TYPE.orange]: 28,
  [APP_ACCENT_COLOR_TYPE.yellow]: 47,
  [APP_ACCENT_COLOR_TYPE.green]: 106,
  [APP_ACCENT_COLOR_TYPE.blue]: 211,
  [APP_ACCENT_COLOR_TYPE.purple]: 298,
  [APP_ACCENT_COLOR_TYPE.pink]: 332,
};

// The app colour closest to an RRGGBB(AA) colour; greys (macOS "Graphite")
// fall back to the brand blue.
export const nearestAccentColor = (hex) => {
  const value = String(hex || '').replace('#', '');

  if (!/^[0-9a-f]{6}/i.test(value)) {
    return APP_ACCENT_COLOR_TYPE.blue;
  }

  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (max === 0 || delta / max < 0.2) {
    return APP_ACCENT_COLOR_TYPE.blue;
  }

  let hue;

  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  hue = (hue * 60 + 360) % 360;

  const distance = (a) => Math.min(Math.abs(a - hue), 360 - Math.abs(a - hue));

  return Object.keys(ACCENT_HUES).sort(
    (a, b) => distance(ACCENT_HUES[a]) - distance(ACCENT_HUES[b])
  )[0];
};

// The accent colour set in macOS System Settings > Appearance.
export const getSystemAccentColor = () => {
  try {
    // compatible with both renderer and main process
    const preferences =
      getRemoteWindow()?.systemPreferences ?? systemPreferences;

    return nearestAccentColor(preferences.getAccentColor());
  } catch (e) {
    return APP_ACCENT_COLOR_TYPE.blue;
  }
};

// "system" follows macOS, any other value is the colour itself.
export const resolveAccentColor = (setting) => {
  if (setting === APP_ACCENT_COLOR_TYPE.system) {
    return getSystemAccentColor();
  }

  return ACCENT_HUES[setting] === undefined
    ? APP_ACCENT_COLOR_TYPE.blue
    : setting;
};
