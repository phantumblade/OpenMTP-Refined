import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import M3Shape from '../../../components/m3/M3Shape';
import M3Button from '../../../components/m3/M3Button';
import { styles } from '../styles/WhatsNew';
import { translate } from '../../../i18n';
import { APP_VERSION } from '../../../constants/meta';
import { selectWhatsNew, whatsNewLayout } from '../whatsNewItems';

// Colours and shapes go by position, not by item, so any selection reads as
// the same composition.
const CARD_LOOKS = [
  { tone: 'secondary', shape: 'Pill' },
  { tone: 'tertiary', shape: 'Clover4Leaf' },
  { tone: 'primary', shape: 'Sunny' },
  { tone: 'neutral', shape: 'SoftBurst' },
];

const shortVersion = (version) => version.replace(/\.0$/, '');

// What's new for this user: the changes since the version they come from
// (see whatsNewItems.js), the most important one featured, the next ones as
// cards in a grid sized to their number, the rest as chips. When the
// changes span several versions, each card says which one.
class WhatsNew extends PureComponent {
  render() {
    const {
      classes: styles,
      appLanguage,
      onShowBackupGuide,
      selection = selectWhatsNew({ to: APP_VERSION }),
    } = this.props;
    const t = (key, values) => translate(appLanguage, key, values);
    const { featured, cards, chips, multipleVersions, mode } = selection;
    // "New in 4.1" helps who updates across versions, not a first install
    const showVersions = mode === 'update' && multipleVersions;

    if (!featured) {
      return null;
    }

    const layout = whatsNewLayout(cards.length);
    const versionTag = (item) =>
      showVersions && (
        <span className={styles.versionTag}>
          {t('New in {version}', { version: shortVersion(item.since) })}
        </span>
      );

    return (
      <div
        className={styles.root}
        style={{
          '--cols': layout.columns,
          '--cols-medium': Math.min(layout.columns, 2),
          '--featured-span': layout.featuredSpan,
        }}
      >
        <div className={styles.grid}>
          <article
            className={classNames(styles.card, styles.featured, {
              [styles.featuredAlone]: cards.length === 0,
            })}
            style={{ '--i': 0 }}
          >
            <M3Shape
              shape="Cookie9Sided"
              size={64}
              color="currentColor"
              className={styles.featuredShape}
            >
              <MaterialSymbol
                name={featured.icon}
                size={32}
                fill={1}
                className={styles.featuredIcon}
              />
            </M3Shape>
            <div className={styles.cardText}>
              {versionTag(featured)}
              <h3 className={styles.featuredTitle}>{t(featured.title)}</h3>
              <p className={styles.featuredDescription}>
                {t(featured.description)}
              </p>
              {featured.action === 'backupGuide' && onShowBackupGuide && (
                <M3Button
                  variant="tonal"
                  size="small"
                  icon="help"
                  className={styles.featuredAction}
                  onClick={onShowBackupGuide}
                >
                  {t('How it works')}
                </M3Button>
              )}
            </div>
          </article>

          {cards.map((item, index) => {
            const look = CARD_LOOKS[index % CARD_LOOKS.length];

            return (
              <article
                key={item.title}
                className={classNames(styles.card, styles[look.tone])}
                style={{ '--i': index + 1 }}
              >
                <div className={styles.cardTop}>
                  <M3Shape
                    shape={look.shape}
                    size={48}
                    color="currentColor"
                    className={styles.shape}
                  >
                    <MaterialSymbol
                      name={item.icon}
                      size={24}
                      fill={1}
                      className={styles.icon}
                    />
                  </M3Shape>
                  {versionTag(item)}
                </div>
                <h3 className={styles.cardTitle}>{t(item.title)}</h3>
                <p className={styles.cardDescription}>{t(item.description)}</p>
                {item.action === 'backupGuide' && onShowBackupGuide && (
                  <M3Button
                    variant="text"
                    size="small"
                    icon="help"
                    onClick={onShowBackupGuide}
                  >
                    {t('How it works')}
                  </M3Button>
                )}
              </article>
            );
          })}
        </div>

        {chips.length > 0 && (
          <div className={styles.more}>
            <span className={styles.moreLabel}>{t('Also new')}</span>
            <ul className={styles.chips}>
              {chips.map((item) => (
                <li key={item.title} className={styles.chip}>
                  <MaterialSymbol name={item.icon} size={18} />
                  {t(item.chip)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(WhatsNew);
