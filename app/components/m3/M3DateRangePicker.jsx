import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import MaterialSymbol from './MaterialSymbol';
import {
  datePlaceholder,
  formatDisplayDate,
  monthMatrix,
  parseDisplayDate,
  parseIsoDate,
  toIsoDate,
  weekStartsOn,
} from '../../helpers/dateLocale';
import {
  alphaHex,
  m3Motion,
  m3Shape,
  m3State,
  m3Type,
} from '../../styles/m3/tokens';

// Material 3 docked date range picker: two outlined date fields written in
// the app language's format, plus a month calendar where the first click sets
// the start and the second the end of the range.

const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    fields: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
    },
    field: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },
    fieldLabel: {
      ...m3Type.bodySmall,
      position: 'absolute',
      top: -8,
      left: 12,
      padding: '0 4px',
      backgroundColor: m3.surfaceContainerHigh,
      color: m3.onSurfaceVariant,
    },
    fieldInput: {
      ...m3Type.bodyLarge,
      width: '100%',
      minWidth: 0,
      height: 48,
      padding: '0 16px',
      border: `1px solid ${m3.outline}`,
      borderRadius: m3Shape.extraSmall,
      backgroundColor: 'transparent',
      color: m3.onSurface,
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box',
      '&::placeholder': { color: m3.onSurfaceVariant, opacity: 0.7 },
      '&:hover': { borderColor: m3.onSurface },
      '&:focus': {
        borderColor: m3.primary,
        boxShadow: `inset 0 0 0 1px ${m3.primary}`,
      },
    },
    fieldActive: {
      '& $fieldLabel': { color: m3.primary },
    },
    fieldError: {
      '& $fieldInput, & $fieldInput:focus': {
        borderColor: m3.error,
        boxShadow: `inset 0 0 0 1px ${m3.error}`,
      },
      '& $fieldLabel': { color: m3.error },
    },
    calendar: {
      marginTop: 16,
    },
    calendarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    navButtons: {
      display: 'flex',
      gap: 4,
    },
    monthLabel: {
      ...m3Type.titleSmall,
      color: m3.onSurfaceVariant,
      textTransform: 'capitalize',
      paddingLeft: 12,
    },
    navButton: {
      display: 'grid',
      placeItems: 'center',
      width: 40,
      height: 40,
      border: 'none',
      borderRadius: 20,
      backgroundColor: 'transparent',
      color: m3.onSurfaceVariant,
      cursor: 'pointer',
      '&:hover': { backgroundColor: alphaHex(m3.onSurface, m3State.hover) },
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      rowGap: 2,
    },
    weekday: {
      ...m3Type.bodySmall,
      display: 'grid',
      placeItems: 'center',
      height: 32,
      color: m3.onSurface,
      textTransform: 'uppercase',
    },
    dayCell: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      height: 40,
    },
    // band behind days inside the selected range
    inRange: {
      backgroundColor: m3.secondaryContainer,
    },
    rangeStart: {
      background: `linear-gradient(to right, transparent 50%, ${m3.secondaryContainer} 50%)`,
    },
    rangeEnd: {
      background: `linear-gradient(to left, transparent 50%, ${m3.secondaryContainer} 50%)`,
    },
    day: {
      ...m3Type.bodyLarge,
      position: 'relative',
      width: 40,
      height: 40,
      border: 'none',
      borderRadius: 20,
      backgroundColor: 'transparent',
      color: m3.onSurface,
      fontFamily: 'inherit',
      cursor: 'pointer',
      transition: `background-color ${m3Motion.fastEffects}, transform ${m3Motion.fastSpatial}`,
      '&:hover': { backgroundColor: alphaHex(m3.onSurface, m3State.hover) },
      '&:active': { transform: 'scale(0.9)' },
    },
    outsideMonth: {
      color: alphaHex(m3.onSurface, 0.38),
    },
    today: {
      boxShadow: `inset 0 0 0 1px ${m3.primary}`,
      color: m3.primary,
    },
    selected: {
      backgroundColor: m3.primary,
      color: m3.onPrimary,
      '&:hover': { backgroundColor: m3.primary },
    },
    dayInRange: {
      color: m3.onSecondaryContainer,
    },
  };
};

class M3DateRangePicker extends PureComponent {
  constructor(props) {
    super(props);

    const anchor =
      parseIsoDate(props.to) || parseIsoDate(props.from) || new Date();

    this.state = {
      viewYear: anchor.getFullYear(),
      viewMonth: anchor.getMonth(),
      text: {
        from: formatDisplayDate(props.from, props.language),
        to: formatDisplayDate(props.to, props.language),
      },
      invalid: { from: false, to: false },
    };
  }

  componentDidUpdate(prevProps) {
    const { from, to, language } = this.props;

    if (
      prevProps.from !== from ||
      prevProps.to !== to ||
      prevProps.language !== language
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        text: {
          from: formatDisplayDate(from, language),
          to: formatDisplayDate(to, language),
        },
        invalid: { from: false, to: false },
      });
    }
  }

  shiftMonth = (delta) => () => {
    this.setState(({ viewYear, viewMonth }) => {
      const date = new Date(viewYear, viewMonth + delta, 1);

      return { viewYear: date.getFullYear(), viewMonth: date.getMonth() };
    });
  };

  pickDay = (iso) => () => {
    const { from, to, onChange } = this.props;

    if (!from || (from && to)) {
      onChange({ from: iso, to: '' });
    } else if (iso < from) {
      onChange({ from: iso, to: from });
    } else {
      onChange({ from, to: iso });
    }
  };

  setInvalid = (name, value) => {
    this.setState(({ invalid }) => ({
      invalid: { ...invalid, [name]: value },
    }));
  };

  commitText = (name) => () => {
    const { language, onChange, from, to } = this.props;
    const { text } = this.state;
    const iso = parseDisplayDate(text[name], language);

    if (iso === null) {
      this.setInvalid(name, true);

      return;
    }

    this.setInvalid(name, false);

    if (iso) {
      const date = parseIsoDate(iso);

      this.setState({
        viewYear: date.getFullYear(),
        viewMonth: date.getMonth(),
      });
    }

    onChange({ from, to, [name]: iso });
  };

  renderField = (name, label) => {
    const { classes, language, error } = this.props;
    const { text, invalid } = this.state;

    return (
      <label
        className={classNames(classes.field, {
          [classes.fieldError]: invalid[name] || error,
        })}
      >
        <span className={classes.fieldLabel}>{label}</span>
        <input
          className={classes.fieldInput}
          value={text[name]}
          placeholder={datePlaceholder(language)}
          inputMode="numeric"
          onChange={(event) => {
            const { value } = event.target;

            this.setState(({ text: current }) => ({
              text: { ...current, [name]: value },
            }));
          }}
          onBlur={this.commitText(name)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              this.commitText(name)();
            }
          }}
        />
      </label>
    );
  };

  render() {
    const { classes, from, to, language, fromLabel, toLabel } = this.props;
    const { viewYear, viewMonth } = this.state;
    const firstWeekday = weekStartsOn(language);
    const days = monthMatrix(viewYear, viewMonth, firstWeekday);
    const todayIso = toIsoDate(new Date());
    const monthName = new Intl.DateTimeFormat(language, {
      month: 'long',
      year: 'numeric',
    }).format(new Date(viewYear, viewMonth, 1));
    const weekdayNames = days
      .slice(0, 7)
      .map((date) =>
        new Intl.DateTimeFormat(language, { weekday: 'narrow' }).format(date)
      );
    const hasRange = Boolean(from && to && from !== to);

    return (
      <div>
        <div className={classes.fields}>
          {this.renderField('from', fromLabel)}
          {this.renderField('to', toLabel)}
        </div>

        <div className={classes.calendar}>
          <div className={classes.calendarHeader}>
            <span className={classes.monthLabel} aria-live="polite">
              {monthName}
            </span>
            <span className={classes.navButtons}>
              <button
                type="button"
                className={classes.navButton}
                aria-label="previous month"
                onClick={this.shiftMonth(-1)}
              >
                <MaterialSymbol name="chevron_left" size={24} />
              </button>
              <button
                type="button"
                className={classes.navButton}
                aria-label="next month"
                onClick={this.shiftMonth(1)}
              >
                <MaterialSymbol name="chevron_right" size={24} />
              </button>
            </span>
          </div>

          <div className={classes.grid} role="grid">
            {weekdayNames.map((name, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={index} className={classes.weekday}>
                {name}
              </span>
            ))}
            {days.map((date) => {
              const iso = toIsoDate(date);
              const isStart = iso === from;
              const isEnd = iso === to;
              const between = hasRange && iso > from && iso < to;

              return (
                <span
                  key={iso}
                  className={classNames(classes.dayCell, {
                    [classes.inRange]: between,
                    [classes.rangeStart]: hasRange && isStart,
                    [classes.rangeEnd]: hasRange && isEnd,
                  })}
                >
                  <button
                    type="button"
                    className={classNames(classes.day, {
                      [classes.outsideMonth]: date.getMonth() !== viewMonth,
                      [classes.today]: iso === todayIso && !isStart && !isEnd,
                      [classes.selected]: isStart || isEnd,
                      [classes.dayInRange]: between,
                    })}
                    aria-pressed={isStart || isEnd}
                    onClick={this.pickDay(iso)}
                  >
                    {date.getDate()}
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(M3DateRangePicker);
