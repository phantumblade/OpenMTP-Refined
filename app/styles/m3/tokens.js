// Material 3 Expressive shape, motion and type tokens used by the M3
// components. Colours come from ./colorTokens.js (generated).

// Corner radii in px (md.sys.shape.corner.*)
export const m3Shape = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  largeIncreased: 20,
  extraLarge: 28,
  extraLargeIncreased: 32,
  extraExtraLarge: 48,
  full: 9999,
};

// CSS approximations of the M3 Expressive motion springs
// (md.sys.motion.spring.*). "Spatial" springs overshoot and are used for
// position/size/shape changes, "effects" springs don't and are used for
// colour and opacity.
export const m3Motion = {
  fastSpatial: '350ms cubic-bezier(0.42, 1.67, 0.21, 0.9)',
  defaultSpatial: '500ms cubic-bezier(0.38, 1.21, 0.22, 1)',
  slowSpatial: '650ms cubic-bezier(0.39, 1.29, 0.35, 0.98)',
  fastEffects: '150ms cubic-bezier(0.31, 0.94, 0.34, 1)',
  defaultEffects: '200ms cubic-bezier(0.34, 0.8, 0.34, 1)',
  slowEffects: '300ms cubic-bezier(0.34, 0.88, 0.34, 1)',
};

// Elevation shadows (md.sys.elevation.level*)
export const m3Elevation = {
  level1: '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
  level2: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
  level3: '0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
};

// State layer opacities (md.sys.state.*)
export const m3State = {
  hover: 0.08,
  focus: 0.1,
  pressed: 0.1,
  dragged: 0.16,
  disabledContainer: 0.1,
  disabledContent: 0.38,
};

// Type scale (md.sys.typescale.*) in px; "emphasized" styles use a heavier
// weight as recommended by M3 Expressive for hero text.
export const m3Type = {
  displaySmall: { fontSize: 36, lineHeight: '44px', fontWeight: 400 },
  headlineLarge: { fontSize: 32, lineHeight: '40px', fontWeight: 400 },
  headlineLargeEmphasized: {
    fontSize: 32,
    lineHeight: '40px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  headlineMedium: { fontSize: 28, lineHeight: '36px', fontWeight: 400 },
  headlineMediumEmphasized: {
    fontSize: 28,
    lineHeight: '36px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  headlineSmall: { fontSize: 24, lineHeight: '32px', fontWeight: 400 },
  titleLarge: { fontSize: 22, lineHeight: '28px', fontWeight: 400 },
  titleSmall: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.007em',
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: '24px',
    fontWeight: 500,
    letterSpacing: '0.009em',
  },
  titleMediumEmphasized: {
    fontSize: 16,
    lineHeight: '24px',
    fontWeight: 600,
    letterSpacing: '0.009em',
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: '24px',
    fontWeight: 400,
    letterSpacing: '0.03em',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    letterSpacing: '0.018em',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 400,
    letterSpacing: '0.033em',
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.007em',
  },
  labelLargeEmphasized: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 700,
    letterSpacing: '0.007em',
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.04em',
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.045em',
  },
};

// Mixes [color] (hex) into an rgba() of the given opacity, for state layers.
export const alphaHex = (hex, opacity) => {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
