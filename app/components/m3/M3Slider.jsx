import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { m3Motion, m3Type } from '../../styles/m3/tokens';

// Material 3 Expressive slider (Compose SliderDefaults, 2025): a 16dp track
// split by a 4dp x 44dp bar handle with a 6dp gap on each side, full outer
// corners and 2dp inner corners, 4dp stop dots, and a value label above the
// handle while it is dragged or focused. The handle narrows to 2dp while
// pressed and springs between stops.
//
// Discrete: `values` lists the stops. `onChange` fires while dragging,
// `onChangeCommitted` when the pointer is released or a key is pressed.

const TRACK = 16;
const HANDLE = 4;
const GAP = 6;
const INSET = GAP + HANDLE / 2; // handle travel inset from the track ends
const HEIGHT = 44;

// position of stop `p` (0..1) along the track, as a CSS length
const at = (p) => `calc(${INSET}px + (100% - ${INSET * 2}px) * ${p})`;

const styles = (theme) => {
  const { m3 } = theme.palette;
  const spatial = m3Motion.fastSpatial;

  return {
    root: {
      position: 'relative',
      flex: 1,
      minWidth: 120,
      height: HEIGHT,
      cursor: 'pointer',
      touchAction: 'none',
      outline: 'none',
      userSelect: 'none',
    },
    disabled: {
      cursor: 'default',
      opacity: 0.38,
    },
    track: {
      position: 'absolute',
      top: (HEIGHT - TRACK) / 2,
      height: TRACK,
      transition: `width ${spatial}, left ${spatial}`,
    },
    active: {
      left: 0,
      borderRadius: `${TRACK / 2}px 2px 2px ${TRACK / 2}px`,
      backgroundColor: m3.primary,
    },
    inactive: {
      right: 0,
      borderRadius: `2px ${TRACK / 2}px ${TRACK / 2}px 2px`,
      backgroundColor: m3.secondaryContainer,
    },
    stop: {
      position: 'absolute',
      top: HEIGHT / 2 - 2,
      width: 4,
      height: 4,
      marginLeft: -2,
      borderRadius: 2,
      backgroundColor: m3.onSecondaryContainer,
      pointerEvents: 'none',
      transition: `background-color ${m3Motion.fastEffects}, opacity ${m3Motion.fastEffects}`,
    },
    stopActive: {
      backgroundColor: m3.onPrimary,
    },
    stopHidden: {
      opacity: 0,
    },
    handle: {
      position: 'absolute',
      top: 0,
      width: HANDLE,
      height: HEIGHT,
      marginLeft: -HANDLE / 2,
      borderRadius: 2,
      backgroundColor: m3.primary,
      transition: `left ${spatial}, width ${spatial}, margin ${spatial}`,
    },
    handlePressed: {
      width: 2,
      marginLeft: -1,
    },
    // value label: an inverse-surface pill that grows out of the handle
    label: {
      ...m3Type.labelLarge,
      position: 'absolute',
      bottom: HEIGHT + 4,
      minWidth: 48,
      padding: '8px 12px',
      boxSizing: 'border-box',
      borderRadius: 20,
      backgroundColor: m3.inverseSurface,
      color: m3.inverseOnSurface,
      fontWeight: 650,
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      opacity: 0,
      transform: 'translateX(-50%) translateY(6px) scale(0.6)',
      transformOrigin: 'bottom center',
      transition: `left ${spatial}, opacity ${m3Motion.fastEffects}, transform ${spatial}`,
    },
    labelShown: {
      opacity: 1,
      transform: 'translateX(-50%)',
    },
    focusRing: {
      '&:focus-visible $handle': {
        boxShadow: `0 0 0 2px ${m3.surface}, 0 0 0 5px ${m3.secondary}`,
      },
    },
    '@media (prefers-reduced-motion: reduce)': {
      track: { transition: 'none' },
      handle: { transition: 'none' },
      label: { transition: 'none' },
    },
  };
};

class M3Slider extends PureComponent {
  constructor(props) {
    super(props);

    this.rootRef = React.createRef();
    this.state = { dragValue: null, pressed: false, focused: false };
  }

  indexOf = (value) => {
    const { values } = this.props;
    const index = values.indexOf(value);

    return index < 0 ? 0 : index;
  };

  valueAt = (clientX) => {
    const { values } = this.props;
    const rect = this.rootRef.current.getBoundingClientRect();
    const p = (clientX - rect.left - INSET) / (rect.width - INSET * 2);
    const index = Math.round(Math.max(0, Math.min(1, p)) * (values.length - 1));

    return values[index];
  };

  preview = (value) => {
    const { onChange } = this.props;

    this.setState({ dragValue: value });
    onChange?.(value);
  };

  commit = (value) => {
    const { value: current, onChangeCommitted } = this.props;

    this.setState({ dragValue: null, pressed: false });

    if (value !== current) {
      onChangeCommitted?.(value);
    }
  };

  handlePointerDown = (event) => {
    const { disabled } = this.props;

    if (disabled || event.button !== 0) {
      return;
    }

    // the slider takes focus from the press itself (a mouse focus, so no
    // focus ring); capture keeps the drag going outside it
    event.currentTarget.setPointerCapture(event.pointerId);
    this.setState({ pressed: true });
    this.preview(this.valueAt(event.clientX));
  };

  handlePointerMove = (event) => {
    const { pressed, dragValue } = this.state;

    if (!pressed) {
      return;
    }

    const value = this.valueAt(event.clientX);

    if (value !== dragValue) {
      this.preview(value);
    }
  };

  handlePointerUp = (event) => {
    const { pressed } = this.state;

    if (!pressed) {
      return;
    }

    this.commit(this.valueAt(event.clientX));
  };

  handleKeyDown = (event) => {
    const { values, value, disabled } = this.props;

    if (disabled) {
      return;
    }

    const index = this.indexOf(value);
    const next = {
      ArrowLeft: index - 1,
      ArrowDown: index - 1,
      ArrowRight: index + 1,
      ArrowUp: index + 1,
      Home: 0,
      End: values.length - 1,
    }[event.key];

    if (next === undefined) {
      return;
    }

    event.preventDefault();
    this.commit(values[Math.max(0, Math.min(values.length - 1, next))]);
  };

  render() {
    const {
      classes,
      values,
      value,
      disabled,
      format = String,
      className,
      'aria-label': ariaLabel,
    } = this.props;
    const { dragValue, pressed, focused } = this.state;
    const shown = dragValue ?? value;
    const index = this.indexOf(shown);
    const p = values.length > 1 ? index / (values.length - 1) : 0;

    return (
      <div
        ref={this.rootRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-valuemin={values[0]}
        aria-valuemax={values[values.length - 1]}
        aria-valuenow={shown}
        aria-valuetext={format(shown)}
        className={classNames(classes.root, classes.focusRing, className, {
          [classes.disabled]: disabled,
        })}
        onPointerDown={this.handlePointerDown}
        onPointerMove={this.handlePointerMove}
        onPointerUp={this.handlePointerUp}
        onPointerCancel={() => this.commit(shown)}
        onKeyDown={this.handleKeyDown}
        onFocus={() => this.setState({ focused: true })}
        onBlur={() => this.setState({ focused: false })}
      >
        <span
          className={classNames(classes.track, classes.active)}
          style={{ width: `calc((100% - ${INSET * 2}px) * ${p})` }}
        />
        <span
          className={classNames(classes.track, classes.inactive)}
          style={{ left: `calc(${at(p)} + ${INSET}px)` }}
        />
        {values.map((stop, i) => {
          const q = values.length > 1 ? i / (values.length - 1) : 0;

          return (
            <span
              key={stop}
              className={classNames(classes.stop, {
                [classes.stopActive]: i < index,
                [classes.stopHidden]: i === index,
              })}
              style={{ left: at(q) }}
            />
          );
        })}
        <span
          className={classNames(classes.handle, {
            [classes.handlePressed]: pressed,
          })}
          style={{ left: at(p) }}
        />
        <span
          className={classNames(classes.label, {
            [classes.labelShown]:
              pressed ||
              (focused && this.rootRef.current?.matches(':focus-visible')),
          })}
          style={{ left: at(p) }}
          aria-hidden="true"
        >
          {format(shown)}
        </span>
      </div>
    );
  }
}

export default withStyles(styles)(M3Slider);
