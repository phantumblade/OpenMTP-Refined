import { m3Motion, m3Shape, m3Type } from '../../../styles/m3/tokens';

// File transfer dialog, Material 3 Expressive. The dialog container itself
// (surfaceContainerHigh, 28px corners) comes from the global M3 overrides.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    root: {
      '& .MuiDialog-paper': {
        overflow: 'hidden',
      },
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '24px 24px 16px',
    },
    visual: {
      display: 'flex',
      flexShrink: 0,
    },
    visualSuccess: {
      color: m3.primaryContainer,
      '& $visualIcon': { color: m3.onPrimaryContainer },
    },
    visualError: {
      color: m3.errorContainer,
      '& $visualIcon': { color: m3.onErrorContainer },
    },
    visualIcon: {},
    title: {
      ...m3Type.headlineSmall,
      margin: 0,
      color: m3.onSurface,
    },
    itemCount: {
      ...m3Type.bodyMedium,
      marginTop: 2,
      color: m3.onSurfaceVariant,
    },
    route: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
      alignItems: 'center',
      gap: 8,
    },
    routeChip: {
      ...m3Type.labelLarge,
      overflow: 'hidden',
      padding: '8px 14px',
      borderRadius: m3Shape.small,
      backgroundColor: m3.surfaceContainerHighest,
      color: m3.onSurface,
      textAlign: 'center',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    routeArrow: {
      color: m3.primary,
    },
    steps: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 8,
      margin: '20px 0',
      padding: 0,
      listStyle: 'none',
    },
    step: {
      ...m3Type.labelLarge,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
      color: m3.onSurfaceVariant,
      transition: `color ${m3Motion.defaultEffects}`,
    },
    stepMarker: {
      display: 'grid',
      flexShrink: 0,
      placeItems: 'center',
      width: 24,
      height: 24,
      borderRadius: '50%',
      boxShadow: `inset 0 0 0 1.5px ${m3.outlineVariant}`,
      fontSize: 12,
      fontWeight: 700,
      transition: `background-color ${m3Motion.defaultEffects}, transform ${m3Motion.fastSpatial}`,
    },
    stepActive: {
      color: m3.onSurface,
      '& $stepMarker': {
        backgroundColor: m3.primary,
        color: m3.onPrimary,
        boxShadow: 'none',
        transform: 'scale(1.08)',
      },
    },
    stepComplete: {
      '& $stepMarker': {
        backgroundColor: m3.primaryContainer,
        color: m3.onPrimaryContainer,
        boxShadow: 'none',
      },
    },
    progressBlock: {
      padding: '16px 16px 14px',
      borderRadius: m3Shape.large,
      backgroundColor: m3.surfaceContainer,
    },
    progressHeader: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    fileName: {
      ...m3Type.bodyMedium,
      minWidth: 0,
      overflow: 'hidden',
      color: m3.onSurfaceVariant,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    percent: {
      ...m3Type.headlineSmall,
      fontWeight: 600,
      color: m3.primary,
      fontVariantNumeric: 'tabular-nums',
    },
    progressMeta: {
      ...m3Type.bodyMedium,
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 10,
      color: m3.onSurfaceVariant,
      fontVariantNumeric: 'tabular-nums',
    },
    speed: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 4,
      color: m3.onSurface,
      fontWeight: 600,
    },
    errorBox: {
      ...m3Type.bodyMedium,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: m3Shape.large,
      backgroundColor: m3.errorContainer,
      color: m3.onErrorContainer,
    },
    activityRow: {
      ...m3Type.bodyMedium,
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 16,
      color: m3.onSurfaceVariant,
    },
    diagnosticId: {
      opacity: 0.7,
      fontVariantNumeric: 'tabular-nums',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      padding: '16px 24px 24px',
    },
  };
};
