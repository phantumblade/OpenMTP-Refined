import { m3Shape, m3Type } from '../../../styles/m3/tokens';

export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    root: {},
    title: {
      ...m3Type.titleMedium,
      color: m3.primary,
      marginBottom: 8,
    },
    list: {
      display: 'grid',
      gap: 4,
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '10px 12px',
      borderRadius: m3Shape.medium,
    },
    itemIcon: {
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: m3.secondaryContainer,
      color: m3.onSecondaryContainer,
    },
    itemText: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },
    itemTitle: {
      ...m3Type.bodyLarge,
      color: m3.onSurface,
    },
    itemDescription: {
      ...m3Type.bodyMedium,
      color: m3.onSurfaceVariant,
    },
  };
};
