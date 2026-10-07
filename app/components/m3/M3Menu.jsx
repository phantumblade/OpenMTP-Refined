import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import MaterialSymbol from './MaterialSymbol';
import {
  alphaHex,
  m3Elevation,
  m3Shape,
  m3State,
  m3Type,
} from '../../styles/m3/tokens';

// Material 3 Expressive menu with groups (Compose SegmentedMenuTokens /
// MenuDefaults): each group is its own surface, 2dp apart, with 16dp outer
// and 8dp inner corners; 44dp items with a 20dp leading icon, a bodyLarge
// label and the keyboard shortcut as trailing text; the selected item uses
// the tertiary container.

const EMPHASIZED_DECELERATE = 'cubic-bezier(0.05, 0.7, 0.1, 1)';

const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    paper: {
      overflow: 'visible',
      background: 'none',
      boxShadow: 'none',
      borderRadius: 0,
    },
    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      minWidth: 220,
      maxWidth: 320,
      padding: 0,
      margin: 0,
      outline: 'none',
      transformOrigin: 'top left',
      animation: `$open 300ms ${EMPHASIZED_DECELERATE} both`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
    '@keyframes open': {
      from: {
        opacity: 0,
        transform: 'scale(0.92)',
        clipPath: 'inset(0 0 60% 0)',
      },
      to: { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)' },
    },
    group: {
      display: 'flex',
      flexDirection: 'column',
      padding: '4px 0',
      borderRadius: m3Shape.small,
      backgroundColor: m3.surfaceContainerLow,
      boxShadow: m3Elevation.level2,
      '&:first-child': {
        borderTopLeftRadius: m3Shape.large,
        borderTopRightRadius: m3Shape.large,
      },
      '&:last-child': {
        borderBottomLeftRadius: m3Shape.large,
        borderBottomRightRadius: m3Shape.large,
      },
    },
    item: {
      ...m3Type.bodyLarge,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      height: 44,
      margin: '0 4px',
      padding: '0 12px',
      border: 'none',
      borderRadius: m3Shape.extraSmall,
      backgroundColor: 'transparent',
      color: m3.onSurface,
      fontFamily: 'inherit',
      textAlign: 'left',
      cursor: 'pointer',
      outline: 'none',
      transition: 'background-color 120ms linear, border-radius 200ms ease',
      '&:hover, &:focus-visible': {
        backgroundColor: alphaHex(m3.onSurface, m3State.hover),
        borderRadius: m3Shape.medium,
      },
      '&:active': {
        backgroundColor: alphaHex(m3.onSurface, m3State.pressed),
      },
      '&:focus-visible': {
        boxShadow: `inset 0 0 0 2px ${m3.secondary}`,
      },
      '&:disabled': {
        cursor: 'default',
        backgroundColor: 'transparent',
        '& > *': { opacity: 0.38 },
      },
    },
    itemSelected: {
      borderRadius: m3Shape.medium,
      backgroundColor: m3.tertiaryContainer,
      color: m3.onTertiaryContainer,
      '& $icon, & $shortcut': { color: m3.onTertiaryContainer },
      '&:hover, &:focus-visible': {
        backgroundColor: m3.tertiaryContainer,
      },
    },
    icon: {
      flexShrink: 0,
      color: m3.onSurfaceVariant,
    },
    label: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    shortcut: {
      ...m3Type.labelLarge,
      flexShrink: 0,
      marginLeft: 12,
      color: m3.onSurfaceVariant,
      letterSpacing: '0.04em',
    },
  };
};

class M3Menu extends PureComponent {
  menuRef = React.createRef();

  focusItem = (direction) => {
    const items = Array.from(
      this.menuRef.current?.querySelectorAll('button:not(:disabled)') || []
    );

    if (items.length < 1) {
      return;
    }

    const index = items.indexOf(document.activeElement);
    const next =
      index < 0 ? 0 : (index + direction + items.length) % items.length;

    items[next].focus();
  };

  handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusItem(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusItem(-1);
    }
  };

  render() {
    const { classes, open, anchorPosition, groups, onClose, ariaLabel } =
      this.props;
    const visibleGroups = (groups || []).filter((group) => group.length > 0);

    return (
      <Popover
        open={Boolean(open && anchorPosition)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition || { top: 0, left: 0 }}
        onClose={onClose}
        transitionDuration={{ enter: 0, exit: 120 }}
        classes={{ paper: classes.paper }}
        onContextMenu={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        <div
          ref={this.menuRef}
          role="menu"
          aria-label={ariaLabel}
          tabIndex={-1}
          className={classes.menu}
          onKeyDown={this.handleKeyDown}
        >
          {visibleGroups.map((group) => (
            <div
              key={group.map(({ id }) => id).join('-')}
              role="group"
              className={classes.group}
            >
              {group.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  disabled={item.enabled === false}
                  className={classNames(classes.item, {
                    [classes.itemSelected]: item.selected,
                  })}
                  onClick={() => {
                    onClose();
                    item.onClick();
                  }}
                >
                  {item.icon && (
                    <MaterialSymbol
                      name={item.icon}
                      size={20}
                      fill={item.selected ? 1 : 0}
                      className={classes.icon}
                    />
                  )}
                  <span className={classes.label}>{item.label}</span>
                  {item.shortcut && (
                    <span className={classes.shortcut}>{item.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </Popover>
    );
  }
}

export default withStyles(styles)(M3Menu);
