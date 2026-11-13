import {
  alphaHex,
  m3Elevation,
  m3Motion,
  m3Shape,
  m3State,
  m3Type,
} from '../../../styles/m3/tokens';

const EMPHASIZED_DECELERATE = 'cubic-bezier(0.05, 0.7, 0.1, 1)';

// Transfers: an M3 side sheet, and the extended FAB a copy shrinks into
// while it continues in the background.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    pill: {
      ...m3Type.labelLarge,
      position: 'fixed',
      left: '50%',
      bottom: 76,
      zIndex: 1200,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      height: 56,
      padding: '0 20px 0 16px',
      border: 'none',
      borderRadius: 28,
      backgroundColor: m3.primaryContainer,
      color: m3.onPrimaryContainer,
      boxShadow: m3Elevation.level3,
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 650,
      cursor: 'pointer',
      outline: 'none',
      transform: 'translateX(-50%)',
      animation: `$pillIn 450ms ${EMPHASIZED_DECELERATE} both`,
      transition: `border-radius ${m3Motion.fastSpatial}, background-color ${m3Motion.defaultEffects}, color ${m3Motion.defaultEffects}`,
      '&:active': { borderRadius: m3Shape.large },
      '&:focus-visible': {
        boxShadow: `${m3Elevation.level3}, 0 0 0 3px ${m3.secondary}`,
      },
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
    pillDone: {
      backgroundColor: m3.tertiaryContainer,
      color: m3.onTertiaryContainer,
    },
    pillFailed: {
      backgroundColor: m3.errorContainer,
      color: m3.onErrorContainer,
    },
    '@keyframes pillIn': {
      from: {
        opacity: 0,
        transform: 'translateX(-50%) translateY(24px) scale(0.8)',
      },
      to: { opacity: 1, transform: 'translateX(-50%)' },
    },
    pillText: {
      whiteSpace: 'nowrap',
    },
    pillPercent: {
      fontVariantNumeric: 'tabular-nums',
      opacity: 0.8,
    },
    sheet: {
      width: 420,
      maxWidth: '92vw',
      borderRadius: `${m3Shape.large}px 0 0 ${m3Shape.large}px`,
      backgroundColor: m3.surfaceContainerLow,
      color: m3.onSurface,
      boxShadow: m3Elevation.level1,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '28px 16px 12px 24px',
    },
    title: {
      ...m3Type.headlineSmall,
      margin: 0,
      fontWeight: 600,
    },
    body: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 16px 24px',
    },
    section: {
      marginTop: 16,
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      ...m3Type.titleSmall,
      margin: '0 8px 8px',
      color: m3.onSurfaceVariant,
    },
    running: {
      padding: 16,
      borderRadius: m3Shape.large,
      backgroundColor: m3.primaryContainer,
      color: m3.onPrimaryContainer,
    },
    runningHeader: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    runningPercent: {
      ...m3Type.titleLarge,
      fontWeight: 650,
      fontVariantNumeric: 'tabular-nums',
    },
    runningFooter: {
      ...m3Type.bodyMedium,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 12,
    },
    backup: {
      marginTop: 4,
      padding: 16,
      borderRadius: m3Shape.extraLarge,
      backgroundColor: m3.tertiaryContainer,
      color: m3.onTertiaryContainer,
    },
    backupHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    },
    backupTitle: {
      ...m3Type.titleMedium,
      fontWeight: 650,
    },
    backupText: {
      ...m3Type.bodyMedium,
    },
    backupFolder: {
      ...m3Type.bodySmall,
      display: 'block',
      margin: '10px 0 0 36px',
      wordBreak: 'break-all',
      opacity: 0.85,
    },
    backupActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    clipboard: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 8px 12px 16px',
      borderRadius: m3Shape.large,
      backgroundColor: m3.surfaceContainerHigh,
    },
    clipboardText: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0,
    },
    empty: {
      ...m3Type.bodyMedium,
      margin: '0 8px',
      color: m3.onSurfaceVariant,
    },
    // connected list: 2dp between rows, large corners at both ends
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    entry: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 8px 12px 12px',
      borderRadius: m3Shape.extraSmall,
      backgroundColor: m3.surfaceContainerHigh,
      '&:first-child': {
        borderTopLeftRadius: m3Shape.large,
        borderTopRightRadius: m3Shape.large,
      },
      '&:last-child': {
        borderBottomLeftRadius: m3Shape.large,
        borderBottomRightRadius: m3Shape.large,
      },
    },
    entryIcon: {
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: m3.secondaryContainer,
      color: m3.onSecondaryContainer,
    },
    entryIconFailed: {
      backgroundColor: m3.errorContainer,
      color: m3.onErrorContainer,
    },
    entryText: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0,
    },
    entryTitle: {
      ...m3Type.titleSmall,
      fontWeight: 650,
    },
    entryMeta: {
      ...m3Type.bodyMedium,
      color: m3.onSurfaceVariant,
    },
    entryPath: {
      ...m3Type.bodySmall,
      marginTop: 2,
      color: m3.onSurfaceVariant,
      wordBreak: 'break-all',
    },
    entryEnd: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      flexShrink: 0,
      gap: 2,
    },
    entryTime: {
      ...m3Type.labelMedium,
      marginRight: 8,
      color: m3.onSurfaceVariant,
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
    },
    entryAction: {
      display: 'grid',
      placeItems: 'center',
      width: 40,
      height: 40,
      border: 'none',
      borderRadius: 20,
      backgroundColor: 'transparent',
      color: m3.onSurfaceVariant,
      cursor: 'pointer',
      outline: 'none',
      transition: `border-radius ${m3Motion.fastSpatial}, background-color ${m3Motion.fastEffects}`,
      '&:hover': {
        backgroundColor: alphaHex(m3.onSurfaceVariant, m3State.hover),
      },
      '&:active': { borderRadius: 12 },
      '&:focus-visible': { boxShadow: `0 0 0 3px ${m3.secondary}` },
    },
  };
};
