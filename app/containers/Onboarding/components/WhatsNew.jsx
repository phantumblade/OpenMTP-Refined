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
        title: 'A more reliable phone connection',
        description:
          'OpenMTP frees the phone from the macOS apps that grab it and no longer gets stuck loading.',
      },
      {
        icon: 'help',
        title: 'Errors explained in plain words',
        description:
          'Each connection problem tells you what happened and what to do.',
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
        description: 'Star up to 5 folders and open them from the side menu.',
      },
      {
        icon: 'filter_alt',
        title: 'Filters by date and file type',
        description: 'Quick ranges and the date format of your language.',
      },
      {
        icon: 'swap_vert',
        title: 'Clearer transfers',
        description: 'Phases, speed, current file and a smooth progress bar.',
      },
    ],
  },
  {
    icon: 'palette',
    title: 'Look and feel',
    items: [
      {
        icon: 'brush',
        title: 'A brand new Material 3 Expressive design',
        description:
          'Google colors with light and dark themes, new icons and animations.',
      },
      {
        icon: 'translate',
        title: 'Italian and English',
        description: 'Choose the language and the interface font in Settings.',
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
