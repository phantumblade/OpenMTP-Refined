import { alphaHex, m3State, m3Type } from '../../../styles/m3/tokens';

// Material 3 snackbar: inverse surface container (from the global
// MuiSnackbarContent override), inverse-primary action. The severity is
// carried by a small leading icon tinted for the dark inverse surface.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    root: {
      minWidth: 320,
      maxWidth: 600,
      flexWrap: 'nowrap',
    },
    message: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 0',
    },
    icon: {
      flexShrink: 0,
      fontSize: 20,
      color: m3.inversePrimary,
    },
    error: {
      '& $icon': { color: m3.errorContainer },
    },
    warning: {},
    success: {},
    info: {},
    action: {
      ...m3Type.labelLarge,
      minHeight: 36,
      marginLeft: 8,
      padding: '0 12px',
      borderRadius: 18,
      color: m3.inversePrimary,
      textTransform: 'none',
      '&:hover': {
        backgroundColor: alphaHex(m3.inversePrimary, m3State.hover),
      },
    },
  };
};
