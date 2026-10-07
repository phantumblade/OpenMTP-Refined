import { mixins } from '../../../styles/js';

export const styles = (theme) => ({
  root: {},
  dialogContentText: {
    marginBottom: 10,
    wordBreak: `break-all`,
  },
  bodyText: {
    display: 'block',
  },
  secondaryText: {
    marginBottom: 20,
    display: 'block',
  },
  btnPositive: {
    ...mixins({ theme }).btnPositive,
  },
  btnNegative: {
    ...mixins({ theme }).btnNegative,
  },
  // M3 text field: on surface underline on hover, primary when focused
  textFieldRoot: {
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottomColor: theme.palette.m3.onSurface,
    },
    '& .MuiInput-underline:after': {
      borderBottom: `2px solid ${theme.palette.m3.primary}`,
    },
    '& .MuiFormLabel-root.Mui-focused': {
      color: theme.palette.m3.primary,
    },
    '& .MuiFormLabel-root.Mui-error.Mui-focused': {
      color: theme.palette.m3.error,
    },
  },
});
