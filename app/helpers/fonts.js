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

export const FACULTY_GLYPHIC_FONT_FAMILY = [
  '"Faculty Glyphic"',
  SYSTEM_FONT_FAMILY,
].join(',');

export const getAppFontFamily = (appFontFamily) => {
  switch (appFontFamily) {
    case APP_FONT_FAMILY_TYPE.facultyGlyphic:
      return FACULTY_GLYPHIC_FONT_FAMILY;
    case APP_FONT_FAMILY_TYPE.system:
    default:
      return SYSTEM_FONT_FAMILY;
  }
};
