import { mixins } from '../../../styles/js';

export const styles = (theme) => {
  return {
    root: {
      width: '100%',
      height: '100%',
    },

    rootBreadcrumbs: {
      width: '100%',
      height: '100%',
    },

    breadcrumb: {
      padding: '8px 14px',
      backgroundColor: theme.palette.background.paper,
      display: 'flex',
      alignItems: 'center',
      overflowX: 'auto',
      overflowY: 'hidden',
      whiteSpace: 'nowrap',
      scrollbarWidth: 'thin',
      ...mixins({ theme }).resetUl,
      '&::-webkit-scrollbar': {
        height: 4,
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: 4,
        backgroundColor: 'rgba(128, 128, 128, 0.3)',
      },
    },

    breadcrumbLi: {
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 13,
      maxWidth: 240,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      flexShrink: 0,
    },

    breadcrumbLiA: {
      cursor: 'pointer',
      color: theme.palette.text.secondary,
      textDecoration: 'none',
      padding: '3px 8px',
      borderRadius: 6,
      transition: 'background-color 150ms ease, color 150ms ease',
      '&:hover': {
        color: theme.palette.secondary.main,
        backgroundColor: 'rgba(128, 128, 128, 0.08)',
      },
    },

    breadcrumbActiveA: {
      fontWeight: 700,
      color: theme.palette.text.primary,
      backgroundColor: 'rgba(128, 128, 128, 0.12)',
      cursor: 'default',
    },

    breadcrumbSeperator: {
      fontSize: 16,
      color: theme.palette.text.disabled,
      margin: '0 2px',
      verticalAlign: 'middle',
    },
  };
};
