import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import M3Shape from '../../../components/m3/M3Shape';
import { styles } from '../styles/SidebarAreaPaneLists';
import { quickHash } from '../../../utils/funcs';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';
import { translate } from '../../../i18n';
import { APP_NAME, APP_VERSION } from '../../../constants/meta';
import { fileExistsSync } from '../../../helpers/fileOps';
import GithubBadge from '../../../components/GithubBadge';
import AppUpdateCard from './AppUpdateCard';
import { imgsrc } from '../../../utils/imgsrc';
import { FAVORITE_FOLDERS_MAX } from '../../../helpers/favoriteFolders';
import { formatStorageSize, getDiskSpace } from '../../../helpers/diskSpace';
import {
  cachedMacName,
  cachedVolumes,
  groupVolumes,
  loadMacName,
  loadVolumes,
  volumeForPath,
} from '../../../helpers/volumes';
import {
  canReadWithoutAsking,
  isFolderLocked,
} from '../../../helpers/folderAccess';
import { makeFolderAccess } from '../../Settings/selectors';

const LOCATION_ICONS = {
  Home: 'home',
  Desktop: 'desktop_mac',
  Downloads: 'download',
  'Removable Disks': 'hard_drive',
  Root: 'computer',
};

const VOLUME_ICONS = {
  internal: 'hard_drive',
  external: 'hard_drive_2',
  removable: 'usb',
  network: 'lan',
};

// how often the drives are read again while the menu is open (a disk
// plugged in or ejected shows up within this time)
const VOLUMES_REFRESH_MS = 8000;

// the volume of the open folder, read with `df` when the list of volumes
// can't be read
const fallbackVolumes = (folderPath) => {
  const disk = getDiskSpace(folderPath);

  return disk
    ? [
        {
          path: disk.mountPoint,
          name: disk.volumeName,
          totalBytes: disk.totalBytes,
          freeBytes: disk.freeBytes,
          isRoot: disk.mountPoint === '/',
          kind: 'internal',
        },
      ]
    : [];
};

// Material 3 navigation drawer (Compose NavigationDrawerTokens): pill items
// inset by 12dp, secondary container active indicator, titleSmall section
// headlines and labelLarge labels. It belongs to the Mac pane, so it only
// lists Mac locations and actions; phone actions live on the phone pane.
class SidebarAreaPaneLists extends PureComponent {
  constructor(props) {
    super(props);

    this.hoverRef = React.createRef();
    this.state = {
      volumes: cachedVolumes() || [],
      macName: cachedMacName(),
    };
  }

  componentDidMount() {
    this.refreshVolumes();
    this.volumesTimer = setInterval(this.refreshVolumes, VOLUMES_REFRESH_MS);
    loadMacName()
      .then((macName) => {
        if (!this.unmounted && macName) {
          this.setState({ macName });
        }

        return macName;
      })
      .catch(() => {});
  }

  componentWillUnmount() {
    this.unmounted = true;
    clearInterval(this.volumesTimer);
  }

  refreshVolumes = () => {
    loadVolumes()
      .then((volumes) => {
        if (!this.unmounted && volumes.length > 0) {
          this.setState({ volumes });
        }

        return volumes;
      })
      .catch(() => {});
  };

  // One hover highlight for the whole menu that glides to the item under the
  // pointer (M3 standard easing), instead of each item flashing on and off.
  moveHover = (event) => {
    const indicator = this.hoverRef.current;
    const target = event.currentTarget;

    if (!indicator || target.getAttribute('aria-disabled')) {
      return;
    }

    const { offsetTop, offsetHeight } = target.closest('li') || target;
    const wasHidden = indicator.style.opacity !== '1';

    if (wasHidden) {
      // appear in place, then glide from here on
      indicator.style.transition = 'opacity 150ms linear';
    }

    indicator.style.transform = `translateY(${offsetTop}px)`;
    indicator.style.height = `${offsetHeight}px`;
    indicator.style.opacity = '1';

    if (wasHidden) {
      // eslint-disable-next-line no-unused-expressions
      indicator.offsetHeight;
      indicator.style.transition = '';
    }
  };

  hideHover = () => {
    if (this.hoverRef.current) {
      this.hoverRef.current.style.opacity = '0';
    }
  };

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
    locked = false,
    className,
    iconClassName,
    iconFill,
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
          onMouseEnter={this.moveHover}
          onFocus={this.moveHover}
          onClick={disabled ? undefined : onClick}
        >
          <MaterialSymbol
            name={icon}
            size={24}
            fill={active || iconFill ? 1 : 0}
            className={classNames(styles.itemIcon, iconClassName)}
          />
          <span className={styles.itemLabel}>{label}</span>
          {locked && (
            <MaterialSymbol
              name="lock"
              size={18}
              className={styles.itemLock}
              aria-label="locked"
            />
          )}
        </button>
        {trailing}
      </li>
    );
  };

  renderLocations = (listData) => {
    const { currentBrowsePath, appLanguage, deviceType, folderAccess } =
      this.props;

    return listData.map((item) =>
      this.renderItem({
        key: quickHash(item.path),
        icon: LOCATION_ICONS[item.label] || 'hard_drive',
        label: translate(appLanguage, item.label),
        active: currentBrowsePath === item.path,
        disabled: !item.enabled,
        locked: isFolderLocked(item.path, folderAccess),
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
      folderAccess,
    } = this.props;

    if (favoriteFolders.length < 1) {
      // M3 empty state: what the section is for and how to fill it
      return (
        <div className={styles.emptyCard}>
          <M3Shape
            shape="Cookie4Sided"
            size={40}
            color="currentColor"
            className={styles.emptyShape}
          >
            <MaterialSymbol
              name="star"
              size={22}
              fill={1}
              className={styles.emptyIcon}
            />
          </M3Shape>
          <div className={styles.emptyText}>
            <span className={styles.emptyTitle}>
              {translate(appLanguage, 'No favorites yet')}
            </span>
            <span className={styles.emptyBody}>
              {translate(
                appLanguage,
                'Right-click a folder and choose Add to Favorites.'
              )}
            </span>
          </div>
        </div>
      );
    }

    return (
      <ul className={styles.list}>
        {favoriteFolders.map((item) => {
          // checking a path inside a protected folder would make macOS ask
          const readable = canReadWithoutAsking(item.path, folderAccess);
          const exists = readable ? fileExistsSync(item.path) : true;
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
                icon: 'star',
                iconFill: true,
                iconClassName: styles.favoriteIcon,
                label: item.name,
                active: currentBrowsePath === item.path,
                disabled: !exists,
                locked: isFolderLocked(item.path, folderAccess),
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

  // One drive as an M3 Expressive segmented list item: its name, how full
  // it is (linear progress) and the exact free space, like Finder. The
  // drive holding the open folder is selected; a click opens the drive.
  renderVolume = (volume, activePath) => {
    const {
      classes: styles,
      appLanguage,
      deviceType,
      folderAccess,
    } = this.props;
    const t = (key, values) => translate(appLanguage, key, values);
    const size = (bytes) =>
      formatStorageSize(bytes, appLanguage, { precise: true });
    const active = volume.path === activePath;
    const usedRatio = Math.min(
      1,
      Math.max(0, 1 - volume.freeBytes / volume.totalBytes)
    );

    return (
      <li key={volume.path} className={styles.volumeRow}>
        <Tooltip title={volume.path} placement="right" enterDelay={600}>
          <button
            type="button"
            className={classNames(styles.volume, {
              [styles.volumeActive]: active,
              [styles.volumeAlmostFull]: usedRatio >= 0.9,
            })}
            aria-current={active ? 'location' : undefined}
            onClick={() =>
              this._handleListDirectory({
                filePath: volume.path,
                deviceType,
                isSidemenu: true,
              })
            }
          >
            <span className={styles.volumeAvatar}>
              <MaterialSymbol
                name={VOLUME_ICONS[volume.kind] || 'hard_drive'}
                size={22}
                fill={active ? 1 : 0}
              />
            </span>
            <span className={styles.volumeText}>
              <span className={styles.volumeName}>
                <span className={styles.volumeNameText}>{volume.name}</span>
                {isFolderLocked(volume.path, folderAccess) && (
                  <MaterialSymbol
                    name="lock"
                    size={16}
                    className={styles.itemLock}
                  />
                )}
              </span>
              <span
                className={styles.diskTrack}
                role="meter"
                aria-label={t('Used space')}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(usedRatio * 100)}
              >
                <span
                  className={styles.diskUsed}
                  style={{ width: `${usedRatio * 100}%` }}
                />
                <span className={styles.diskFree}>
                  <span className={styles.diskStop} />
                </span>
              </span>
              <span className={styles.volumeSpace}>
                {t('{free} free of {total}', {
                  free: size(volume.freeBytes),
                  total: size(volume.totalBytes),
                })}
              </span>
            </span>
            <MaterialSymbol
              name="chevron_right"
              size={20}
              className={styles.volumeGo}
            />
          </button>
        </Tooltip>
      </li>
    );
  };

  // "This Mac" with its own disks, then every other drive plugged in
  renderStorage = () => {
    const { classes: styles, currentBrowsePath, appLanguage } = this.props;
    const { volumes: loaded, macName } = this.state;
    const t = (key) => translate(appLanguage, key);
    const volumes =
      loaded.length > 0 ? loaded : fallbackVolumes(currentBrowsePath);
    const { mac, other } = groupVolumes(volumes);
    const activePath = volumeForPath(volumes, currentBrowsePath)?.path;
    const isLaptop = /book/i.test(macName || 'MacBook');

    return (
      <div className={styles.storage}>
        <div className={styles.macHeader}>
          <M3Shape
            shape="Cookie9Sided"
            size={48}
            color="currentColor"
            className={styles.headerShape}
          >
            <MaterialSymbol
              name={isLaptop ? 'laptop_mac' : 'desktop_mac'}
              size={26}
              fill={1}
              className={styles.headerIcon}
            />
          </M3Shape>
          <div className={styles.headerText}>
            <div className={styles.headerTitle}>{t('This Mac')}</div>
            <div className={styles.headerSubtitle}>
              {macName || t('Local files')}
            </div>
          </div>
        </div>
        {mac.length > 0 && (
          <ul className={styles.volumeList}>
            {mac.map((volume) => this.renderVolume(volume, activePath))}
          </ul>
        )}
        {other.length > 0 && (
          <>
            <h3 className={styles.storageHeadline}>
              <span>{t('Other drives')}</span>
              <span className={styles.sectionBadge}>{other.length}</span>
            </h3>
            <ul className={styles.volumeList}>
              {other.map((volume) => this.renderVolume(volume, activePath))}
            </ul>
          </>
        )}
      </div>
    );
  };

  render() {
    const {
      classes: styles,
      favoriteFolders = [],
      sidebarFavouriteList,
      appLanguage,
      onOpenSettings,
      onRefresh,
      insetForWindowControls,
    } = this.props;

    const { top: sidebarTop, bottom: sidebarBottom } = sidebarFavouriteList;
    const isItalian = appLanguage === 'it';

    const tools = [
      onRefresh && {
        icon: 'refresh',
        label: isItalian ? 'Aggiorna elenco' : 'Refresh list',
        action: onRefresh,
      },
      onOpenSettings && {
        icon: 'tune',
        label: isItalian ? 'Impostazioni' : 'Settings',
        action: onOpenSettings,
      },
    ].filter(Boolean);

    return (
      <nav className={styles.listsWrapper}>
        {insetForWindowControls && (
          <div className={styles.windowControlsInset} />
        )}
        <div className={styles.contentScrollArea}>
          {this.renderStorage()}

          <div className={styles.navContent} onMouseLeave={this.hideHover}>
            <span
              ref={this.hoverRef}
              className={styles.hoverIndicator}
              aria-hidden="true"
            />
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
        </div>

        {/* Footer: a waiting app update, then the app's own card */}
        <div className={styles.footerArea}>
          <AppUpdateCard appLanguage={appLanguage} />
          <div className={styles.footerBlock}>
            <img
              className={styles.footerAppIcon}
              src={imgsrc('app-icon.png')}
              alt=""
            />
            <div className={styles.footerMeta}>
              <span className={styles.footerAppName}>
                {APP_NAME}
                <span
                  className={styles.footerVersion}
                >{`v${APP_VERSION}`}</span>
              </span>
              <span className={styles.footerAppSub}>
                {isItalian ? 'Ottimizzato per macOS' : 'Crafted for macOS'}
              </span>
            </div>
            <GithubBadge appLanguage={appLanguage} />
          </div>
        </div>
      </nav>
    );
  }
}

const mapStateToProps = (state) => ({
  folderAccess: makeFolderAccess(state),
});

export default connect(mapStateToProps)(
  withStyles(styles)(SidebarAreaPaneLists)
);
