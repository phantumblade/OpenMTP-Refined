const assert = require('assert');
const {
  m3ColorTokens,
  m3HighContrastColorTokens,
  m3VibrantColorTokens,
  m3VibrantHighContrastColorTokens,
} = require('../../app/styles/m3/colorTokens');

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const value = parseInt(hex.slice(i, i + 2), 16) / 255;

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (light + 0.05) / (dark + 0.05);
};

// text roles and the containers they are painted on
const TEXT_PAIRS = [
  ['onSurface', 'surface'],
  ['onSurfaceVariant', 'surface'],
  ['onSurface', 'surfaceContainerHigh'],
  ['onPrimary', 'primary'],
  ['onPrimaryContainer', 'primaryContainer'],
  ['onSecondaryContainer', 'secondaryContainer'],
  ['onTertiaryContainer', 'tertiaryContainer'],
  // menus: standard items, vibrant selected item
  ['onSurfaceVariant', 'surfaceContainerLow'],
  ['onTertiary', 'tertiary'],
  ['onErrorContainer', 'errorContainer'],
  ['primary', 'surface'],
];

function main() {
  const styles = {
    classic: [m3ColorTokens, m3HighContrastColorTokens],
    vibrant: [m3VibrantColorTokens, m3VibrantHighContrastColorTokens],
  };

  Object.entries(styles).forEach(([style, [standard, highContrast]]) => {
    [
      [standard, 4.5],
      [highContrast, 7],
    ].forEach(([tokens, minimum]) => {
      ['light', 'dark'].forEach((mode) => {
        // both styles expose the same roles, so every style works everywhere
        assert.deepStrictEqual(
          Object.keys(tokens[mode]).sort(),
          Object.keys(m3ColorTokens.light).sort(),
          `${style} ${mode} roles`
        );

        TEXT_PAIRS.forEach(([text, background]) => {
          const ratio = contrast(tokens[mode][text], tokens[mode][background]);

          assert.ok(
            ratio >= minimum,
            `${style} ${mode} ${text} on ${background}: ${ratio.toFixed(
              2
            )} < ${minimum}`
          );
        });
      });
    });
  });

  // the vibrant style is visibly more colourful than the classic one
  ['light', 'dark'].forEach((mode) => {
    assert.notStrictEqual(
      m3VibrantColorTokens[mode].primaryContainer,
      m3ColorTokens[mode].primaryContainer
    );
  });

  // eslint-disable-next-line no-console
  console.log('M3 colour style contrast invariants: ok');
}

main();
