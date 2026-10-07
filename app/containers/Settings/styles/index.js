import { mixins } from '../../../styles/js';
import {
  m3Motion,
  m3Shape,
  m3State,
  m3Type,
  alphaHex,
} from '../../../styles/m3/tokens';

// Settings dialog, Material 3: full-width primary tabs with icons, sections
// with an icon, title and explanation, and segmented lists of rows.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    dialogPaper: {
      height: 'min(780px, 92vh)',
    },
    title: {
      ...m3Type.headlineSmall,
      flex: `0 0 auto`,
      margin: 0,
      padding: `24px 24px 8px`,
      color: m3.onSurface,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      paddingBottom: 0,
    },
    tabHeadingWrapper: {
      flexShrink: 0,
    },
    tabContainer: {
      flex: 1,
      minHeight: 0,
      padding: '8px 4px 24px',
      overflowX: `hidden`,
      overflowY: `auto`,
      boxSizing: 'border-box',
    },
    section: {
      marginTop: 20,
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
    sectionDescription: {
      ...m3Type.bodyMedium,
      color: m3.onSurfaceVariant,
    },
    // segmented list: 20px outer corners, 4px inner corners, 2px gaps
    group: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      marginBottom: 8,
      '& > $row': { borderRadius: m3Shape.extraSmall },
      '& > $row:first-child': {
        borderTopLeftRadius: m3Shape.largeIncreased,
        borderTopRightRadius: m3Shape.largeIncreased,
      },
      '& > $row:last-child': {
        borderBottomLeftRadius: m3Shape.largeIncreased,
        borderBottomRightRadius: m3Shape.largeIncreased,
      },
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      minHeight: 64,
      padding: '10px 16px',
      boxSizing: 'border-box',
      backgroundColor: m3.surfaceContainerLowest,
      transition: `background-color ${m3Motion.defaultEffects}`,
    },
    rowInteractive: {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: alphaHex(m3.onSurface, m3State.hover),
      },
    },
    rowDisabled: {
      cursor: 'default',
      opacity: 0.5,
    },
    rowIcon: {
      flexShrink: 0,
      color: m3.onSurfaceVariant,
    },
    rowText: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
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
    rowControl: {
      display: 'flex',
      flexShrink: 0,
      alignItems: 'center',
      gap: 8,
    },
    rowSelect: {
      minWidth: 240,
      '& .MuiSelect-root': { padding: '10px 36px 10px 14px' },
    },
    fontPreview: {
      ...m3Type.bodyLarge,
      color: m3.onSurface,
    },
    tipCard: {
      ...m3Type.bodyMedium,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginTop: 20,
      padding: '12px 16px',
      borderRadius: m3Shape.large,
      backgroundColor: m3.tertiaryContainer,
      color: m3.onTertiaryContainer,
    },
    link: {
      color: m3.primary,
      fontWeight: 600,
      cursor: 'pointer',
    },
    btnPositive: {
      ...mixins({ theme }).btnPositive,
    },
  };
};
