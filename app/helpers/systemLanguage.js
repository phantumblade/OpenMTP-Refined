import { execFileSync } from 'child_process';
import { APP_LANGUAGE_TYPE } from '../enums';

// The Mac's preferred languages, in order, from the global AppleLanguages
// setting (e.g. "it-IT"). Electron's own locale can't be used: it falls back
// to English when the bundle has no matching .lproj folder.
export const readMacPreferredLanguages = () => {
  if (process.platform !== 'darwin') {
    return [];
  }

  try {
    const output = execFileSync('defaults', ['read', '-g', 'AppleLanguages'], {
      encoding: 'utf8',
      timeout: 1000,
    });

    return output.match(/[a-z]{2,3}(?:-[A-Za-z0-9]+)*/g) || [];
  } catch (e) {
    return [];
  }
};

// First language the app supports among [languages], else English.
export const pickAppLanguage = (languages) => {
  const supported = Object.values(APP_LANGUAGE_TYPE);
  const match = (languages || [])
    .map((language) => String(language).toLowerCase().split(/[-_]/)[0])
    .find((code) => supported.includes(code));

  return match || APP_LANGUAGE_TYPE.english;
};

export const detectSystemLanguage = () => {
  const navigatorLanguages =
    typeof navigator !== 'undefined' ? navigator.languages || [] : [];

  return pickAppLanguage([
    ...readMacPreferredLanguages(),
    ...navigatorLanguages,
  ]);
};
