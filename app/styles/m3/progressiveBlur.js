import { alphaHex } from './tokens';

// A bar floating over scrolling content on a progressive blur: two blurred
// layers that reach past the bar, each fading out away from the screen
// edge it sits on, so the content goes from sharp to softly blurred with no
// hard line. The lighter one reaches further; the stronger one, with the
// tint, sits behind the bar. Used by the pane footer (edge: 'bottom') and
// the "Sort by" bar (edge: 'top'). The element needs a positioning context
// (relative, absolute or sticky) and `isolation: isolate`.

// a band fully applied from the edge to `solidFrom`% and fading to nothing
const fadeMask = (direction, solidFrom) => {
  const mask = `linear-gradient(${direction}, #000 0%, #000 ${solidFrom}%, transparent 100%)`;

  return { maskImage: mask, WebkitMaskImage: mask };
};

export const progressiveBlur = (m3, { edge = 'bottom', fade = 32 } = {}) => {
  // from the edge towards the content
  const direction = edge === 'bottom' ? 'to top' : 'to bottom';
  const reach = edge === 'bottom' ? 'top' : 'bottom';

  return {
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      [edge]: 0,
      zIndex: -1,
      pointerEvents: 'none',
    },
    '&::before': {
      [reach]: -fade,
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)',
      ...fadeMask(direction, 40),
    },
    '&::after': {
      [reach]: -fade / 2,
      backdropFilter: 'blur(7px) saturate(1.3)',
      WebkitBackdropFilter: 'blur(7px) saturate(1.3)',
      backgroundColor: alphaHex(m3.surfaceContainerLow, 0.62),
      ...fadeMask(direction, 55),
    },
  };
};
