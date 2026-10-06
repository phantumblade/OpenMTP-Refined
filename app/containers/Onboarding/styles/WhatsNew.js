import { m3Shape, m3Type } from '../../../styles/m3/tokens';

// Values from the Material 3 Expressive list tokens (Compose ListTokens):
// segmented items 2dp apart, 16dp outer / 4dp inner corners, 16dp side and
// 10dp vertical padding, 24dp leading icon, 72dp two-line height.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    root: {},
    section: {
      '& + &': { marginTop: 20 },
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      margin: '0 4px 12px',
    },
    sectionShape: {
      color: m3.primaryContainer,
    },
    sectionIcon: {
      color: m3.onPrimaryContainer,
    },
    sectionTitle: {
      ...m3Type.titleMediumEmphasized,
      color: m3.onSurface,
    },
    group: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      minHeight: 72,
      padding: '10px 16px',
      boxSizing: 'border-box',
      borderRadius: m3Shape.extraSmall,
      backgroundColor: m3.surfaceContainerLowest,
      '&:first-child': {
        borderTopLeftRadius: m3Shape.large,
        borderTopRightRadius: m3Shape.large,
      },
      '&:last-child': {
        borderBottomLeftRadius: m3Shape.large,
        borderBottomRightRadius: m3Shape.large,
      },
    },
    rowIcon: {
      flexShrink: 0,
      color: m3.onSurfaceVariant,
    },
    rowText: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },
    rowTitle: {
      ...m3Type.bodyLarge,
      color: m3.onSurface,
    },
    rowDescription: {
      ...m3Type.bodyMedium,
      color: m3.onSurfaceVariant,
    },
  };
};
