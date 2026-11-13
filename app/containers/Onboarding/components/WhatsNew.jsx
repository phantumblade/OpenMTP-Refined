import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import M3Shape from '../../../components/m3/M3Shape';
import M3Button from '../../../components/m3/M3Button';
import { styles } from '../styles/WhatsNew';
import { translate } from '../../../i18n';

// What's new in this version, most important first. The first item is the
// featured card; the others fill a grid that has as many columns as the
// window allows. `more` lists the smaller changes as chips.
// Keep it current: every user-facing change belongs here (EN + IT).
export const WHATS_NEW = {
  featured: {
    icon: 'add_photo_alternate',
    shape: 'Cookie9Sided',
    title: 'Photo backup in one click',
    description:
      'Copies to a Mac folder the phone’s new photos and videos, keeping its sub-folders. What is already on the Mac is skipped and never overwritten.',
  },
  items: [
    {
      icon: 'swap_vert',
      shape: 'Pill',
      tone: 'secondary',
      title: 'Transfers panel',
      description:
        'The copy in progress, the files ready to paste and the history of past copies, a click away in the phone pane.',
    },
    {
      icon: 'picture_in_picture_alt',
      shape: 'Clover4Leaf',
      tone: 'tertiary',
      title: 'Copies in the background',
      description:
        'A long copy shrinks into a floating pill, and macOS tells you when it ends.',
    },
    {
      icon: 'palette',
      shape: 'Sunny',
      tone: 'primary',
      title: 'Your app colour',
      description:
        'Blue, purple, pink, red, orange, yellow or green, or the macOS accent colour: the whole app follows it.',
    },
    {
      icon: 'animation',
      shape: 'SoftBurst',
      tone: 'neutral',
      title: 'Material 3 Expressive',
      description:
        'Google Sans Flex, livelier colours and spring motion in buttons, switches, menus and tiles.',
    },
  ],
  more: [
    { icon: 'notifications', title: 'Update badge in the side menu' },
    { icon: 'summarize', title: 'Summary at the end of a copy' },
    { icon: 'donut_large', title: 'Free space next to the device' },
    { icon: 'format_size', title: 'Adjustable interface size' },
    { icon: 'view_column', title: 'Two-column Settings' },
    { icon: 'ads_click', title: 'Panels close with a click outside' },
  ],
};

class WhatsNew extends PureComponent {
  render() {
    const { classes: styles, appLanguage, onShowBackupGuide } = this.props;
    const t = (key) => translate(appLanguage, key);
    const { featured, items, more } = WHATS_NEW;

    return (
      <div className={styles.root}>
        <div className={styles.grid}>
          <article
            className={classNames(styles.card, styles.featured)}
            style={{ '--i': 0 }}
          >
            <M3Shape
              shape={featured.shape}
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
              <h3 className={styles.featuredTitle}>{t(featured.title)}</h3>
              <p className={styles.featuredDescription}>
                {t(featured.description)}
              </p>
              {onShowBackupGuide && (
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

          {items.map((item, index) => (
            <article
              key={item.title}
              className={classNames(styles.card, styles[item.tone])}
              style={{ '--i': index + 1 }}
            >
              <M3Shape
                shape={item.shape}
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
              <h3 className={styles.cardTitle}>{t(item.title)}</h3>
              <p className={styles.cardDescription}>{t(item.description)}</p>
            </article>
          ))}
        </div>

        <div className={styles.more}>
          <span className={styles.moreLabel}>{t('Also new')}</span>
          <ul className={styles.chips}>
            {more.map((item) => (
              <li key={item.title} className={styles.chip}>
                <MaterialSymbol name={item.icon} size={18} />
                {t(item.title)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(WhatsNew);
