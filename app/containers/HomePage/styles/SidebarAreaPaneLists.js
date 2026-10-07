import {
  alphaHex,
  m3Motion,
  m3Shape,
  m3State,
  m3Type,
} from '../../../styles/m3/tokens';

// Material 3 navigation drawer, coloured and shaped with the Compose
// NavigationDrawerTokens values; items use the compact 48dp desktop height
// so every destination fits without scrolling on a laptop screen.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    listsWrapper: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: 320,
      boxSizing: 'border-box',
      backgroundColor: m3.surfaceContainerLow,
      color: m3.onSurface,
      userSelect: 'none',
    },
    // M3 filled card for "This Mac", matching the footer card
    macCard: {
      margin: '12px 12px 4px',
      padding: '16px 16px 14px',
      borderRadius: m3Shape.large,
      backgroundColor: m3.surfaceContainerHighest,
    },
    macCardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    },
    headerShape: {
      color: m3.primaryContainer,
    },
    headerIcon: {
      color: m3.onPrimaryContainer,
    },
    headerText: {
      minWidth: 0,
    },
    headerTitle: {
      ...m3Type.titleMedium,
      color: m3.onSurface,
    },
    headerSubtitle: {
      ...m3Type.bodyMedium,
      color: m3.onSurfaceVariant,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    // M3 linear progress: 4dp active and track, 4dp gap, stop indicator
    diskTrack: {
      display: 'flex',
      gap: 4,
      height: 4,
      marginTop: 16,
    },
    diskUsed: {
      flexShrink: 0,
      minWidth: 4,
      borderRadius: 2,
      backgroundColor: m3.primary,
    },
    diskFree: {
      position: 'relative',
      flex: 1,
      borderRadius: 2,
      backgroundColor: m3.secondaryContainer,
    },
    diskStop: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: m3.primary,
    },
    diskLabel: {
      ...m3Type.bodySmall,
      marginTop: 8,
      color: m3.onSurfaceVariant,
    },
    contentScrollArea: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      paddingBottom: 8,
    },
    section: {
      padding: '0 12px',
    },
    sectionHeadline: {
      ...m3Type.titleSmall,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 40,
      margin: 0,
      padding: '4px 24px 0 16px',
      color: m3.onSurfaceVariant,
    },
    sectionBadge: {
      ...m3Type.labelLarge,
      color: m3.onSurfaceVariant,
    },
    list: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    itemRow: {
      position: 'relative',
      '&:hover $favoriteRemove, &:focus-within $favoriteRemove': {
        opacity: 1,
      },
    },
    item: {
      ...m3Type.labelLarge,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      height: 48,
      padding: '0 24px 0 16px',
      border: 'none',
      borderRadius: m3Shape.full,
      backgroundColor: 'transparent',
      color: m3.onSurfaceVariant,
      fontFamily: 'inherit',
      textAlign: 'left',
      cursor: 'pointer',
      outline: 'none',
      transition: `background-color ${m3Motion.defaultEffects}, color ${m3Motion.defaultEffects}`,
      '&:hover': {
        backgroundColor: alphaHex(m3.onSurface, m3State.hover),
        color: m3.onSurface,
      },
      '&:active': {
        backgroundColor: alphaHex(m3.onSurface, m3State.pressed),
      },
      '&:focus-visible': {
        outline: `3px solid ${m3.secondary}`,
        outlineOffset: -3,
      },
      '&[aria-disabled]': {
        cursor: 'default',
        backgroundColor: 'transparent',
      },
    },
    itemActive: {
      backgroundColor: m3.secondaryContainer,
      color: m3.onSecondaryContainer,
      '&:hover': {
        backgroundColor: m3.secondaryContainer,
        color: m3.onSecondaryContainer,
        boxShadow: `inset 0 0 0 100px ${alphaHex(
          m3.onSecondaryContainer,
          m3State.hover
        )}`,
      },
    },
    itemIcon: {
      flexShrink: 0,
    },
    itemLock: {
      flexShrink: 0,
      color: m3.onSurfaceVariant,
    },
    itemLabel: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    emptyHint: {
      ...m3Type.bodyMedium,
      margin: 0,
      padding: '0 24px 8px 16px',
      color: m3.onSurfaceVariant,
    },
    favoriteItem: {
      paddingRight: 52,
    },
    favoriteMissing: {
      opacity: 0.38,
    },
    // M3 standard icon button, shown on hover
    favoriteRemove: {
      position: 'absolute',
      top: 4,
      right: 8,
      display: 'grid',
      placeItems: 'center',
      width: 40,
      height: 40,
      border: 'none',
      borderRadius: 20,
      backgroundColor: 'transparent',
      color: m3.onSurfaceVariant,
      cursor: 'pointer',
      opacity: 0,
      outline: 'none',
      transition: `opacity ${m3Motion.defaultEffects}, background-color ${m3Motion.defaultEffects}`,
      '&:hover': {
        backgroundColor: alphaHex(m3.onSurfaceVariant, m3State.hover),
      },
      '&:focus-visible': {
        opacity: 1,
        outline: `3px solid ${m3.secondary}`,
      },
    },
    divider: {
      height: 1,
      margin: '6px 28px',
      border: 'none',
      backgroundColor: m3.outlineVariant,
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
