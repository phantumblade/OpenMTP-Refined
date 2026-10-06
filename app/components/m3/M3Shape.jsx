import React from 'react';
import { getShape, toSvgPath } from 'shape-morph';

// A Material 3 Expressive shape (from the M3 shape library, e.g. "Cookie9Sided",
// "SoftBurst", "Sunny") used as a coloured container, typically for an icon.

const pathCache = new Map();

const shapePath = (name) => {
  if (!pathCache.has(name)) {
    pathCache.set(name, toSvgPath(getShape(name), 100));
  }

  return pathCache.get(name);
};

export default function M3Shape({
  shape = 'Circle',
  size = 40,
  color,
  rotation = 0,
  className,
  style,
  children,
}) {
  return (
    <span
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{
          position: 'absolute',
          inset: 0,
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
        }}
      >
        <path d={shapePath(shape)} fill={color} />
      </svg>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        {children}
      </span>
    </span>
  );
}
