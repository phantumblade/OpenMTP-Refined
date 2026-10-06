import {
  alphaHex,
  m3Elevation,
  m3Motion,
  m3Shape,
  m3State,
  m3Type,
} from '../../styles/m3/tokens';

export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    // M3 standard icon button
    badge: {
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      width: 40,
      height: 40,
      marginLeft: 'auto',
      border: 'none',
      borderRadius: 20,
      backgroundColor: 'transparent',
      color: m3.onSurfaceVariant,
      cursor: 'pointer',
      outline: 'none',
      transition: `background-color ${m3Motion.defaultEffects}, border-radius ${m3Motion.fastSpatial}, color ${m3Motion.defaultEffects}`,
      '&:hover, &:focus-visible': {
        backgroundColor: alphaHex(m3.onSurfaceVariant, m3State.hover),
        color: m3.onSurface,
      },
      '&:active': { borderRadius: m3Shape.small },
      '&:focus-visible': { outline: `3px solid ${m3.secondary}` },
    },
    popper: {
      zIndex: 1500,
    },
    // M3 elevated card
    card: {
      width: 300,
      padding: 16,
      borderRadius: m3Shape.large,
      backgroundColor: m3.surfaceContainerLow,
      color: m3.onSurface,
      boxShadow: m3Elevation.level2,
    },
    identity: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      objectFit: 'cover',
    },
    avatarFallback: {
      display: 'grid',
      placeItems: 'center',
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: m3.primaryContainer,
      color: m3.onPrimaryContainer,
    },
    identityText: {
      display: 'flex',
      flexDirection: 'column',
    },
    name: {
      ...m3Type.titleMediumEmphasized,
    },
    login: {
      ...m3Type.bodyMedium,
      color: m3.onSurfaceVariant,
    },
    repo: {
      display: 'flex',
      gap: 10,
      marginTop: 14,
      padding: 12,
      borderRadius: m3Shape.medium,
      backgroundColor: m3.surfaceContainerHighest,
      '& > div': {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      },
    },
    repoIcon: {
      flexShrink: 0,
      color: m3.primary,
    },
    repoName: {
      ...m3Type.labelLarge,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    repoDescription: {
      ...m3Type.bodySmall,
      marginTop: 2,
      color: m3.onSurfaceVariant,
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      marginTop: 12,
    },
    stat: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 10px',
      borderRadius: m3Shape.small,
      backgroundColor: m3.secondaryContainer,
      color: m3.onSecondaryContainer,
    },
    statIcon: {
      flexShrink: 0,
    },
    statValue: {
      ...m3Type.labelLarge,
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
    },
    statLabel: {
      ...m3Type.bodySmall,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    meta: {
      ...m3Type.bodySmall,
      minHeight: 16,
      marginTop: 10,
      color: m3.onSurfaceVariant,
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 8,
    },
  };
};
