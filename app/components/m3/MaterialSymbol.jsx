import React from 'react';

// Material Symbols (Rounded) icon. The font is variable, so fill, weight,
// grade and optical size are set through font-variation-settings as
// documented at https://developers.google.com/fonts/docs/material_symbols
export default function MaterialSymbol({
  name,
  size = 24,
  fill = 0,
  weight = 400,
  grade = 0,
  className,
  style,
}) {
  const opticalSize = Math.min(48, Math.max(20, size));

  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded${className ? ` ${className}` : ''}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
        userSelect: 'none',
        ...style,
      }}
    >
      {name}
    </span>
  );
}
