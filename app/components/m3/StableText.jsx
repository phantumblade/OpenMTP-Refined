import React from 'react';
import { withStyles } from '@material-ui/core/styles';

// Text that switches between a few variants without moving the layout: every
// variant sits in the same grid cell (the inactive ones invisible), so the
// block is always as tall as its longest variant. The new text fades and
// slides in quickly (M3 emphasized decelerate easing).

const styles = {
  root: {
    display: 'grid',
    justifyItems: 'center',
  },
  variant: {
    gridArea: '1 / 1',
  },
  hidden: {
    visibility: 'hidden',
  },
  '@keyframes enter': {
    from: { opacity: 0, transform: 'translateY(6px)' },
    to: { opacity: 1, transform: 'none' },
  },
  enter: {
    animation: '$enter 220ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
};

function StableText({ classes, as: Tag = 'div', className, variants, active }) {
  return (
    <Tag className={`${classes.root}${className ? ` ${className}` : ''}`}>
      {variants.map((text, index) => {
        const isActive = index === active;

        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            aria-hidden={!isActive || undefined}
            className={`${classes.variant} ${
              isActive ? classes.enter : classes.hidden
            }`}
          >
            {text}
          </span>
        );
      })}
    </Tag>
  );
}

export default withStyles(styles)(StableText);
