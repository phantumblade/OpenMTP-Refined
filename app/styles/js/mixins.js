// eslint-disable-next-line no-unused-vars
import { checkIf } from '../../utils/checkIf';
import { alphaHex, m3State } from '../m3/tokens';
import { m3VibrantColorTokens } from '../m3/colorTokens';

const stateLayer = (color, opacity) =>
  `linear-gradient(${alphaHex(color, opacity)}, ${alphaHex(color, opacity)})`;

export const commonThemes = {
  resetUl: {
    'margin-block-start': 'unset',
  },
  noselect: {
    [`-webkitTouchCallout`]: `none`,
    [`-webkitUserSelect`]: `none`,
    [`-khtmlUserSelect`]: `none`,
    [`-mozUserSelect`]: `none`,
    [`-msUserSelect`]: `none`,
    [`userSelect`]: `none`,
  },
  noDrag: {
    WebkitUserDrag: 'none',
    KhtmlUserDrag: 'none',
    MozUserDrag: 'none',
    OUserDrag: 'none',
    userDrag: 'none',
  },
  noOutline: {
    outline: `none !important`,
  },
  absoluteCenter: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    WebkitTransform: 'translate(-50%, -50%)',
    transform: 'translate(-50%, -50%)',
  },
  center: {
    marginLeft: `auto`,
    marginRight: `auto`,
  },
  get appDragEnable() {
    return {
      [`-webkitAppRegion`]: `drag`,
      ...this.noselect,
    };
  },
  appDragDisable: {
    [`-webkitAppRegion`]: `no-drag`,
  },
};

export default ({ theme }) => {
  checkIf(theme, 'object');

  // components styled outside the app's theme (the App root itself) get
  // the default scheme; they don't use the button mixins
  const m3 = theme.palette?.m3 ?? m3VibrantColorTokens.light;

  return {
    ...commonThemes,
    a: {
      cursor: `pointer`,
      color: theme.palette.secondary.main,
    },
    // M3 filled button in the app colour; hover and press add the
    // on-primary state layer on top
    btnPositive: {
      backgroundColor: m3.primary,
      borderColor: m3.primary,
      color: m3.onPrimary,
      '&:hover': {
        backgroundColor: m3.primary,
        backgroundImage: stateLayer(m3.onPrimary, m3State.hover),
      },
      '&:active': {
        boxShadow: 'none',
        backgroundColor: m3.primary,
        backgroundImage: stateLayer(m3.onPrimary, m3State.pressed),
      },
      '&.Mui-focusVisible': {
        outline: `3px solid ${m3.secondary}`,
        outlineOffset: 2,
      },
    },

    // M3 tonal button
    btnNegative: {
      backgroundColor: m3.secondaryContainer,
      borderColor: m3.secondaryContainer,
      color: m3.onSecondaryContainer,
      '&:hover': {
        backgroundColor: m3.secondaryContainer,
        backgroundImage: stateLayer(m3.onSecondaryContainer, m3State.hover),
      },
      '&:active': {
        boxShadow: 'none',
        backgroundColor: m3.secondaryContainer,
        backgroundImage: stateLayer(m3.onSecondaryContainer, m3State.pressed),
      },
      '&.Mui-focusVisible': {
        outline: `3px solid ${m3.secondary}`,
        outlineOffset: 2,
      },
    },

    // M3 outlined button
    btnNegativeWhite: {
      border: `1px solid ${m3.outline}`,
      backgroundColor: 'transparent',
      color: m3.onSurfaceVariant,
      '&:hover': {
        backgroundColor: alphaHex(m3.onSurfaceVariant, m3State.hover),
      },
      '&:active': {
        boxShadow: 'none',
        backgroundColor: alphaHex(m3.onSurfaceVariant, m3State.pressed),
      },
      '&.Mui-focusVisible': {
        outline: `3px solid ${m3.secondary}`,
        outlineOffset: 2,
      },
    },
  };
};
