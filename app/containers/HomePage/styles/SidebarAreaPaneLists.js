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
    // "This Mac" and the other drives: a header, then each group as an
    // M3 Expressive segmented list (2dp gaps, large outer corners, small
    // inner ones; hovered and pressed items round up)
    storage: {
      padding: '8px 12px 6px',
    },
    macHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '0 4px 12px',
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
    storageHeadline: {
      ...m3Type.titleSmall,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 40,
      margin: '6px 0 0',
      padding: '4px 12px 0 16px',
      color: m3.onSurfaceVariant,
    },
    volumeList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    volumeRow: {
      display: 'flex',
      '&:first-child $volume': {
        borderTopLeftRadius: m3Shape.largeIncreased,
        borderTopRightRadius: m3Shape.largeIncreased,
      },
      '&:last-child $volume': {
        borderBottomLeftRadius: m3Shape.largeIncreased,
        borderBottomRightRadius: m3Shape.largeIncreased,
      },
    },
    volume: {
      position: 'relative',
      isolation: 'isolate',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      width: '100%',
      minHeight: 72,
      padding: '10px 16px 10px 12px',
      boxSizing: 'border-box',
      border: 'none',
      borderRadius: m3Shape.extraSmall,
      backgroundColor: m3.surfaceContainerHigh,
      color: m3.onSurface,
      fontFamily: 'inherit',
      textAlign: 'left',
      cursor: 'pointer',
      outline: 'none',
      transition: `border-radius ${m3Motion.fastSpatial}, background-color ${m3Motion.defaultEffects}`,
      // state layer in the content colour
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        backgroundColor: 'currentColor',
        opacity: 0,
        transition: `opacity ${m3Motion.fastEffects}`,
      },
      '&:hover::before': { opacity: m3State.hover },
      '&:active::before': { opacity: m3State.pressed },
      '&:hover, &:focus-visible': {
        borderRadius: `${m3Shape.largeIncreased}px !important`,
      },
      '&:active': {
        borderRadius: `${m3Shape.medium}px !important`,
      },
      '&:hover $volumeGo': {
        transform: 'translateX(2px)',
      },
      '&:focus-visible': {
        outline: `3px solid ${m3.secondary}`,
        outlineOffset: -3,
      },
      '@media (prefers-reduced-motion: reduce)': {
        transition: `background-color ${m3Motion.defaultEffects}`,
      },
    },
    // the drive of the open folder
    volumeActive: {
      backgroundColor: m3.secondaryContainer,
      color: m3.onSecondaryContainer,
      '& $volumeAvatar': {
        backgroundColor: m3.primary,
        color: m3.onPrimary,
      },
      '& $volumeSpace': {
        color: m3.onSecondaryContainer,
      },
      '& $diskFree': {
        backgroundColor: alphaHex(m3.onSecondaryContainer, 0.16),
      },
    },
    volumeAlmostFull: {
      '& $diskUsed, & $diskStop': {
        backgroundColor: m3.error,
      },
    },
    volumeAvatar: {
      flexShrink: 0,
      display: 'grid',
      placeItems: 'center',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: m3.secondaryContainer,
      color: m3.onSecondaryContainer,
      transition: `background-color ${m3Motion.defaultEffects}, color ${m3Motion.defaultEffects}`,
    },
    volumeText: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
    },
    volumeName: {
      ...m3Type.bodyLarge,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      // room for the "open" arrow
      paddingRight: 24,
      fontWeight: 500,
    },
    volumeNameText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    volumeSpace: {
      ...m3Type.bodySmall,
      marginTop: 6,
      color: m3.onSurfaceVariant,
      whiteSpace: 'nowrap',
    },
    // "open", beside the name so the meter runs the whole width; it nudges
    // forward on hover
    volumeGo: {
      position: 'absolute',
      top: 14,
      right: 12,
      opacity: 0.8,
      transition: `transform ${m3Motion.fastSpatial}`,
    },
    // M3 linear progress: 4dp active and track, 4dp gap, stop indicator
    diskTrack: {
      display: 'flex',
      gap: 4,
      height: 4,
      marginTop: 8,
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
    // room for the macOS window buttons when the drawer covers them
    windowControlsInset: {
      flexShrink: 0,
      height: 36,
    },
    navContent: {
      position: 'relative',
    },
    hoverIndicator: {
      position: 'absolute',
      top: 0,
      left: 12,
      right: 12,
      zIndex: 1,
      height: 48,
      borderRadius: m3Shape.full,
      backgroundColor: alphaHex(m3.onSurface, m3State.hover),
      opacity: 0,
      pointerEvents: 'none',
      willChange: 'transform',
      transition:
        'transform 220ms cubic-bezier(0.2, 0, 0, 1), height 220ms cubic-bezier(0.2, 0, 0, 1), opacity 150ms linear',
      '@media (prefers-reduced-motion: reduce)': {
        transition: 'opacity 150ms linear',
      },
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
        color: m3.onSecondaryContainer,
      },
    },
    itemIcon: {
      flexShrink: 0,
    },
    // favourites wear the tertiary accent, like the star on pinned folders
    favoriteIcon: {
      color: m3.tertiary,
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
    emptyCard: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      margin: '0 4px 4px',
      padding: '12px 16px 12px 12px',
      borderRadius: m3Shape.large,
      backgroundColor: m3.surfaceContainer,
    },
    emptyShape: {
      color: m3.tertiaryContainer,
    },
    emptyIcon: {
      color: m3.onTertiaryContainer,
    },
    emptyText: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },
    emptyTitle: {
      ...m3Type.labelLarge,
      color: m3.onSurface,
    },
    emptyBody: {
      ...m3Type.bodySmall,
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
    footerArea: {
      marginTop: 'auto',
    },
    footerBlock: {
      margin: '0 12px 12px',
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
