import { m3Shape, m3Type } from '../../../styles/m3/tokens';

const EMPHASIZED_DECELERATE = 'cubic-bezier(0.05, 0.7, 0.1, 1)';

// What's new as a bento grid sized to its content: the component sets
// --cols (columns in a wide window), --cols-medium and --featured-span from
// the number of cards (whatsNewLayout), so every row is full whether there
// is one change or twelve. Narrow windows use one column. Cards rise in one
// after the other.
const WIDE = '@media (min-width: 1080px)';
const MEDIUM = '@media (min-width: 720px)';

export const styles = (theme) => {
  const { m3 } = theme.palette;

  const tone = (container, onContainer, accent, onAccent) => ({
    backgroundColor: container,
    color: onContainer,
    '& $shape': { color: accent },
    '& $icon': { color: onAccent },
  });

  return {
    root: {},
    grid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gap: 12,
      [MEDIUM]: {
        gridTemplateColumns: 'repeat(var(--cols-medium, 2), minmax(0, 1fr))',
      },
      [WIDE]: {
        gridTemplateColumns: 'repeat(var(--cols, 3), minmax(0, 1fr))',
      },
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 10,
      minWidth: 0,
      padding: 20,
      boxSizing: 'border-box',
      borderRadius: m3Shape.extraLarge,
      animation: `$cardIn 520ms ${EMPHASIZED_DECELERATE} both`,
      animationDelay: 'calc(120ms + var(--i) * 60ms)',
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
    '@keyframes cardIn': {
      from: { opacity: 0, transform: 'translateY(16px) scale(0.97)' },
      to: { opacity: 1, transform: 'none' },
    },
    // the featured card: two columns wide, in the app colour, icon beside
    // the text
    featured: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      gridColumn: '1 / -1',
      padding: 24,
      backgroundColor: m3.primary,
      color: m3.onPrimary,
      [WIDE]: { gridColumn: 'span var(--featured-span, 2)' },
    },
    // the only change: a roomier card, larger type
    featuredAlone: {
      padding: 32,
      '& $featuredTitle': { ...m3Type.headlineMedium, fontWeight: 700 },
    },
    cardTop: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
      width: '100%',
    },
    // "New in 4.1" when the panel covers more than one version; outlined
    // in the card's own content colour, so it fits every tone
    versionTag: {
      ...m3Type.labelMedium,
      display: 'inline-flex',
      alignItems: 'center',
      alignSelf: 'flex-start',
      height: 24,
      marginBottom: 6,
      padding: '0 10px',
      boxSizing: 'border-box',
      borderRadius: 12,
      border: '1px solid currentColor',
      fontWeight: 650,
      whiteSpace: 'nowrap',
    },
    featuredShape: {
      flexShrink: 0,
      color: m3.primaryContainer,
    },
    featuredIcon: {
      color: m3.onPrimaryContainer,
    },
    cardText: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      minWidth: 0,
    },
    featuredTitle: {
      ...m3Type.headlineSmall,
      margin: 0,
      fontWeight: 700,
    },
    featuredDescription: {
      ...m3Type.bodyLarge,
      margin: '6px 0 0',
    },
    featuredAction: {
      marginTop: 14,
    },
    primary: tone(
      m3.primaryContainer,
      m3.onPrimaryContainer,
      m3.primary,
      m3.onPrimary
    ),
    secondary: tone(
      m3.secondaryContainer,
      m3.onSecondaryContainer,
      m3.secondary,
      m3.onSecondary
    ),
    tertiary: tone(
      m3.tertiaryContainer,
      m3.onTertiaryContainer,
      m3.tertiary,
      m3.onTertiary
    ),
    neutral: tone(
      m3.surfaceContainerHighest,
      m3.onSurface,
      m3.onSurfaceVariant,
      m3.surfaceContainerHighest
    ),
    shape: {},
    icon: {},
    cardTitle: {
      ...m3Type.titleLarge,
      margin: '4px 0 0',
      fontWeight: 700,
    },
    cardDescription: {
      ...m3Type.bodyMedium,
      margin: 0,
      opacity: 0.92,
    },
    more: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '8px 12px',
      marginTop: 16,
      animation: `$cardIn 520ms ${EMPHASIZED_DECELERATE} 480ms both`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
    moreLabel: {
      ...m3Type.labelLarge,
      color: m3.onSurfaceVariant,
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    chip: {
      ...m3Type.labelLarge,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      minHeight: 32,
      padding: '4px 14px 4px 10px',
      boxSizing: 'border-box',
      borderRadius: m3Shape.small,
      backgroundColor: m3.surfaceContainerLowest,
      color: m3.onSurface,
      boxShadow: `inset 0 0 0 1px ${m3.outlineVariant}`,
    },
  };
};
