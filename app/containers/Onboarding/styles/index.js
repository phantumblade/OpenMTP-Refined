import { m3Type } from '../../../styles/m3/tokens';

// Material 3 basic dialog with a hero icon: centred icon, headline and
// supporting text, scrollable content and actions aligned to the end.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    root: {},
    paper: {
      maxWidth: 560,
    },
    hero: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 24px 16px',
      textAlign: 'center',
    },
    heroIcon: {
      width: 64,
      height: 64,
      marginBottom: 16,
      objectFit: 'contain',
    },
    headline: {
      ...m3Type.headlineSmall,
      margin: 0,
      color: m3.onSurface,
    },
    supportingText: {
      ...m3Type.bodyMedium,
      margin: '16px 0 0',
      color: m3.onSurfaceVariant,
    },
    content: {
      padding: '8px 24px',
    },
    actions: {
      padding: 24,
    },
  };
};
