import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { SymbolGlyph } from './m3/createSymbolIcon';
import { m3Motion } from '../styles/m3/tokens';

// Toolbar actions as Material Symbols (Rounded); the active state fills the
// glyph, as M3 does for selected icons.
const symbols = {
  menu: 'menu',
  up: 'drive_folder_upload',
  refresh: 'refresh',
  delete: 'delete',
  multiSelect: 'check_circle',
  storage: 'sd_card',
  mtpMode: 'usb',
  transfers: 'swap_vert',
  photoBackup: 'add_photo_alternate',
  settings: 'tune',
  faqs: 'help',
};

const styles = (theme) => ({
  root: {
    display: 'block',
    width: 20,
    height: 20,
    overflow: 'visible',
    color: 'currentColor',
    fill: 'currentColor',
    stroke: 'none',
    // spatial spring for the turn, effects spring for the colour
    transition: `transform ${m3Motion.fastSpatial}, color ${m3Motion.fastEffects}`,
    '&:hover': {
      '&[data-name="refresh"]': { transform: 'rotate(60deg)' },
      '&[data-name="up"]': { transform: 'translateY(-1.5px)' },
      '&[data-name="transfers"]': { transform: 'scaleY(1.12)' },
    },
    '&:focus': { outline: 'none' },
  },
  active: {
    color: theme.palette.secondary.main,
  },
});

function AnimatedActionIcon({ classes, name, active = false, className }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-name={name}
      className={classNames(classes.root, className, {
        [classes.active]: active,
      })}
    >
      <SymbolGlyph name={symbols[name] || symbols.faqs} fill={active ? 1 : 0} />
    </svg>
  );
}

export default withStyles(styles)(AnimatedActionIcon);
