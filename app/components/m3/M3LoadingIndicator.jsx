import React, { useEffect, useRef } from 'react';
import { Morph, getShape, toPathD } from 'shape-morph';

// Material 3 Expressive loading indicator, ported from Compose's
// androidx.compose.material3.LoadingIndicator (indeterminate variant):
// the shape morphs through seven Material shapes, one every 650ms, driven by
// a spring (damping 0.6, stiffness 200), rotating +90deg per morph on top of
// a constant 360deg / 4666ms rotation. Shapes and morphing come from
// shape-morph, a port of androidx.graphics.shapes.

export const INDETERMINATE_SHAPES = [
  'SoftBurst',
  'Cookie9Sided',
  'Pentagon',
  'Pill',
  'Sunny',
  'Cookie4Sided',
  'Oval',
];

export const MORPH_INTERVAL_MS = 650;
const GLOBAL_ROTATION_MS = 4666;
const QUARTER_ROTATION = 90;

// LoadingIndicatorTokens: ActiveSize 38dp in a 48dp container.
const ACTIVE_INDICATOR_SCALE = 38 / 48;

// Underdamped spring from rest at 0 towards 1 (Compose spring(0.6f, 200f)).
const DAMPING_RATIO = 0.6;
const STIFFNESS = 200;
const NATURAL_FREQ = Math.sqrt(STIFFNESS);
const DECAY = DAMPING_RATIO * NATURAL_FREQ;
const DAMPED_FREQ = NATURAL_FREQ * Math.sqrt(1 - DAMPING_RATIO ** 2);

export const springValue = (seconds) =>
  1 -
  Math.exp(-DECAY * seconds) *
    (Math.cos(DAMPED_FREQ * seconds) +
      (DECAY / DAMPED_FREQ) * Math.sin(DAMPED_FREQ * seconds));

// Compose ends the spring once it is within visibilityThreshold (0.1) of the
// target, i.e. when the oscillation envelope drops below 0.1 (~298ms).
export const SPRING_END_MS =
  (Math.log(Math.hypot(1, DECAY / DAMPED_FREQ) / 0.1) / DECAY) * 1000;

let cachedSequence = null;

// Morphs between consecutive shapes (and last -> first), plus the scale that
// keeps every shape inside the container at any rotation.
export const getMorphSequence = () => {
  if (!cachedSequence) {
    const polygons = INDETERMINATE_SHAPES.map((name) => getShape(name));
    let scaleFactor = 1;

    polygons.forEach((polygon) => {
      const [left, top, right, bottom] = polygon.calculateBounds();
      const [maxLeft, maxTop, maxRight, maxBottom] =
        polygon.calculateMaxBounds();
      const scaleX = (right - left) / (maxRight - maxLeft);
      const scaleY = (bottom - top) / (maxBottom - maxTop);

      scaleFactor = Math.min(scaleFactor, Math.max(scaleX, scaleY));
    });

    cachedSequence = {
      polygons,
      morphs: polygons.map(
        (polygon, index) =>
          new Morph(polygon, polygons[(index + 1) % polygons.length])
      ),
      scaleFactor: scaleFactor * ACTIVE_INDICATOR_SCALE,
    };
  }

  return cachedSequence;
};

export const cubicsBoundsCenter = (cubics) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  cubics.forEach(({ points }) => {
    for (let i = 0; i < 8; i += 2) {
      minX = Math.min(minX, points[i]);
      maxX = Math.max(maxX, points[i]);
      minY = Math.min(minY, points[i + 1]);
      maxY = Math.max(maxY, points[i + 1]);
    }
  });

  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
};

// State of the indeterminate animation [elapsedMs] after it started.
// Compose stops each spring once it is within 0.1 of its target and snaps to
// it, which makes the shape and the rotation jump (up to 9deg) every 650ms.
// Here each spring keeps running until the next morph starts, when only
// ~0.4% of the motion is left, so the hand-over is invisible.
export const frameAt = (elapsedMs, sequenceLength, rotate) => {
  const cycle = Math.floor(elapsedMs / MORPH_INTERVAL_MS);
  const inCycle = elapsedMs - cycle * MORPH_INTERVAL_MS;
  const progress = springValue(inCycle / 1000);
  const targetAngle = QUARTER_ROTATION * ((cycle + 1) % 4);
  const globalRotation = rotate
    ? ((elapsedMs % GLOBAL_ROTATION_MS) / GLOBAL_ROTATION_MS) * 360
    : 0;

  return {
    morphIndex: cycle % sequenceLength,
    inCycle,
    progress,
    rotation: progress * QUARTER_ROTATION + targetAngle + globalRotation,
  };
};

export default function M3LoadingIndicator({
  size = 48,
  contained = false,
  color = 'currentColor',
  containerColor = 'transparent',
  className,
  style,
  'aria-label': ariaLabel,
}) {
  const pathRef = useRef(null);

  useEffect(() => {
    const { morphs, scaleFactor } = getMorphSequence();
    const scaled = size * scaleFactor;
    const center = size / 2;
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    let frameId = null;

    const draw = (now) => {
      const path = pathRef.current;

      if (path) {
        const { morphIndex, progress, rotation } = frameAt(
          // rAF timestamps can predate `start` by a frame
          Math.max(0, now - start),
          morphs.length,
          !reduceMotion
        );
        const cubics = morphs[morphIndex].asCubics(progress);
        const boundsCenter = cubicsBoundsCenter(cubics);

        path.setAttribute('d', toPathD(cubics, scaled));
        path.setAttribute(
          'transform',
          `rotate(${rotation} ${center} ${center}) translate(${
            center - boundsCenter.x * scaled
          } ${center - boundsCenter.y * scaled})`
        );
      }

      frameId = window.requestAnimationFrame(draw);
    };

    frameId = window.requestAnimationFrame(draw);

    return () => window.cancelAnimationFrame(frameId);
  }, [size]);

  return (
    <svg
      role="progressbar"
      aria-label={ariaLabel}
      aria-busy="true"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      {contained && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill={containerColor}
        />
      )}
      <path ref={pathRef} fill={color} />
    </svg>
  );
}
