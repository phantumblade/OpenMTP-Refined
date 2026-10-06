import React, { useEffect, useRef } from 'react';

// Material 3 Expressive linear wavy progress indicator, following Compose's
// LinearWavyProgressIndicator (LinearProgressIndicatorTokens): 4dp strokes,
// 3dp wave amplitude, 40dp wavelength (20dp indeterminate) travelling one
// wavelength per second, a 4dp gap before the track and a 4dp stop dot.
// The wave flattens below 10% and above 95% progress, as in Compose.

const HEIGHT = 10;
const STROKE = 4;
const AMPLITUDE = 3;
const WAVELENGTH = 40;
const INDETERMINATE_WAVELENGTH = 20;
const GAP = 4;
const STOP_SIZE = 4;
// time constant of the progress smoothing: ~95% of a jump is covered in 3x
const PROGRESS_SMOOTHING_MS = 280;
const RESET_THRESHOLD = 0.2;

export const smoothingFactor = (dtMs) =>
  1 - Math.exp(-Math.max(0, dtMs) / PROGRESS_SMOOTHING_MS);
const AMPLITUDE_ANIMATION_MS = 500;
const INDETERMINATE_CYCLE_MS = 1750;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export const targetAmplitude = (progress) =>
  progress <= 0.1 || progress >= 0.95 ? 0 : 1;

// Sine wave from x0 to x1 around the vertical centre, sampled every 2px.
const wavePath = (x0, x1, amplitude, wavelength, phase) => {
  if (x1 - x0 < 0.5) {
    return '';
  }

  const centre = HEIGHT / 2;
  const points = [];

  for (let x = x0; x < x1; x += 2) {
    points.push([
      x,
      centre + amplitude * Math.sin(((x + phase) / wavelength) * Math.PI * 2),
    ]);
  }

  points.push([
    x1,
    centre + amplitude * Math.sin(((x1 + phase) / wavelength) * Math.PI * 2),
  ]);

  return points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join('');
};

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// Compose-like indeterminate keyframes: two segments sweeping left to right.
const indeterminateSegments = (elapsed) => {
  const t = (elapsed % INDETERMINATE_CYCLE_MS) / INDETERMINATE_CYCLE_MS;
  const window = (start, end) =>
    easeInOut(clamp01((t - start) / (end - start)));

  return [
    [window(0.14, 0.71), window(0, 0.57)],
    [window(0.51, 1), window(0.37, 0.86)],
  ].map(([tail, head]) => [tail, head]);
};

export default function M3WavyProgress({
  value = 0,
  indeterminate = false,
  color = 'var(--md-sys-color-primary)',
  trackColor = 'var(--md-sys-color-secondary-container)',
  className,
  style,
  'aria-label': ariaLabel,
}) {
  const svgRef = useRef(null);
  const activeRef = useRef(null);
  const active2Ref = useRef(null);
  const trackRef = useRef(null);
  const stopRef = useRef(null);
  const valueRef = useRef(clamp01(value / 100));

  valueRef.current = clamp01(value / 100);

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    let shown = valueRef.current;
    let amplitude = targetAmplitude(shown);
    let last = start;
    let frameId = null;

    const draw = (now) => {
      const svg = svgRef.current;

      if (!svg) {
        return;
      }

      const width = svg.clientWidth || 0;
      const elapsed = Math.max(0, now - start);
      const dt = Math.max(0, now - last);
      const half = STROKE / 2;

      last = now;

      if (indeterminate) {
        const phase = reduceMotion
          ? 0
          : (elapsed / 1000) * INDETERMINATE_WAVELENGTH;
        const segments = indeterminateSegments(elapsed);

        [activeRef, active2Ref].forEach((ref, i) => {
          const [tail, head] = segments[i];

          ref.current.setAttribute(
            'd',
            wavePath(
              half + tail * (width - STROKE),
              half + head * (width - STROKE),
              AMPLITUDE,
              INDETERMINATE_WAVELENGTH,
              -phase
            )
          );
        });
        trackRef.current.setAttribute(
          'd',
          `M${half} ${HEIGHT / 2}L${width - half} ${HEIGHT / 2}`
        );
      } else {
        // Transfer progress arrives in bursts (e.g. when a file completes).
        // Chase it with exponential smoothing so the bar glides instead of
        // jumping and pausing; it only moves backwards on a large reset
        // (a new transfer), never because of jitter.
        const target = valueRef.current;
        const isReset = target < shown - RESET_THRESHOLD;

        if (isReset) {
          shown = target;
        } else if (target > shown) {
          shown += (target - shown) * smoothingFactor(dt);

          if (target - shown < 0.0005) {
            shown = target;
          }
        }

        const ampTarget = targetAmplitude(shown);
        const ampStep = dt / AMPLITUDE_ANIMATION_MS;

        amplitude =
          Math.abs(ampTarget - amplitude) <= ampStep
            ? ampTarget
            : amplitude + Math.sign(ampTarget - amplitude) * ampStep;

        const phase = reduceMotion ? 0 : (elapsed / 1000) * WAVELENGTH;
        const end = half + shown * (width - STROKE);

        activeRef.current.setAttribute(
          'd',
          shown > 0
            ? wavePath(half, end, amplitude * AMPLITUDE, WAVELENGTH, -phase)
            : ''
        );
        active2Ref.current.setAttribute('d', '');

        const trackStart = end + (shown > 0 ? GAP + STROKE : 0);
        const trackEnd = width - half;

        trackRef.current.setAttribute(
          'd',
          trackStart < trackEnd
            ? `M${trackStart} ${HEIGHT / 2}L${trackEnd} ${HEIGHT / 2}`
            : ''
        );
        stopRef.current.setAttribute('cx', width - STOP_SIZE / 2);
        stopRef.current.setAttribute('opacity', shown < 1 ? 1 : 0);
      }

      frameId = window.requestAnimationFrame(draw);
    };

    frameId = window.requestAnimationFrame(draw);

    return () => window.cancelAnimationFrame(frameId);
  }, [indeterminate]);

  const lineProps = {
    fill: 'none',
    strokeWidth: STROKE,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  return (
    <svg
      ref={svgRef}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
      width="100%"
      height={HEIGHT}
      className={className}
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <path ref={trackRef} stroke={trackColor} {...lineProps} />
      {!indeterminate && (
        <circle ref={stopRef} cy={HEIGHT / 2} r={STOP_SIZE / 2} fill={color} />
      )}
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <path ref={activeRef} stroke={color} {...lineProps} />
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <path ref={active2Ref} stroke={color} {...lineProps} />
    </svg>
  );
}
