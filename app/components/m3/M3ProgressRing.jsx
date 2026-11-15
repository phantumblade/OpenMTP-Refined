import React from 'react';
import { withStyles } from '@material-ui/core/styles';

// Material 3 Expressive circular progress: a wavy active arc, a gap, then
// the track. Without a value it spins (indeterminate).

const WAVES = 10;
const AMPLITUDE = 1.6;

const wavyArc = (center, radius, fraction) => {
  const end = Math.max(0.0001, fraction) * Math.PI * 2;
  const steps = Math.max(8, Math.ceil(120 * fraction));
  let d = '';

  for (let step = 0; step <= steps; step += 1) {
    const angle = (end * step) / steps;
    const r = radius + AMPLITUDE * Math.sin(angle * WAVES);

    d += `${step ? 'L' : 'M'}${(center + r * Math.sin(angle)).toFixed(2)} ${(
      center -
      r * Math.cos(angle)
    ).toFixed(2)}`;
  }

  return d;
};

const styles = (theme) => ({
  root: {
    display: 'block',
    overflow: 'visible',
  },
  track: {
    fill: 'none',
    stroke: theme.palette.m3.secondaryContainer,
    strokeLinecap: 'round',
  },
  arc: {
    fill: 'none',
    stroke: theme.palette.m3.primary,
    strokeLinecap: 'round',
    transition: 'd 240ms linear',
  },
  spin: {
    transformOrigin: 'center',
    transformBox: 'fill-box',
    animation: '$spin 1.2s linear infinite',
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  },
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
});

function M3ProgressRing({
  classes,
  className,
  value = null,
  size = 56,
  thickness = 4,
}) {
  const center = size / 2;
  const radius = center - thickness - AMPLITUDE;
  const indeterminate = value === null || value === undefined;
  const fraction = indeterminate ? 0.28 : Math.max(0, Math.min(1, value / 100));
  const circumference = 2 * Math.PI * radius;
  // the track starts a little after the arc and stops a little before it
  const gap = 0.08;
  const trackLength = Math.max(0, 1 - fraction - gap * 2);

  return (
    <svg
      className={`${classes.root}${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
    >
      <circle
        className={classes.track}
        cx={center}
        cy={center}
        r={radius}
        strokeWidth={thickness}
        // spinning: the whole track shows under the moving arc
        strokeDasharray={
          indeterminate
            ? undefined
            : `${trackLength * circumference} ${circumference}`
        }
        strokeDashoffset={
          indeterminate ? undefined : -(fraction + gap) * circumference
        }
        transform={`rotate(-90 ${center} ${center})`}
      />
      <g className={indeterminate ? classes.spin : undefined}>
        {fraction > 0.002 && (
          <path
            className={classes.arc}
            d={wavyArc(center, radius, Math.min(fraction, 0.999))}
            strokeWidth={thickness}
          />
        )}
      </g>
    </svg>
  );
}

export default withStyles(styles)(M3ProgressRing);
