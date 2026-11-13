import { m3Type } from '../../../styles/m3/tokens';

// What's new dialog: as wide as the window allows (up to three columns of
// cards), the app icon beside the headline, the cards, and one action.
// On a short window only the cards scroll.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    root: {},
    paper: {
      width: 'min(1080px, calc(100vw - 48px))',
      maxWidth: 'none',
      maxHeight: 'calc(100vh - 48px)',
      margin: 24,
    },
    hero: {
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '28px 28px 20px',
    },
    heroIcon: {
      flexShrink: 0,
      width: 72,
      height: 72,
      objectFit: 'contain',
    },
    heroText: {
      minWidth: 0,
    },
    headline: {
      ...m3Type.headlineMedium,
      margin: 0,
      fontWeight: 700,
      color: m3.onSurface,
    },
    supportingText: {
      ...m3Type.bodyLarge,
      margin: '4px 0 0',
      color: m3.onSurfaceVariant,
    },
    content: {
      padding: '0 28px 8px',
    },
    actions: {
      padding: '16px 28px 24px',
    },
  };
};
