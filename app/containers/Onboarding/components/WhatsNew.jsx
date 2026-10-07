import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import M3Shape from '../../../components/m3/M3Shape';
import { styles } from '../styles/WhatsNew';
import { translate } from '../../../i18n';

// What's new in 4.0, as Material 3 Expressive segmented lists grouped by
// topic (the same section layout as the settings dialog).
const SECTIONS = [
  {
    icon: 'cable',
    title: 'Phone connection',
    items: [
      {
        icon: 'link',
        title: 'Fewer connection hiccups',
        description:
          'When the macOS Photos service holds on to your phone, OpenMTP releases it for you.',
      },
      {
        icon: 'help',
        title: 'Clear help when something goes wrong',
        description:
          'If the connection fails, OpenMTP tells you why and what to do next.',
      },
    ],
  },
  {
    icon: 'folder_open',
    title: 'Files and transfers',
    items: [
      {
        icon: 'star',
        title: 'Favorite folders',
        description: 'Keep up to 5 folders one click away in the side menu.',
      },
      {
        icon: 'filter_alt',
        title: 'Filters by date and type',
        description:
          "Find yesterday's photos or only the videos, with dates in your language's format.",
      },
      {
        icon: 'swap_vert',
        title: 'Transfers you can follow',
        description:
          'See each step, the speed and the file being copied, on a smooth progress bar.',
      },
    ],
  },
  {
    icon: 'shield_lock',
    title: 'Privacy',
    items: [
      {
        icon: 'folder_managed',
        title: 'You decide which folders OpenMTP opens',
        description:
          'Before macOS asks for Desktop, Documents or Downloads, OpenMTP explains why. Change it anytime in Settings.',
      },
    ],
  },
  {
    icon: 'palette',
    title: 'Look and feel',
    items: [
      {
        icon: 'brush',
        title: 'Material 3 Expressive design',
        description:
          "Google's colors, shapes and motion, in light and dark themes.",
      },
      {
        icon: 'translate',
        title: 'In your language',
        description:
          "OpenMTP starts in your Mac's language. You can change it, and the font, in Settings.",
      },
    ],
  },
];

class WhatsNew extends PureComponent {
  render() {
    const { classes: styles, appLanguage } = this.props;
    const t = (key) => translate(appLanguage, key);

    return (
      <div className={styles.root}>
        {SECTIONS.map((section) => (
          <section key={section.title} className={styles.section}>
            <div className={styles.sectionHeader}>
              <M3Shape
                shape="Cookie9Sided"
                size={40}
                color="currentColor"
                className={styles.sectionShape}
              >
                <MaterialSymbol
                  name={section.icon}
                  size={22}
                  fill={1}
                  className={styles.sectionIcon}
                />
              </M3Shape>
              <span className={styles.sectionTitle}>{t(section.title)}</span>
            </div>

            <ul className={styles.group}>
              {section.items.map((item) => (
                <li key={item.title} className={styles.row}>
                  <MaterialSymbol
                    name={item.icon}
                    size={24}
                    className={styles.rowIcon}
                  />
                  <span className={styles.rowText}>
                    <span className={styles.rowTitle}>{t(item.title)}</span>
                    <span className={styles.rowDescription}>
                      {t(item.description)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }
}

export default withStyles(styles)(WhatsNew);
