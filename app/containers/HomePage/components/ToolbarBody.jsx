import React, { PureComponent, useEffect, useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import {
  faSdCard,
  faBolt,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import SidebarAreaPaneLists from './SidebarAreaPaneLists';
import {
  getAppUpdateStatus,
  hasAppUpdateNews,
  subscribeToAppUpdateStatus,
} from '../../../helpers/appUpdateStatus';
import {
  Confirm as ConfirmDialog,
  Selection as SelectionDialog,
} from '../../../components/DialogBox';
import { DEVICE_TYPE, MTP_MODE } from '../../../enums';
import { capitalize, isEmpty } from '../../../utils/funcs';
import { imgsrc } from '../../../utils/imgsrc';
import { isKalamModeSupported } from '../../../helpers/binaries';
import { getDeviceBrand, translate } from '../../../i18n';
import AnimatedActionIcon from '../../../components/AnimatedActionIcon';
import M3LoadingIndicator from '../../../components/m3/M3LoadingIndicator';
import M3WavyProgress from '../../../components/m3/M3WavyProgress';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import { isTransferPhaseActive } from '../../../helpers/fileTransfer';
import { formatStorageSize, getDiskSpace } from '../../../helpers/diskSpace';
import { getSelectedStorage } from '../actions';

// Free space as a small ring: the filled arc is the used share.
// Android-style badge on the menu button: "1" when a new version of the app
// is waiting in the side menu, a small dot while it downloads.
function UpdateBadge({ styles, label }) {
  const [update, setUpdate] = useState(getAppUpdateStatus);

  useEffect(() => subscribeToAppUpdateStatus(setUpdate), []);

  if (hasAppUpdateNews(update)) {
    return (
      <>
        <span className={styles.updateBadge} aria-hidden="true">
          1
        </span>
        <span className={styles.srOnly}>{label}</span>
      </>
    );
  }

  return update.state === 'downloading' ? (
    <span className={styles.updateDot} aria-hidden="true" />
  ) : null;
}

function StorageRing({ used, className }) {
  const radius = 7;
  const length = 2 * Math.PI * radius;
  const share = Math.min(1, Math.max(0, used));

  return (
    <svg
      viewBox="0 0 20 20"
      width={18}
      height={18}
      className={className}
      aria-hidden="true"
    >
      <circle
        cx={10}
        cy={10}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.24}
        strokeWidth={3}
      />
      <circle
        cx={10}
        cy={10}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${share * length} ${length}`}
        transform="rotate(-90 10 10)"
      />
    </svg>
  );
}

export default class ToolbarAreaPane extends PureComponent {
  activeToolbarList = ({ ...args }) => {
    const {
      toolbarList,
      directoryLists,
      currentBrowsePath,
      deviceType,
      mtpStoragesList,
      mtpDevice,
      mtpMode,
      fileTransferProgress,
    } = args;

    const _directoryLists = directoryLists[deviceType];
    const _currentBrowsePath = currentBrowsePath[deviceType];
    const _activeToolbarList = toolbarList[deviceType];
    const isMtp = deviceType === DEVICE_TYPE.mtp;
    const isMtpTransferActive =
      isMtp && isTransferPhaseActive(fileTransferProgress?.phase);

    let enabled = true;

    if (isMtp) {
      enabled =
        !isMtpTransferActive &&
        (mtpMode !== MTP_MODE.kalam || !mtpDevice.isLoading);
    }

    Object.keys(_activeToolbarList).map((a) => {
      const item = _activeToolbarList[a];

      switch (a) {
        case 'up':
          _activeToolbarList[a] = {
            ...item,
            enabled: _currentBrowsePath !== '/' && enabled,
          };
          break;

        case 'refresh':
          _activeToolbarList[a] = {
            ...item,
            enabled,
          };
          break;

        case 'delete':
          _activeToolbarList[a] = {
            ...item,
            enabled: _directoryLists.queue.selected.length > 0 && enabled,
          };
          break;

        case 'storage':
          _activeToolbarList[a] = {
            ...item,
            enabled:
              Object.keys(mtpStoragesList).length > 0 &&
              isMtp &&
              mtpDevice.isAvailable &&
              enabled,
          };
          break;

        case 'settings':
          _activeToolbarList[a] = {
            ...item,
          };
          break;

        case 'mtpMode':
          _activeToolbarList[a] = {
            ...item,
            enabled: !isMtpTransferActive,
          };
          break;

        case 'photoBackup':
          _activeToolbarList[a] = {
            ...item,
            enabled: isMtp && mtpDevice.isAvailable && enabled,
          };
          break;
        default:
          break;
      }

      return _activeToolbarList;
    });

    return _activeToolbarList;
  };

  render() {
    const {
      directoryLists,
      mtpDevice,
      styles,
      sidebarFavouriteList,
      deviceType,
      showMenu,
      currentBrowsePath,
      mtpStoragesList,
      toggleDeleteConfirmDialog,
      toggleMtpStorageSelectionDialog,
      toggleMtpModeSelectionDialog,
      toolbarList,
      isLoadedDirectoryLists,
      toggleDrawer,
      onDeleteConfirmDialog,
      onMtpStoragesListClick,
      onMtpModeSelectionDialogClick,
      onToggleDrawer,
      onListDirectory,
      onDoubleClickToolBar,
      onToolbarAction,
      showLocalPaneOnLeftSide,
      mtpMode,
      multiSelectMode,
      fileTransferProgress,
      appLanguage,
      favoriteFolders,
      actionCreateSetFavoriteFolder,
    } = this.props;

    const _toolbarList = this.activeToolbarList({
      toolbarList,
      directoryLists,
      currentBrowsePath,
      deviceType,
      mtpStoragesList,
      mtpDevice,
      mtpMode,
      fileTransferProgress,
    });

    let _mtpStoragesList = [];

    if (!isEmpty(mtpStoragesList)) {
      _mtpStoragesList = Object.keys(mtpStoragesList).map((a) => {
        // spread operator is used here to prevent modifying the original object
        const item = { ...mtpStoragesList[a] };

        item.icon = faSdCard;
        item.value = a;

        return item;
      });
    }

    const t = (key, values) => translate(appLanguage, key, values);
    const mtpModeList = [
      {
        value: MTP_MODE.kalam,
        name: t('{mode} mode', { mode: capitalize(MTP_MODE.kalam) }),
        icon: faBolt,
        selected: mtpMode === MTP_MODE.kalam,
        hint: t('Recommended: faster and more reliable.'),
      },
      {
        value: MTP_MODE.legacy,
        name: t('{mode} mode', { mode: capitalize(MTP_MODE.legacy) }),
        icon: faTerminal,
        selected: mtpMode === MTP_MODE.legacy,
        hint: t('Older engine, for compatibility.'),
      },
    ];

    // We have now officially retired the support for `Kalam` Kernel on macOS 10.13 (OS X El High Sierra) and lower. Only the "Legacy" MTP mode will continue working on these outdated machines.
    const showMtpModeSelection = isKalamModeSupported();
    const isMtp = deviceType === DEVICE_TYPE.mtp;
    const deviceInfo = mtpDevice?.info?.mtpDeviceInfo;
    const deviceBrand = getDeviceBrand(deviceInfo?.Manufacturer);
    const deviceModel = deviceInfo?.Model;

    // free and total space of what this pane shows: the phone's selected
    // storage, or the Mac volume of the current folder
    let space = null;

    if (isMtp) {
      const info = getSelectedStorage(mtpStoragesList)?.data?.info;
      const total = parseInt(info?.MaxCapability ?? 0, 10);

      if (mtpDevice.isAvailable && total > 0) {
        space = {
          free: parseInt(info?.FreeSpaceInBytes ?? 0, 10),
          total,
        };
      }
    } else {
      const disk = getDiskSpace(currentBrowsePath[deviceType]);

      if (disk) {
        space = { free: disk.freeBytes, total: disk.totalBytes };
      }
    }

    const spaceLabel =
      space &&
      t('{free} free', { free: formatStorageSize(space.free, appLanguage) });
    const spaceTitle =
      space &&
      t('{free} free of {total}', {
        free: formatStorageSize(space.free, appLanguage),
        total: formatStorageSize(space.total, appLanguage),
      });
    const storageMeter = space && (
      <span className={styles.deviceSpace}>
        <StorageRing
          used={1 - space.free / space.total}
          className={styles.deviceSpaceRing}
        />
        <span className={styles.deviceSpaceText}>{spaceLabel}</span>
      </span>
    );

    // toolbar actions, one container per group
    const actionGroups = [];

    Object.keys(_toolbarList).forEach((key) => {
      const item = _toolbarList[key];
      const last = actionGroups[actionGroups.length - 1];

      if (last && last.group === item.group) {
        last.keys.push(key);
      } else {
        actionGroups.push({ group: item.group, keys: [key] });
      }
    });

    return (
      <div className={styles.root}>
        <ConfirmDialog
          fullWidthDialog
          maxWidthDialog="xs"
          titleText={t('Delete permanently?')}
          bodyText={
            deviceType === DEVICE_TYPE.mtp
              ? t(
                  'The selected items will be deleted from the phone. You can’t undo this.'
                )
              : t(
                  'The selected items will be deleted from this Mac without going to the Trash. You can’t undo this.'
                )
          }
          btnPositiveText={t('Delete')}
          btnNegativeText={t('Cancel')}
          trigger={toggleDeleteConfirmDialog}
          onClickHandler={onDeleteConfirmDialog}
        />
        <SelectionDialog
          titleText={t('Select Storage')}
          list={_mtpStoragesList}
          id="selectionDialog"
          showAvatar
          open={
            deviceType === DEVICE_TYPE.mtp && toggleMtpStorageSelectionDialog
          }
          onClose={onMtpStoragesListClick}
        />

        {showMtpModeSelection && (
          <SelectionDialog
            titleText={t('MTP Mode')}
            list={mtpModeList}
            id="selectionDialog"
            showAvatar
            open={
              deviceType === DEVICE_TYPE.mtp && toggleMtpModeSelectionDialog
            }
            onClose={onMtpModeSelectionDialogClick}
          />
        )}
        <Drawer
          open={toggleDrawer}
          onClose={onToggleDrawer(false)}
          anchor={!showLocalPaneOnLeftSide ? 'right' : 'left'}
          classes={{
            paper: showLocalPaneOnLeftSide
              ? styles.drawerPaper
              : styles.drawerPaperRight,
          }}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={onToggleDrawer(false)}
            onKeyDown={onToggleDrawer(false)}
          />
          <SidebarAreaPaneLists
            onClickHandler={onListDirectory}
            sidebarFavouriteList={sidebarFavouriteList}
            favoriteFolders={favoriteFolders}
            onRemoveFavoriteFolder={(folderPath) =>
              actionCreateSetFavoriteFolder({
                path: folderPath,
                favorite: false,
              })
            }
            deviceType={deviceType}
            currentBrowsePath={currentBrowsePath[deviceType]}
            appLanguage={appLanguage}
            insetForWindowControls={showLocalPaneOnLeftSide}
            onOpenSettings={() => onToolbarAction('settings', false)}
            onRefresh={() => onToolbarAction('refresh', false)}
            onToggleDrawer={onToggleDrawer}
          />
        </Drawer>

        <AppBar position="static" elevation={0} className={styles.appBar}>
          <Toolbar
            className={styles.toolbar}
            disableGutters
            onDoubleClick={(event) => {
              onDoubleClickToolBar(event);
            }}
          >
            {showMenu && (
              <IconButton
                color="inherit"
                disableRipple
                disableFocusRipple
                style={{ outline: 'none' }}
                aria-label={t('Menu')}
                className={`${styles.menuButton} ${styles.noAppDrag}`}
                onClick={onToggleDrawer(true)}
              >
                <AnimatedActionIcon name="menu" />
                <UpdateBadge
                  styles={styles}
                  label={t('A new version of OpenMTP is available')}
                />
              </IconButton>
            )}

            {/* phone status as an M3 tonal button: retry when disconnected,
                storage picker when connected */}
            {isMtp && (
              <Tooltip
                title={
                  // eslint-disable-next-line no-nested-ternary
                  mtpDevice.isAvailable
                    ? spaceTitle
                      ? `${t('Select Storage')} · ${spaceTitle}`
                      : t('Select Storage')
                    : t('Try connection again')
                }
              >
                <button
                  type="button"
                  className={classNames(styles.deviceButton, styles.noAppDrag, {
                    [styles.deviceButtonConnected]: mtpDevice.isAvailable,
                  })}
                  disabled={Boolean(mtpDevice.isLoading)}
                  onClick={() =>
                    onToolbarAction(
                      mtpDevice.isAvailable ? 'storage' : 'refresh',
                      false
                    )
                  }
                >
                  {mtpDevice.isLoading ? (
                    <M3LoadingIndicator
                      size={24}
                      color="currentColor"
                      aria-label={t('Connecting to your phone…')}
                    />
                  ) : (
                    <MaterialSymbol
                      name={mtpDevice.isAvailable ? 'mobile' : 'mobile_off'}
                      size={20}
                      fill={mtpDevice.isAvailable ? 1 : 0}
                      className={styles.deviceButtonIcon}
                    />
                  )}
                  <span className={styles.deviceButtonText}>
                    {mtpDevice.isAvailable && deviceModel ? (
                      <>
                        {deviceBrand && (
                          <span className={styles.deviceBrand}>
                            {deviceBrand}
                          </span>
                        )}
                        <span className={styles.deviceModel}>
                          {deviceModel}
                        </span>
                      </>
                    ) : (
                      <span className={styles.deviceModel}>
                        {mtpDevice.isLoading
                          ? t('Connecting to your phone…')
                          : t('No phone')}
                      </span>
                    )}
                  </span>
                  {storageMeter}
                </button>
              </Tooltip>
            )}

            {/* the Mac side of the same header: volume and free space; it
                opens the side menu like the menu button */}
            {!isMtp && (
              <Tooltip title={spaceTitle || t('Menu')}>
                <button
                  type="button"
                  className={classNames(styles.deviceButton, styles.noAppDrag)}
                  onClick={onToggleDrawer(true)}
                >
                  <MaterialSymbol
                    name="laptop_mac"
                    size={20}
                    className={styles.deviceButtonIcon}
                  />
                  <span className={styles.deviceButtonText}>
                    <span className={styles.deviceModel}>Mac</span>
                  </span>
                  {storageMeter}
                </button>
              </Tooltip>
            )}

            <div className={styles.toolbarInnerWrapper}>
              {actionGroups.map(({ group, keys }) => (
                <div
                  key={group}
                  role="group"
                  className={`${styles.toolbarGroup} ${styles.noAppDrag}`}
                >
                  {keys.map((a) => {
                    const item = _toolbarList[a];
                    const isActive =
                      a === 'multiSelect' && multiSelectMode[deviceType];
                    const itemLabel = t(
                      isActive ? 'Finish selection' : item.label
                    );

                    return (
                      <Tooltip key={a} title={itemLabel}>
                        <div className={styles.navBtns}>
                          <IconButton
                            aria-label={itemLabel}
                            aria-pressed={
                              a === 'multiSelect' ? isActive : undefined
                            }
                            disabled={!item.enabled}
                            disableRipple
                            onClick={() => onToolbarAction(a)}
                            className={classNames({
                              [styles.disabledNavBtns]: !item.enabled,
                              [styles.invertedNavBtns]: item.invert,
                              [styles.imageBtn]: item.image,
                              [styles.activeNavBtn]: isActive,
                            })}
                          >
                            {item.image && (
                              <img
                                alt={item.label}
                                src={imgsrc(item.image, false)}
                                className={styles.navBtnImages}
                              />
                            )}

                            {item.icon && (
                              <AnimatedActionIcon
                                name={item.icon}
                                active={isActive}
                                className={styles.navBtnIcons}
                              />
                            )}
                          </IconButton>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </Toolbar>
        </AppBar>
        <div className={styles.loadingBarSlot}>
          {(isMtp
            ? mtpDevice?.isLoading ||
              (mtpDevice?.isAvailable && !isLoadedDirectoryLists)
            : !isLoadedDirectoryLists) && (
            <div className={styles.loadingBar}>
              <M3WavyProgress indeterminate aria-label={t('Loading…')} />
            </div>
          )}
        </div>
      </div>
    );
  }
}
