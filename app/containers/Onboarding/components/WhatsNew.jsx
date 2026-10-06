import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import { styles } from '../styles/WhatsNew';
import { APP_NAME, APP_VERSION } from '../../../constants/meta';
import { translate } from '../../../i18n';

const HIGHLIGHTS = [
  {
    icon: 'palette',
    title: 'A brand new Material 3 Expressive design',
    description:
      'Google colors with light and dark themes, new icons and animations.',
  },
  {
    icon: 'cable',
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
];

class WhatsNew extends PureComponent {
  render() {
    const { classes: styles, hideTitle, appLanguage } = this.props;
    const t = (key, values) => translate(appLanguage, key, values);

    return (
      <div className={styles.root}>
        {hideTitle ? null : (
          <Typography variant="body1" className={styles.title}>
            {t("What's new in {name} {version}", {
              name: APP_NAME,
              version: APP_VERSION,
            })}
          </Typography>
        )}

        <ul className={styles.list}>
          {HIGHLIGHTS.map(({ icon, title, description }) => (
            <li key={icon} className={styles.item}>
              <span className={styles.itemIcon}>
                <MaterialSymbol name={icon} size={22} />
              </span>
              <span className={styles.itemText}>
                <span className={styles.itemTitle}>{t(title)}</span>
                <span className={styles.itemDescription}>{t(description)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default withStyles(styles)(WhatsNew);
