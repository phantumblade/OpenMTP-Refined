import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import MaterialSymbol from './MaterialSymbol';
import {
  alphaHex,
  m3Motion,
  m3Shape,
  m3State,
  m3Type,
} from '../../styles/m3/tokens';

// Material 3 Expressive common button. Round by default; while pressed the
// corners morph to a squarer shape with a spatial spring, as in the M3
// Expressive button specs.

// Button tokens (ButtonXSmall/Small/MediumTokens): round shape = height / 2,
// pressed shape = CornerSmall (8) for XS/S and CornerMedium (12) for M.
const SIZES = {
  xsmall: {
    height: 32,
    paddingX: 12,
    gap: 4,
    icon: 20,
    pressedRadius: m3Shape.small,
    type: m3Type.labelLarge,
  },
  small: {
    height: 40,
    paddingX: 16,
    gap: 8,
    icon: 20,
    pressedRadius: m3Shape.small,
    type: m3Type.labelLarge,
  },
  medium: {
    height: 56,
    paddingX: 24,
    gap: 8,
    icon: 24,
    pressedRadius: m3Shape.medium,
    type: m3Type.titleMedium,
  },
};

const styles = (theme) => {
  const { m3 } = theme.palette;

  const colors = {
    filled: { background: m3.primary, color: m3.onPrimary },
    tonal: {
      background: m3.secondaryContainer,
      color: m3.onSecondaryContainer,
    },
    tertiary: {
      background: m3.tertiaryContainer,
      color: m3.onTertiaryContainer,
    },
    error: { background: m3.error, color: m3.onError },
    outlined: {
      background: 'transparent',
      color: m3.onSurfaceVariant,
      boxShadow: `inset 0 0 0 1px ${m3.outlineVariant}`,
    },
    text: { background: 'transparent', color: m3.primary },
  };

  return {
    root: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      margin: 0,
      overflow: 'hidden',
      cursor: 'pointer',
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      outline: 'none',
      // shape morphs with the expressive fast spatial spring; colours with
      // the (non-bouncy) effects spring
      transition: `border-radius ${m3Motion.fastSpatial}, background-color ${m3Motion.defaultEffects}, color ${m3Motion.defaultEffects}, box-shadow ${m3Motion.defaultEffects}`,
      // state layer
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundColor: 'currentColor',
        opacity: 0,
        transition: `opacity ${m3Motion.fastEffects}`,
        pointerEvents: 'none',
      },
      '&:hover::before': { opacity: m3State.hover },
      '&:focus-visible::before': { opacity: m3State.focus },
      '&:active::before': { opacity: m3State.pressed },
      '&:focus-visible': {
        boxShadow: `0 0 0 3px ${m3.secondary}`,
      },
      '&:disabled': {
        cursor: 'default',
        backgroundColor: alphaHex(m3.onSurface, m3State.disabledContainer),
        color: alphaHex(m3.onSurface, m3State.disabledContent),
        boxShadow: 'none',
        '&::before': { opacity: 0 },
      },
    },
    ...Object.keys(SIZES).reduce(
      (acc, size) => ({
        ...acc,
        [size]: {
          height: SIZES[size].height,
          // a real radius (not 9999px) so the press morph animates smoothly
          borderRadius: SIZES[size].height / 2,
          padding: `0 ${SIZES[size].paddingX}px`,
          gap: SIZES[size].gap,
          ...SIZES[size].type,
          '&:active:not(:disabled)': {
            borderRadius: SIZES[size].pressedRadius,
          },
        },
      }),
      {}
    ),
    ...Object.keys(colors).reduce(
      (acc, variant) => ({
        ...acc,
        [variant]: {
          backgroundColor: colors[variant].background,
          color: colors[variant].color,
          boxShadow: colors[variant].boxShadow,
        },
      }),
      {}
    ),
    label: {
      position: 'relative',
    },
  };
};

function M3Button({
  classes,
  className,
  variant = 'filled',
  size = 'small',
  icon,
  trailingIcon,
  children,
  ...buttonProps
}) {
  const iconSize = SIZES[size].icon;

  return (
    <button
      type="button"
      className={classNames(
        classes.root,
        classes[size],
        classes[variant],
        className
      )}
      {...buttonProps}
    >
      {icon && (
        <MaterialSymbol
          name={icon}
          size={iconSize}
          weight={500}
          className={classes.label}
        />
      )}
      <span className={classes.label}>{children}</span>
      {trailingIcon && (
        <MaterialSymbol
          name={trailingIcon}
          size={iconSize}
          weight={500}
          className={classes.label}
        />
      )}
    </button>
  );
}

export default withStyles(styles)(M3Button);
