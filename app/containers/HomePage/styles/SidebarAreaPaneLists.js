import { m3Shape, m3Type } from '../../../styles/m3/tokens';

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
    sectionCaptionRow: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    sectionCount: {
      fontWeight: 600,
      letterSpacing: 0,
      opacity: 0.8,
    },
    emptyHint: {
      padding: '4px 18px 8px 18px',
      fontSize: 11,
      lineHeight: 1.45,
      color: theme.palette.text.secondary,
    },
    favoriteItem: {
      paddingRight: 6,
      '&:hover $favoriteRemove, &:focus-within $favoriteRemove': {
        opacity: 1,
      },
    },
    favoriteMissing: {
      cursor: 'default',
      '& $listItemIcon, & $listItemText': {
        opacity: 0.45,
      },
    },
    favoriteRemove: {
      marginLeft: 4,
      padding: 3,
      fontSize: 14,
      opacity: 0,
      color: theme.palette.text.secondary,
      transition: 'opacity 140ms ease',
      '&:focus-visible': {
        opacity: 1,
      },
    },
    sectionDivider: {
      margin: '8px 16px',
      opacity: 0.4,
    },
    // M3 filled card holding the app identity and the GitHub link
    footerBlock: {
      margin: 'auto 12px 12px',
      padding: '10px 6px 10px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderRadius: m3Shape.large,
      backgroundColor: theme.palette.m3.surfaceContainerHighest,
      color: theme.palette.m3.onSurface,
    },
    footerAppIcon: {
      width: 40,
      height: 40,
      flexShrink: 0,
      objectFit: 'contain',
    },
    footerMeta: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },
    footerAppName: {
      ...m3Type.titleSmall,
      display: 'flex',
      alignItems: 'baseline',
      gap: 6,
    },
    footerVersion: {
      ...m3Type.labelMedium,
      color: theme.palette.m3.primary,
    },
    footerAppSub: {
      ...m3Type.bodySmall,
      color: theme.palette.m3.onSurfaceVariant,
    },
  };
};
