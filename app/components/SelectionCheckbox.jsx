import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  IndeterminateCheckBox as IndeterminateCheckBoxIcon,
} from './m3/symbolIcons';

const styles = (theme) => ({
  root: {
    color: theme.palette.text.secondary,
    borderRadius: 7,
    '&:hover': {
      color: theme.palette.secondary.main,
      backgroundColor: theme.palette.selectionHover,
    },
    '&$checked': {
      color: theme.palette.secondary.main,
    },
    '&.Mui-focusVisible': {
      outline: `3px solid ${theme.palette.focusRing}`,
      outlineOffset: 1,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
  checked: {},
  icon: {
    fontSize: 22,
    filter: `drop-shadow(0 1px 0 ${theme.palette.checkboxEdge})`,
  },
});

function SelectionCheckbox({
  classes,
  className,
  checked,
  indeterminate,
  ...props
}) {
  return (
    <Checkbox
      {...props}
      checked={checked}
      indeterminate={indeterminate}
      color="default"
      disableRipple
      className={classNames(classes.root, className)}
      classes={{ checked: classes.checked }}
      icon={<CheckBoxOutlineBlankIcon className={classes.icon} />}
      checkedIcon={<CheckBoxIcon className={classes.icon} />}
      indeterminateIcon={<IndeterminateCheckBoxIcon className={classes.icon} />}
    />
  );
}

export default withStyles(styles)(SelectionCheckbox);
