import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

// Renders a Material Symbols (Rounded) glyph inside MUI's SvgIcon, so symbol
// icons are drop-in replacements for @material-ui/icons: same sizing
// (fontSize prop, 1em box), colour props, classes and `svg` selectors.
export function SymbolGlyph({ name, fill = 0, weight = 400, grade = 0 }) {
  return (
    <text
      x="12"
      y="12"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="24"
      style={{
        fontFamily: '"Material Symbols Rounded"',
        fontFeatureSettings: '"liga"',
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' 24`,
        transition:
          'font-variation-settings 200ms cubic-bezier(0.34, 0.8, 0.34, 1)',
      }}
    >
      {name}
    </text>
  );
}

export default function createSymbolIcon(
  name,
  { fill = 0, weight = 400 } = {}
) {
  const Icon = React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SvgIcon ref={ref} {...props}>
      <SymbolGlyph name={name} fill={fill} weight={weight} />
    </SvgIcon>
  ));

  Icon.displayName = `SymbolIcon(${name})`;
  Icon.muiName = SvgIcon.muiName;

  return Icon;
}
