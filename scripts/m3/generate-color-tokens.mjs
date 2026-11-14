// Generates the Material 3 colour roles used by the app from the brand seed.
// Run: node --import ./scripts/m3/register-esm-loader.mjs scripts/m3/generate-color-tokens.mjs
import { writeFileSync } from 'node:fs';
import {
  DynamicColor,
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  SchemeVibrant,
  TonalPalette,
  Variant,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities';

const SEED = '#007af5';
// tertiary key colour: the orange of the app icon (the smiling face), so the
// accents (selection in menus, favourites, highlights) aren't blue as well
const TERTIARY_SEED = '#eca743';
const OUTPUT = new URL('../../app/styles/m3/colorTokens.js', import.meta.url);

// App colours the user can pick in Settings besides the brand blue, named
// like the macOS accent colours so "Like macOS" can follow the system one.
// Their tertiary is a neighbouring hue of the same colour (purple next to
// pink, red next to orange…), so menus, selections and highlights stay in
// the family of the chosen colour instead of bringing in the brand blue.
const ACCENTS = {
  purple: { seed: '#a550a7', tertiary: '#e0559a' },
  pink: { seed: '#f74f9e', tertiary: '#ff6f61' },
  red: { seed: '#ff5257', tertiary: '#f7821b' },
  orange: { seed: '#f7821b', tertiary: '#e0a800' },
  yellow: { seed: '#ffc600', tertiary: '#f7821b' },
  green: { seed: '#62ba46', tertiary: '#2bb5a0' },
};

const roles = Object.getOwnPropertyNames(MaterialDynamicColors)
  .filter((name) => MaterialDynamicColors[name] instanceof DynamicColor)
  .filter((name) => !/PaletteKeyColor$/.test(name))
  .sort();

// The two colour styles the user can pick in Settings, both from the
// "Vibrant" scheme variant:
// - classic: the 2021 colour spec (Material You), calm tonal containers
// - vibrant: the 2025 spec of Material 3 Expressive, with saturated
//   containers and surfaces tinted by the brand colour
const SPEC_VERSIONS = { classic: '2021', vibrant: '2025' };

// M3 contrast levels: 0 standard, 0.5 medium, 1 high
const buildScheme = (
  isDark,
  contrastLevel = 0,
  specVersion = '2021',
  seed = SEED,
  tertiarySeed = TERTIARY_SEED
) => {
  const source = Hct.fromInt(argbFromHex(seed));
  const tertiary = tertiarySeed && Hct.fromInt(argbFromHex(tertiarySeed));
  const vibrant = new SchemeVibrant(source, isDark, 0, specVersion);
  // Vibrant primary and neutrals, custom tertiary (M3 allows a custom
  // key colour per role)
  const scheme = new DynamicScheme({
    sourceColorHct: source,
    variant: Variant.VIBRANT,
    contrastLevel,
    isDark,
    specVersion,
    primaryPalette: vibrant.primaryPalette,
    secondaryPalette: vibrant.secondaryPalette,
    tertiaryPalette: tertiary
      ? TonalPalette.fromHueAndChroma(
          tertiary.hue,
          Math.max(48, tertiary.chroma)
        )
      : vibrant.tertiaryPalette,
    neutralPalette: vibrant.neutralPalette,
    neutralVariantPalette: vibrant.neutralVariantPalette,
  });

  const tokens = Object.fromEntries(
    roles.map((name) => [
      name,
      hexFromArgb(MaterialDynamicColors[name].getArgb(scheme)),
    ])
  );

  // The 2025 spec makes the lowest dark container pure black, meant for
  // OLED phones; on a Mac the settings rows then look like holes in the
  // navy dialog. Use neutral tone 4, the 2021 spec's value, instead.
  if (specVersion === '2025' && isDark) {
    tokens.surfaceContainerLowest = hexFromArgb(scheme.neutralPalette.tone(4));
  }

  return tokens;
};

const buildStyle = (specVersion, seed, tertiarySeed) => ({
  standard: {
    light: buildScheme(false, 0, specVersion, seed, tertiarySeed),
    dark: buildScheme(true, 0, specVersion, seed, tertiarySeed),
  },
  // used when macOS "Increase contrast" is on
  highContrast: {
    light: buildScheme(false, 1, specVersion, seed, tertiarySeed),
    dark: buildScheme(true, 1, specVersion, seed, tertiarySeed),
  },
});
const accents = Object.fromEntries(
  Object.entries(ACCENTS).map(([name, { seed, tertiary }]) => [
    name,
    Object.fromEntries(
      Object.entries(SPEC_VERSIONS).map(([style, spec]) => [
        style,
        buildStyle(spec, seed, tertiary),
      ])
    ),
  ])
);
const styles = Object.fromEntries(
  Object.entries(SPEC_VERSIONS).map(([style, spec]) => [
    style,
    buildStyle(spec),
  ])
);

// Green, built like the other colours, comes out loud: unlike blue it can
// be very saturated at light tones, and the schemes pick the most saturated
// tone they can, so surfaces turn mint and the dark theme's primary lime.
// Green therefore copies the brand blue role by role: blue's tone (so every
// contrast pair stays exactly as tested) and blue's chroma, in green's own
// hue for that role.
const NEUTRAL_HUE_FALLBACK_CHROMA = 2;
const likeBrandBlue = (accentTokens, blueTokens, fallbackHue) =>
  Object.fromEntries(
    Object.entries(accentTokens).map(([role, hex]) => {
      const own = Hct.fromInt(argbFromHex(hex));
      const blue = Hct.fromInt(argbFromHex(blueTokens[role]));
      const hue =
        own.chroma < NEUTRAL_HUE_FALLBACK_CHROMA ? fallbackHue : own.hue;

      return [role, hexFromArgb(Hct.from(hue, blue.chroma, blue.tone).toInt())];
    })
  );
const SOFTENED_ACCENTS = ['green'];

SOFTENED_ACCENTS.forEach((name) => {
  const fallbackHue = Hct.fromInt(argbFromHex(ACCENTS[name].seed)).hue;

  Object.keys(SPEC_VERSIONS).forEach((style) => {
    ['standard', 'highContrast'].forEach((contrast) => {
      ['light', 'dark'].forEach((theme) => {
        accents[name][style][contrast][theme] = likeBrandBlue(
          accents[name][style][contrast][theme],
          styles[style][contrast][theme],
          fallbackHue
        );
      });
    });
  });
});
const format = (value) =>
  JSON.stringify(value, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");

writeFileSync(
  OUTPUT,
  `// Generated by scripts/m3/generate-color-tokens.mjs - do not edit by hand.
// Material 3 "Vibrant" dynamic colour scheme from the brand seed ${SEED},
// with the tertiary role from the app icon's orange ${TERTIARY_SEED}.

export const M3_SEED_COLOR = '${SEED}';

// Classic style: the 2021 colour spec.
export const m3ColorTokens = ${format(styles.classic.standard)};

// High contrast level (7:1 for text), for macOS "Increase contrast".
export const m3HighContrastColorTokens = ${format(styles.classic.highContrast)};

// Vibrant style: the 2025 colour spec of Material 3 Expressive.
export const m3VibrantColorTokens = ${format(styles.vibrant.standard)};

export const m3VibrantHighContrastColorTokens = ${format(
    styles.vibrant.highContrast
  )};

// The other app colours: accent -> style -> contrast -> theme -> roles.
export const m3AccentColorTokens = ${format(accents)};
`
);

// eslint-disable-next-line no-console
console.log(
  `Wrote ${roles.length} roles x ${
    Object.keys(ACCENTS).length + 1
  } colours x 2 styles x 2 themes x 2 contrasts to ${OUTPUT.pathname}`
);
