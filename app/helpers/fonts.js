import { APP_FONT_FAMILY_TYPE } from '../enums';

export const SYSTEM_FONT_FAMILY = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"SF Pro Text"',
  '"Segoe UI"',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(',');

// Google Sans Flex (variable: weight, width, roundness), the typeface of
// Material 3 Expressive; bundled offline, see styles/scss/themes/fonts.scss
export const GOOGLE_SANS_FLEX_FONT_FAMILY = [
  '"Google Sans Flex"',
  SYSTEM_FONT_FAMILY,
].join(',');

export const FACULTY_GLYPHIC_FONT_FAMILY = [
  '"Faculty Glyphic"',
  SYSTEM_FONT_FAMILY,
].join(',');

// Allo (variable: optical size, weight, roundness), a friendly typeface
// started from Inter; bundled offline, see styles/scss/themes/fonts.scss
export const ALLO_FONT_FAMILY = ['"Allo"', SYSTEM_FONT_FAMILY].join(',');

// roundness (ROND axis) each typeface is set at: Google Sans Flex fully
// round (the Expressive setting), Allo at its own "Friendly" default
export const getAppFontRoundness = (appFontFamily) =>
  appFontFamily === APP_FONT_FAMILY_TYPE.allo ? 50 : 100;

export const getAppFontFamily = (appFontFamily) => {
  switch (appFontFamily) {
    case APP_FONT_FAMILY_TYPE.allo:
      return ALLO_FONT_FAMILY;
    case APP_FONT_FAMILY_TYPE.facultyGlyphic:
      return FACULTY_GLYPHIC_FONT_FAMILY;
    case APP_FONT_FAMILY_TYPE.system:
      return SYSTEM_FONT_FAMILY;
    case APP_FONT_FAMILY_TYPE.googleSansFlex:
    default:
      return GOOGLE_SANS_FLEX_FONT_FAMILY;
  }
};
