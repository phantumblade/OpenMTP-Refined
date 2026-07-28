export const styles = (theme) => ({
  success: {
    backgroundColor: '#2e7d32',
  },
  error: {
    backgroundColor: theme.palette.snackbar.error || '#d32f2f',
  },
  info: {
    backgroundColor: '#1976d2',
  },
  warning: {
    backgroundColor: '#f57c00',
  },
  icon: {
    fontSize: 22,
    color: '#ffffff',
  },
  closeBtn: {
    color: '#ffffff',
    fontWeight: 650,
    textTransform: 'none',
    borderRadius: 8,
    padding: '4px 10px',
    marginLeft: 12,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
  iconVariant: {
    opacity: 0.95,
    marginRight: 10,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    color: '#ffffff',
    fontWeight: 550,
    fontSize: 13.5,
    lineHeight: 1.4,
  },
  root: {
    minWidth: 280,
    maxWidth: 520,
    minHeight: 52,
    padding: '6px 16px',
    borderRadius: 14,
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.22)',
    flexGrow: 'unset',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
});
