import { m3Type } from '../../../styles/m3/tokens';

// Material 3 basic dialog with a hero icon
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    paper: {
      maxWidth: 420,
    },
    hero: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '24px 24px 0',
      textAlign: 'center',
    },
    shape: { color: m3.secondaryContainer },
    icon: { color: m3.onSecondaryContainer },
    shapeError: { color: m3.errorContainer },
    iconError: { color: m3.onErrorContainer },
    headline: {
      ...m3Type.headlineSmall,
      margin: 0,
      color: m3.onSurface,
    },
    content: {
      padding: '16px 24px 0',
    },
    body: {
      ...m3Type.bodyMedium,
      margin: 0,
      color: m3.onSurfaceVariant,
      textAlign: 'center',
    },
    facts: {
      display: 'grid',
      gap: 10,
      margin: '16px 0 0',
      padding: 0,
      listStyle: 'none',
      '& li': {
        ...m3Type.bodyMedium,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        color: m3.onSurfaceVariant,
      },
      '& li > span': {
        flexShrink: 0,
        color: m3.secondary,
      },
    },
    actions: {
      padding: 24,
      gap: 8,
    },
    spacer: {
      flex: 1,
    },
  };
};
