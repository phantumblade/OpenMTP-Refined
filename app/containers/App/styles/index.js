import { variables, mixins } from '../../../styles/js';
import { commonThemes } from '../../../styles/js/mixins';
import { getAppFontFamily } from '../../../helpers/fonts';
import {
  m3ColorTokens,
  m3HighContrastColorTokens,
} from '../../../styles/m3/colorTokens';
import { prefersHighContrast } from '../../../helpers/theme';
import {
  alphaHex,
  m3Elevation,
  m3Motion,
  m3Shape,
  m3State,
  m3Type,
} from '../../../styles/m3/tokens';
import M3DialogTransition, {
  DIALOG_ENTER_MS,
  DIALOG_EXIT_MS,
} from '../../../components/m3/M3DialogTransition';

// --md-sys-color-* CSS custom properties for the Material 3 colour roles.
const m3CssVariables = (tokens) =>
  Object.keys(tokens).reduce((vars, role) => {
    const kebab = role.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

    return { ...vars, [`--md-sys-color-${kebab}`]: tokens[role] };
  }, {});

// Styles for App/index.jsx component
export const styles = (theme) => {
  return {
    root: {},
    noProfileError: {
      textAlign: `center`,
      ...mixins({ theme }).center,
      ...mixins({ theme }).absoluteCenter,
    },
  };
};

// Every colour the app paints comes from a Material 3 colour role (see
// m3.material.io/styles/color/roles); the legacy palette keys below are kept
// only as aliases of those roles so older styles follow the scheme too.
const paletteFromM3 = (m3) => ({
  primary: { main: m3.surface, contrastText: m3.onSurface },
  secondary: { main: m3.primary, contrastText: m3.onPrimary },
  error: { main: m3.error, contrastText: m3.onError },
  background: { default: m3.surface, paper: m3.surface },
  text: {
    primary: m3.onSurface,
    secondary: m3.onSurfaceVariant,
    disabled: alphaHex(m3.onSurface, 0.38),
  },
  action: {
    active: m3.onSurfaceVariant,
    hover: alphaHex(m3.onSurface, m3State.hover),
    selected: alphaHex(m3.onSurface, m3State.pressed),
    disabled: alphaHex(m3.onSurface, 0.38),
    disabledBackground: alphaHex(m3.onSurface, 0.12),
  },
  divider: m3.outlineVariant,
  snackbar: { error: m3.error },
  btnTextColor: m3.onPrimary,
  fileColor: m3.onSurface,
  tableHeaderFooterBgColor: m3.surfaceContainerLow,
  lightText1Color: m3.onSurfaceVariant,
  fileExplorerThinLineDividerColor: m3.outlineVariant,
  fileDrop: alphaHex(m3.primary, m3State.hover),
  disabledBgColor: alphaHex(m3.onSurface, 0.12),
  nativeSystemColor: m3.surfaceContainer,
  contrastPrimaryMainColor: m3.inverseSurface,
  selectionBg: m3.secondaryContainer,
  selectionHover: alphaHex(m3.onSurface, m3State.hover),
  selectionBorder: m3.primary,
  focusRing: m3.secondary,
  checkboxEdge: m3.surface,
  toolbarButtonHover: alphaHex(m3.onSurfaceVariant, m3State.hover),
  toolbarButtonActive: alphaHex(m3.primary, m3State.pressed),
  statusSurface: m3.surfaceContainer,
  m3,
});

// M3 high contrast level when macOS "Increase contrast" is on
export const getColorPalette = (highContrast = prefersHighContrast()) => {
  const tokens = highContrast ? m3HighContrastColorTokens : m3ColorTokens;

  return {
    get light() {
      return paletteFromM3(tokens.light);
    },
    get dark() {
      return paletteFromM3(tokens.dark);
    },
  };
};

export const getCurrentThemePalette = (appThemeMode) => {
  return getColorPalette()[appThemeMode];
};

// Material 3 (Expressive) styling for the MUI v4 components used across the
// app, so every dialog, button and snackbar follows the same M3 tokens.
const m3ComponentOverrides = (m3) => ({
  MuiBackdrop: {
    root: { backgroundColor: alphaHex(m3.scrim, 0.32) },
  },
  MuiDialog: {
    paper: {
      borderRadius: m3Shape.extraLarge,
      backgroundColor: m3.surfaceContainerHigh,
      color: m3.onSurface,
      boxShadow: m3Elevation.level3,
    },
  },
  MuiDialogTitle: {
    root: {
      padding: '24px 24px 16px',
      '& > h2, & .MuiTypography-h6': {
        ...m3Type.headlineSmall,
        color: m3.onSurface,
      },
    },
  },
  MuiDialogContent: {
    root: { padding: '0 24px 8px' },
  },
  MuiDialogContentText: {
    root: { ...m3Type.bodyMedium, color: m3.onSurfaceVariant },
  },
  MuiDialogActions: {
    root: { padding: '16px 24px 24px' },
    spacing: { '& > :not(:first-child)': { marginLeft: 8 } },
  },
  MuiButton: {
    root: {
      ...m3Type.labelLarge,
      minHeight: 40,
      padding: '0 16px',
      borderRadius: 20,
      textTransform: 'none',
      transition: `border-radius ${m3Motion.fastSpatial}, background-color ${m3Motion.defaultEffects}, color ${m3Motion.defaultEffects}`,
      '&:active': { borderRadius: m3Shape.small },
    },
    text: { padding: '0 12px' },
    textPrimary: {
      color: m3.primary,
      '&:hover': { backgroundColor: alphaHex(m3.primary, m3State.hover) },
    },
    textSecondary: {
      color: m3.primary,
      '&:hover': { backgroundColor: alphaHex(m3.primary, m3State.hover) },
    },
    contained: {
      padding: '0 24px',
      boxShadow: 'none',
      '&:hover': { boxShadow: 'none' },
      '&:active': { boxShadow: 'none' },
    },
    containedPrimary: {
      backgroundColor: m3.primary,
      color: m3.onPrimary,
      '&:hover': { backgroundColor: m3.primary, filter: 'brightness(1.08)' },
    },
    containedSecondary: {
      backgroundColor: m3.primary,
      color: m3.onPrimary,
      '&:hover': { backgroundColor: m3.primary, filter: 'brightness(1.08)' },
    },
    outlined: {
      padding: '0 24px',
      borderColor: m3.outlineVariant,
      color: m3.onSurfaceVariant,
    },
  },
  // M3 primary tabs: icon above label, 3px rounded indicator
  MuiTabs: {
    root: { borderBottom: `1px solid ${m3.outlineVariant}` },
    indicator: {
      display: 'flex',
      justifyContent: 'center',
      height: 3,
      backgroundColor: 'transparent',
      '& > span': {
        width: '100%',
        maxWidth: 56,
        borderRadius: '3px 3px 0 0',
        backgroundColor: m3.primary,
      },
    },
  },
  MuiTab: {
    root: {
      ...m3Type.titleSmall,
      minHeight: 64,
      textTransform: 'none',
      color: m3.onSurfaceVariant,
      '@media (min-width: 600px)': { minWidth: 120 },
      '&:hover': { backgroundColor: alphaHex(m3.onSurface, m3State.hover) },
    },
    textColorInherit: { opacity: 1 },
    textColorPrimary: {
      color: m3.onSurfaceVariant,
      '&$selected': { color: m3.primary },
    },
    textColorSecondary: {
      color: m3.onSurfaceVariant,
      '&$selected': { color: m3.primary },
    },
    labelIcon: {
      minHeight: 64,
      paddingTop: 8,
      '& $wrapper > *:first-child': { marginBottom: 4 },
    },
  },
  // M3 switch: 52x32 track, 16dp handle growing to 24dp (28dp pressed)
  MuiSwitch: {
    root: {
      width: 52,
      height: 32,
      padding: 0,
      overflow: 'visible',
      margin: '0 4px',
    },
    switchBase: {
      padding: 4,
      top: 0,
      left: 0,
      color: m3.outline,
      '&:hover': { backgroundColor: alphaHex(m3.onSurface, m3State.hover) },
      '&$checked': {
        transform: 'translateX(20px)',
        color: m3.onPrimary,
        '& + $track': {
          opacity: 1,
          backgroundColor: m3.primary,
          borderColor: m3.primary,
        },
        '& $thumb': {
          width: 24,
          height: 24,
          margin: 0,
          '&::after': {
            content: '"check"',
            fontFamily: '"Material Symbols Rounded"',
            fontFeatureSettings: '"liga"',
            fontSize: 16,
            lineHeight: '24px',
            color: m3.onPrimaryContainer,
          },
        },
        '&:hover': { backgroundColor: alphaHex(m3.primary, m3State.hover) },
      },
      '&:active $thumb': { width: 28, height: 28, margin: -2 },
      '&$disabled + $track': { opacity: 0.12 },
    },
    thumb: {
      width: 16,
      height: 16,
      margin: 4,
      boxShadow: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: `width ${m3Motion.fastSpatial}, height ${m3Motion.fastSpatial}, margin ${m3Motion.fastSpatial}`,
    },
    track: {
      boxSizing: 'border-box',
      height: 32,
      borderRadius: 16,
      border: `2px solid ${m3.outline}`,
      backgroundColor: m3.surfaceContainerHighest,
      opacity: 1,
    },
    colorPrimary: { '&$checked': { color: m3.primaryContainer } },
    colorSecondary: { '&$checked': { color: m3.primaryContainer } },
  },
  MuiRadio: {
    root: { color: m3.onSurfaceVariant },
    colorPrimary: { '&$checked': { color: m3.primary } },
    colorSecondary: { '&$checked': { color: m3.primary } },
  },
  MuiCheckbox: {
    colorPrimary: { '&$checked': { color: m3.primary } },
    colorSecondary: { '&$checked': { color: m3.primary } },
  },
  // M3 outlined text field / select
  MuiOutlinedInput: {
    root: {
      borderRadius: m3Shape.extraSmall,
      '& $notchedOutline': { borderColor: m3.outline },
      '&:hover $notchedOutline': { borderColor: m3.onSurface },
      '&$focused $notchedOutline': { borderColor: m3.primary, borderWidth: 2 },
    },
    input: { ...m3Type.bodyLarge, padding: '16px' },
  },
  MuiInputLabel: {
    root: { ...m3Type.bodyLarge, color: m3.onSurfaceVariant },
    outlined: { transform: 'translate(16px, 17px) scale(1)' },
  },
  MuiFormLabel: {
    root: { '&$focused': { color: m3.primary } },
  },
  MuiFormHelperText: {
    root: { ...m3Type.bodySmall, color: m3.onSurfaceVariant },
    contained: { marginLeft: 16, marginRight: 16 },
  },
  MuiFormControlLabel: {
    label: { ...m3Type.bodyLarge, color: m3.onSurface },
  },
  // M3 menu
  // Material 3 Expressive menu (Compose SegmentedMenuTokens), same as the
  // app's own M3Menu: large corners, 44dp items, tertiary selection
  MuiMenu: {
    paper: {
      borderRadius: m3Shape.large,
      backgroundColor: m3.surfaceContainerLow,
      boxShadow: m3Elevation.level2,
    },
    list: { padding: '4px 0' },
  },
  MuiMenuItem: {
    root: {
      ...m3Type.bodyLarge,
      minHeight: 44,
      margin: '0 4px',
      padding: '0 12px',
      borderRadius: m3Shape.extraSmall,
      color: m3.onSurface,
      transition: 'background-color 120ms linear, border-radius 200ms ease',
      '&:hover': {
        backgroundColor: alphaHex(m3.onSurface, m3State.hover),
        borderRadius: m3Shape.medium,
      },
      '&$selected, &$selected:hover': {
        borderRadius: m3Shape.medium,
        backgroundColor: m3.tertiaryContainer,
        color: m3.onTertiaryContainer,
      },
    },
  },
  // M3 plain tooltip
  MuiTooltip: {
    tooltip: {
      ...m3Type.bodySmall,
      padding: '4px 8px',
      borderRadius: m3Shape.extraSmall,
      backgroundColor: m3.inverseSurface,
      color: m3.inverseOnSurface,
    },
  },
  MuiSnackbarContent: {
    root: {
      ...m3Type.bodyMedium,
      minHeight: 48,
      padding: '4px 8px 4px 16px',
      borderRadius: m3Shape.extraSmall,
      backgroundColor: m3.inverseSurface,
      color: m3.inverseOnSurface,
      boxShadow: m3Elevation.level3,
    },
  },
});

export const materialUiTheme = ({ ...args }) => {
  const { appThemeMode, appFontFamily } = args;

  const palette = getCurrentThemePalette(appThemeMode);
  const fontFamily = getAppFontFamily(appFontFamily);

  return {
    palette: {
      ...palette,
    },
    typography: {
      useNextVariants: true,
      fontSize: variables().sizes.regularFontSize,
      fontFamily,
    },

    props: {
      // Material 3 dialog motion for every dialog in the app
      MuiDialog: {
        TransitionComponent: M3DialogTransition,
        transitionDuration: { enter: DIALOG_ENTER_MS, exit: DIALOG_EXIT_MS },
      },
    },

    overrides: {
      ...m3ComponentOverrides(palette.m3),
      MuiCssBaseline: {
        '@global': {
          html: {
            '--app-bg-color': palette.background.paper,
            '--app-secondary-main-color': palette.secondary.main,
            '--app-native-system-color': palette.nativeSystemColor,
            '--app-font-family': fontFamily,
            ...m3CssVariables(palette.m3),
            ...commonThemes.noselect,
          },
        },
      },
    },
  };
};
