import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import M3Shape from '../../../components/m3/M3Shape';
import SlotText from '../../../components/SlotText';
import { styles } from '../styles/SidebarAreaPaneLists';
import { quickHash, capitalize } from '../../../utils/funcs';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';
import { translate } from '../../../i18n';
import { APP_NAME, APP_VERSION } from '../../../constants/meta';
import { fileExistsSync } from '../../../helpers/fileOps';
import GithubBadge from '../../../components/GithubBadge';
import { imgsrc } from '../../../utils/imgsrc';
import { FAVORITE_FOLDERS_MAX } from '../../../helpers/favoriteFolders';

const LOCATION_ICONS = {
  Home: 'home',
  Desktop: 'desktop_mac',
  Downloads: 'download',
  'Removable Disks': 'hard_drive',
  Root: 'computer',
};

// Material 3 navigation drawer (Compose NavigationDrawerTokens): pill items
// inset by 12dp, secondary container active indicator, titleSmall section
// headlines and labelLarge labels.
class SidebarAreaPaneLists extends PureComponent {
  _handleListDirectory = ({ filePath, deviceType, isSidemenu }) => {
    const { onClickHandler, onToggleDrawer } = this.props;

    analyticsService.sendEvent(EVENT_TYPE.NAVIGATE, {
      path: filePath,
    });

    onClickHandler({
      filePath,
      deviceType,
      isSidemenu,
    });

    if (onToggleDrawer) {
      onToggleDrawer(false)();
    }
  };

  _handleAction = (actionFn) => {
    const { onToggleDrawer } = this.props;

    if (typeof actionFn === 'function') {
      actionFn();
    }

    if (onToggleDrawer) {
      onToggleDrawer(false)();
    }
  };

  renderItem = ({
    key,
    icon,
    label,
    active = false,
    disabled = false,
    onClick,
    trailing,
    className,
  }) => {
    const { classes: styles } = this.props;

    return (
      <li key={key} className={styles.itemRow}>
        <button
          type="button"
          className={classNames(styles.item, className, {
            [styles.itemActive]: active,
          })}
          aria-current={active ? 'page' : undefined}
          aria-disabled={disabled || undefined}
          onClick={disabled ? undefined : onClick}
        >
          <MaterialSymbol
            name={icon}
            size={24}
            fill={active ? 1 : 0}
            className={styles.itemIcon}
          />
          <span className={styles.itemLabel}>{label}</span>
        </button>
        {trailing}
      </li>
    );
  };

  renderLocations = (listData) => {
    const { currentBrowsePath, appLanguage, deviceType } = this.props;

    return listData.map((item) =>
      this.renderItem({
        key: quickHash(item.path),
        icon: LOCATION_ICONS[item.label] || 'hard_drive',
        label: translate(appLanguage, item.label),
        active: currentBrowsePath === item.path,
        disabled: !item.enabled,
        onClick: () =>
          this._handleListDirectory({
            filePath: item.path,
            deviceType,
            isSidemenu: true,
          }),
      })
    );
  };

  renderFavoriteFolders = () => {
    const {
      classes: styles,
      currentBrowsePath,
      appLanguage,
      deviceType,
      favoriteFolders = [],
      onRemoveFavoriteFolder,
    } = this.props;

    if (favoriteFolders.length < 1) {
      return (
        <p className={styles.emptyHint}>
          {translate(
            appLanguage,
            'Right-click a folder and choose Add to Favorites.'
          )}
        </p>
      );
    }

    return (
      <ul className={styles.list}>
        {favoriteFolders.map((item) => {
          const exists = fileExistsSync(item.path);
          const key = quickHash(item.path);

          return (
            <Tooltip
              key={key}
              title={
                exists ? item.path : translate(appLanguage, 'Folder not found')
              }
              placement="right"
              enterDelay={600}
            >
              {this.renderItem({
                key,
                icon: 'folder',
                label: item.name,
                active: currentBrowsePath === item.path,
                disabled: !exists,
                className: classNames(styles.favoriteItem, {
                  [styles.favoriteMissing]: !exists,
                }),
                onClick: () =>
                  this._handleListDirectory({
                    filePath: item.path,
                    deviceType,
                    isSidemenu: true,
                  }),
                trailing: onRemoveFavoriteFolder && (
                  <button
                    type="button"
                    className={styles.favoriteRemove}
                    aria-label={translate(appLanguage, 'Remove from Favorites')}
                    onClick={() => onRemoveFavoriteFolder(item.path)}
                  >
                    <MaterialSymbol name="close" size={18} />
                  </button>
                ),
              })}
            </Tooltip>
          );
        })}
      </ul>
    );
  };

  renderSection = ({ title, badge, children }) => {
    const { classes: styles } = this.props;

    return (
      <section className={styles.section}>
        <h3 className={styles.sectionHeadline}>
          <span>{title}</span>
          {badge && <span className={styles.sectionBadge}>{badge}</span>}
        </h3>
        {children}
      </section>
    );
  };

  render() {
    const {
      classes: styles,
      favoriteFolders = [],
      sidebarFavouriteList,
      appLanguage,
      mtpMode,
      onOpenSettings,
      onRefresh,
      onSelectStorage,
      onSelectMtpMode,
    } = this.props;

    const { top: sidebarTop, bottom: sidebarBottom } = sidebarFavouriteList;
    const isItalian = appLanguage === 'it';

    const tools = [
      onRefresh && {
        icon: 'refresh',
        label: isItalian ? 'Aggiorna elenco' : 'Refresh list',
        action: onRefresh,
      },
      onSelectStorage && {
        icon: 'sd_card',
        label: isItalian ? 'Cambia memoria' : 'Select storage',
        action: onSelectStorage,
      },
      onSelectMtpMode && {
        icon: 'bolt',
        label: isItalian ? 'Modalità MTP' : 'MTP mode',
        action: onSelectMtpMode,
      },
      onOpenSettings && {
        icon: 'tune',
        label: isItalian ? 'Impostazioni' : 'Settings',
        action: onOpenSettings,
      },
    ].filter(Boolean);

    return (
      <nav className={styles.listsWrapper}>
        <div className={styles.headerBlock}>
          <M3Shape
            shape="Cookie9Sided"
            size={48}
            color="currentColor"
            className={styles.headerShape}
          >
            <MaterialSymbol
              name="mobile"
              size={26}
              fill={1}
              className={styles.headerIcon}
            />
          </M3Shape>
          <div className={styles.headerText}>
            <div className={styles.headerTitle}>{APP_NAME}</div>
            <div className={styles.headerSubtitle}>
              {isItalian
                ? 'Trasferimento file Android per macOS'
                : 'Android File Transfer for macOS'}
            </div>
          </div>
        </div>

        {mtpMode && (
          <div className={styles.modeChipRow}>
            <button
              type="button"
              className={styles.modeChip}
              onClick={() => this._handleAction(onSelectMtpMode)}
            >
              <MaterialSymbol
                name="bolt"
                size={18}
                fill={1}
                className={styles.modeChipIcon}
              />
              <SlotText text={`${capitalize(mtpMode)} Mode`} />
            </button>
          </div>
        )}

        <div className={styles.contentScrollArea}>
          {this.renderSection({
            title: isItalian ? 'Posizioni rapide' : 'Quick access',
            children: (
              <ul className={styles.list}>
                {sidebarTop && this.renderLocations(sidebarTop)}
                {sidebarBottom && this.renderLocations(sidebarBottom)}
              </ul>
            ),
          })}

          <hr className={styles.divider} />

          {this.renderSection({
            title: translate(appLanguage, 'Favorites'),
            badge:
              favoriteFolders.length > 0
                ? `${favoriteFolders.length}/${FAVORITE_FOLDERS_MAX}`
                : null,
            children: this.renderFavoriteFolders(),
          })}

          <hr className={styles.divider} />

          {this.renderSection({
            title: isItalian ? 'Strumenti e azioni' : 'Tools and actions',
            children: (
              <ul className={styles.list}>
                {tools.map((tool) =>
                  this.renderItem({
                    key: tool.icon,
                    icon: tool.icon,
                    label: tool.label,
                    onClick: () => this._handleAction(tool.action),
                  })
                )}
              </ul>
            ),
          })}
        </div>

        {/* Footer Block */}
        <div className={styles.footerBlock}>
          <img
            className={styles.footerAppIcon}
            src={imgsrc('app-icon.png')}
            alt=""
          />
          <div className={styles.footerMeta}>
            <span className={styles.footerAppName}>
              {APP_NAME}
              <span className={styles.footerVersion}>{`v${APP_VERSION}`}</span>
            </span>
            <span className={styles.footerAppSub}>
              {isItalian ? 'Ottimizzato per macOS' : 'Crafted for macOS'}
            </span>
          </div>
          <GithubBadge appLanguage={appLanguage} />
        </div>
      </nav>
    );
  }
}

export default withStyles(styles)(SidebarAreaPaneLists);
