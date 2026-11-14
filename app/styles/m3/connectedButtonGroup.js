import { m3Motion, m3State, m3Type } from './tokens';

// Material 3 Expressive connected button group, pressed like AnalogIA's:
// 2dp gaps, full outer corners and 8dp inner corners; the pressed button
// pinches its inner corners to 4dp and widens while its neighbours give
// way (the group is :active too), then everything springs back. The chosen
// button turns fully round in the app colour; pressed again it shows the
// plain shape until released. Tonal (secondary container) at rest.
//
// One definition for every connected group in the app ("Sort by", the
// filters in the pane footer), so they all press the same way. Returns
// JSS rules under the names given in `names`.

const PRESS = '119ms cubic-bezier(0.2, 0, 0, 1)';
// pressing is quick and plain (no overshoot); the release springs back
const PRESSING = [
  `border-radius ${PRESS}`,
  `padding ${PRESS}`,
  `background-color 200ms linear`,
  `color 200ms linear`,
].join(', ');
const RELEASING = [
  `border-radius ${m3Motion.fastSpatial}`,
  `padding ${m3Motion.fastSpatial}`,
  `background-color ${m3Motion.defaultEffects}`,
  `color ${m3Motion.defaultEffects}`,
].join(', ');

export const CONNECTED_GROUP_OUTER = 20;
export const CONNECTED_GROUP_INNER = 8;
const PINCHED = 4;

// horizontal padding of the pressed button and of the others while one is
// pressed: the pressed one gains what the others give up
const pressPaddings = (paddingX, count) => {
  const grow = Math.round((paddingX * 3) / 4);
  const give = Math.round((grow * 2) / (count - 1) / 2);

  return { pressed: paddingX + grow, others: paddingX - give };
};

export const connectedButtonGroup = (
  m3,
  {
    names = { group: 'group', button: 'button', active: 'buttonActive' },
    height = 40,
    paddingX = 16,
    // padding in narrow windows (two panes side by side in a small window)
    narrowPaddingX = 12,
    narrowQuery = '@media (max-width: 1000px)',
    // buttons in the group, so the pressed one's growth is balanced
    count = 4,
  } = {}
) => {
  const button = `$${names.button}`;
  const wide = pressPaddings(paddingX, count);
  const narrow = pressPaddings(narrowPaddingX, count);

  return {
    [names.group]: {
      display: 'flex',
      flexShrink: 0,
      gap: 2,
      [`&:active > ${button}`]: {
        padding: `0 ${wide.others}px`,
        transition: PRESSING,
      },
      [`& > ${button}:active`]: {
        padding: `0 ${wide.pressed}px`,
      },
      [narrowQuery]: {
        [`&:active > ${button}`]: { padding: `0 ${narrow.others}px` },
        [`& > ${button}:active`]: { padding: `0 ${narrow.pressed}px` },
      },
      '@media (prefers-reduced-motion: reduce)': {
        [`&:active > ${button}, & > ${button}:active`]: {
          padding: `0 ${paddingX}px`,
        },
      },
    },
    [names.button]: {
      ...m3Type.labelLarge,
      position: 'relative',
      isolation: 'isolate',
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '1 0 auto',
      height,
      padding: `0 ${paddingX}px`,
      border: 'none',
      borderRadius: CONNECTED_GROUP_INNER,
      backgroundColor: m3.secondaryContainer,
      color: m3.onSecondaryContainer,
      fontFamily: 'inherit',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      outline: 'none',
      // released: shape and width spring back
      transition: RELEASING,
      // state layer in the content colour (hover 8%, pressed 10%)
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        backgroundColor: 'currentColor',
        opacity: 0,
        transition: `opacity ${m3Motion.fastEffects}`,
      },
      '&:hover::before': { opacity: m3State.hover },
      '&:first-child': {
        borderTopLeftRadius: CONNECTED_GROUP_OUTER,
        borderBottomLeftRadius: CONNECTED_GROUP_OUTER,
      },
      '&:last-child': {
        borderTopRightRadius: CONNECTED_GROUP_OUTER,
        borderBottomRightRadius: CONNECTED_GROUP_OUTER,
      },
      // pressed: the inner corners pinch
      '&:active': {
        borderRadius: PINCHED,
      },
      '&:active::before': { opacity: m3State.pressed },
      '&:first-child:active': {
        borderTopLeftRadius: CONNECTED_GROUP_OUTER,
        borderBottomLeftRadius: CONNECTED_GROUP_OUTER,
      },
      '&:last-child:active': {
        borderTopRightRadius: CONNECTED_GROUP_OUTER,
        borderBottomRightRadius: CONNECTED_GROUP_OUTER,
      },
      '&:focus-visible': {
        outline: `3px solid ${m3.secondary}`,
        outlineOffset: 2,
      },
      [narrowQuery]: {
        padding: `0 ${narrowPaddingX}px`,
      },
      '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
    // chosen button: fully round in the app colour; pressed again it shows
    // the unselected shape until released
    [names.active]: {
      borderRadius: CONNECTED_GROUP_OUTER,
      backgroundColor: m3.primary,
      color: m3.onPrimary,
      '&:active': { borderRadius: CONNECTED_GROUP_INNER },
      '&:first-child:active': {
        borderRadius: `${CONNECTED_GROUP_OUTER}px ${CONNECTED_GROUP_INNER}px ${CONNECTED_GROUP_INNER}px ${CONNECTED_GROUP_OUTER}px`,
      },
      '&:last-child:active': {
        borderRadius: `${CONNECTED_GROUP_INNER}px ${CONNECTED_GROUP_OUTER}px ${CONNECTED_GROUP_OUTER}px ${CONNECTED_GROUP_INNER}px`,
      },
    },
  };
};
