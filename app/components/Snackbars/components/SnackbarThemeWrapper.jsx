import React from 'react';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { withStyles } from '@material-ui/core/styles';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '../../m3/symbolIcons';
import { styles } from '../styles/SnackbarThemeWrapper';
import { translate } from '../../../i18n';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

function SnackbarThemeWrapper(props) {
  const {
    classes: styles,
    message,
    onClose,
    variant,
    appLanguage,
    ...other
  } = props;
  const Icon = variantIcon[variant] || variantIcon.info;

  return (
    <SnackbarContent
      className={classNames(styles.root, styles[variant])}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={styles.message}>
          <Icon className={styles.icon} />
          {message}
        </span>
      }
      action={[
        <Button key="close" onClick={onClose} className={styles.action}>
          {translate(appLanguage, 'Close')}
        </Button>,
      ]}
      {...other}
    />
  );
}

export default withStyles(styles)(SnackbarThemeWrapper);
