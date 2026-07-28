export const styles = (theme) => {
  return {
    listsWrapper: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: 270,
      boxSizing: 'border-box',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      userSelect: 'none',
    },
    headerBlock: {
      padding: '22px 18px 14px 18px',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    headerTitleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    headerIcon: {
      fontSize: 24,
      color: theme.palette.secondary.main,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: theme.palette.text.primary,
    },
    headerSubtitle: {
      fontSize: 11,
      color: theme.palette.text.secondary,
      marginTop: 2,
    },
    modeBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 10,
      padding: '3px 9px',
      borderRadius: 12,
      fontSize: 10,
      fontWeight: 600,
      backgroundColor:
        theme.palette.toolbarButtonActive || 'rgba(0, 122, 245, 0.12)',
      color: theme.palette.secondary.main,
    },
    modeBadgeDot: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: '#2e9d62',
    },
    contentScrollArea: {
      flex: 1,
      overflowY: 'auto',
      paddingTop: 8,
      paddingBottom: 8,
    },
    sectionCaption: {
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: theme.palette.text.secondary,
      padding: '12px 18px 4px 18px',
    },
    listNav: {
      padding: '0 8px',
    },
    listItem: {
      borderRadius: 7,
      margin: '2px 0',
      padding: '6px 12px',
      transition: 'background-color 140ms ease, color 140ms ease',
      '&:hover': {
        backgroundColor: theme.palette.toolbarButtonHover,
      },
      '&.Mui-selected': {
        backgroundColor: `${
          theme.palette.toolbarButtonActive || 'rgba(0, 122, 245, 0.12)'
        } !important`,
        color: `${theme.palette.secondary.main} !important`,
        fontWeight: 600,
        '& $listItemIcon': {
          color: theme.palette.secondary.main,
        },
      },
    },
    listItemIcon: {
      minWidth: 32,
      color: theme.palette.text.secondary,
    },
    listItemText: {
      '& span': {
        fontSize: 13,
        fontWeight: 500,
      },
    },
    sectionDivider: {
      margin: '8px 16px',
      opacity: 0.4,
    },
    footerBlock: {
      marginTop: 'auto',
      padding: '14px 18px',
      borderTop: `1px solid ${theme.palette.divider}`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.palette.statusSurface || 'transparent',
    },
    footerIconWrapper: {
      width: 28,
      height: 28,
      borderRadius: 7,
      backgroundColor: theme.palette.secondary.main,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      flexShrink: 0,
    },
    footerMeta: {
      display: 'flex',
      flexDirection: 'column',
    },
    footerAppName: {
      fontSize: 12,
      fontWeight: 700,
      color: theme.palette.text.primary,
    },
    footerAppSub: {
      fontSize: 10,
      color: theme.palette.text.secondary,
    },
  };
};
