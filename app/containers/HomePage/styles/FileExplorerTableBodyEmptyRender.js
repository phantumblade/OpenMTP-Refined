import { tableCellFileExplorerTableRowsRender } from './FileExplorerTableBodyListRender';
import { m3Motion, m3Shape, m3Type } from '../../../styles/m3/tokens';

// Phone connection screen, styled with Material 3 Expressive tokens.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  const statusVariant = (container, onContainer, shape, onShape) => ({
    backgroundColor: container,
    color: onContainer,
    '& $statusShape': { color: shape },
    '& $statusIcon': { color: onShape },
  });

  return {
    emptyTableRowWrapper: {},
    tableCell: {
      ...tableCellFileExplorerTableRowsRender,
      borderBottom: 'none',
      padding: 0,
      // keep the connection screen inside the pane instead of widening the table
      width: '100%',
      maxWidth: 0,
    },
    pane: {
      display: 'flex',
      justifyContent: 'center',
      padding: '32px 24px',
      color: m3.onSurface,
    },
    // Two columns when the pane is wide enough (status + steps side by side),
    // stacked otherwise, so everything fits without scrolling.
    layout: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      alignItems: 'center',
      columnGap: 40,
      rowGap: 24,
      width: '100%',
      maxWidth: 1080,
    },
    statusRow: {
      gridColumn: '1 / -1',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      '&:empty': { display: 'none' },
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: 0,
      textAlign: 'center',
    },
    stepsColumn: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },
    hero: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 104,
      height: 104,
      marginBottom: 20,
      color: m3.primaryContainer,
    },
    heroIcon: {
      color: m3.onPrimaryContainer,
    },
    headline: {
      ...m3Type.headlineMediumEmphasized,
      margin: 0,
      color: m3.onSurface,
    },
    supporting: {
      ...m3Type.bodyLarge,
      margin: '8px 0 0',
      maxWidth: 420,
      color: m3.onSurfaceVariant,
    },
    actions: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 12,
      marginTop: 24,
    },
    statusCard: {
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      width: '100%',
      padding: '24px 32px 24px 24px',
      borderRadius: m3Shape.extraLarge,
      textAlign: 'left',
      boxSizing: 'border-box',
      animation: '$statusIn 500ms cubic-bezier(0.38, 1.21, 0.22, 1)',
    },
    '@keyframes statusIn': {
      from: { opacity: 0, transform: 'translateY(8px) scale(0.98)' },
      to: { opacity: 1, transform: 'none' },
    },
    statusShape: {},
    statusIcon: {},
    statusError: statusVariant(
      m3.errorContainer,
      m3.onErrorContainer,
      m3.error,
      m3.onError
    ),
    statusOk: statusVariant(
      m3.surfaceContainer,
      m3.onSurfaceVariant,
      m3.primary,
      m3.onPrimary
    ),
    statusText: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      minWidth: 0,
    },
    statusFace: {
      color: m3.error,
    },
    statusTitle: {
      ...m3Type.titleLarge,
      fontWeight: 600,
    },
    statusBody: {
      ...m3Type.bodyLarge,
      opacity: 0.9,
    },
    statusSteps: {
      margin: '8px 0 0',
      paddingLeft: 22,
      '& li': { margin: '2px 0' },
      '& li::marker': { fontWeight: 700 },
    },
    technicalDetail: {
      ...m3Type.labelLarge,
      display: 'block',
      marginTop: 6,
      fontWeight: 400,
      opacity: 0.7,
      wordBreak: 'break-word',
    },
    statusActions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    stepsTitle: {
      ...m3Type.labelLargeEmphasized,
      margin: '0 0 10px 4px',
      color: m3.primary,
    },
    // M3 Expressive segmented list: separate items with small gaps, large
    // outer corners and small inner corners.
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      width: '100%',
      margin: 0,
      padding: 0,
      listStyle: 'none',
      textAlign: 'left',
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      minHeight: 64,
      padding: '10px 20px 10px 14px',
      boxSizing: 'border-box',
      borderRadius: m3Shape.extraSmall,
      backgroundColor: m3.surfaceContainer,
      transition: `border-radius ${m3Motion.defaultSpatial}, background-color ${m3Motion.defaultEffects}`,
      '&:first-child': {
        borderTopLeftRadius: m3Shape.largeIncreased,
        borderTopRightRadius: m3Shape.largeIncreased,
      },
      '&:last-child': {
        borderBottomLeftRadius: m3Shape.largeIncreased,
        borderBottomRightRadius: m3Shape.largeIncreased,
      },
      '&:hover': {
        backgroundColor: m3.surfaceContainerHigh,
        borderRadius: m3Shape.largeIncreased,
      },
    },
    listText: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0,
    },
    listHeadline: {
      ...m3Type.bodyLarge,
      fontWeight: 500,
      color: m3.onSurface,
    },
    listSupporting: {
      ...m3Type.bodyMedium,
      color: m3.onSurfaceVariant,
    },
    listTrailing: {
      ...m3Type.labelLarge,
      color: m3.onSurfaceVariant,
    },
    avatarPrimary: {
      color: m3.primaryContainer,
      '& $avatarIcon': { color: m3.onPrimaryContainer },
    },
    avatarSecondary: {
      color: m3.secondaryContainer,
      '& $avatarIcon': { color: m3.onSecondaryContainer },
    },
    avatarTertiary: {
      color: m3.tertiaryContainer,
      '& $avatarIcon': { color: m3.onTertiaryContainer },
    },
    avatarFixed: {
      color: m3.primaryFixedDim,
      '& $avatarIcon': { color: m3.onPrimaryFixedVariant },
    },
    avatarIcon: {},
  };
};
