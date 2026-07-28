import React, { PureComponent, Fragment } from 'react';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
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
import { LazyLoaderOverlay } from '../styles/ToolbarAreaPane';
import { DEVICES_LABEL } from '../../../constants';
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
import { isTransferPhaseActive } from '../../../helpers/fileTransfer';

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
      appThemeMode,
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

    const RenderLazyLoaderOverlay = LazyLoaderOverlay({ appThemeMode });
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

    const mtpModeList = [
      {
        value: MTP_MODE.kalam,
        name: `${capitalize(MTP_MODE.kalam)} Mode`,
        icon: faBolt,
        selected: mtpMode === MTP_MODE.kalam,
        hint: 'The all new and powerful MTP kernel — named after Dr. A. P. J. Abdul Kalam - Statesman, Scientist and Poet',
      },
      {
        value: MTP_MODE.legacy,
        name: `${capitalize(MTP_MODE.legacy)} Mode`,
        icon: faTerminal,
        selected: mtpMode === MTP_MODE.legacy,
        hint: `Previous generation MTP Kernel. Use this if Kalam mode doesn't detect your phone`,
      },
    ];

    // We have now officially retired the support for `Kalam` Kernel on macOS 10.13 (OS X El High Sierra) and lower. Only the "Legacy" MTP mode will continue working on these outdated machines.
    const showMtpModeSelection = isKalamModeSupported();
    const isMtp = deviceType === DEVICE_TYPE.mtp;
    const deviceInfo = mtpDevice?.info?.mtpDeviceInfo;
    const deviceBrand = getDeviceBrand(deviceInfo?.Manufacturer);
    const deviceModel = deviceInfo?.Model;
    const t = (key, values) => translate(appLanguage, key, values);

    return (
      <div className={styles.root}>
        <ConfirmDialog
          fullWidthDialog
          maxWidthDialog="xs"
          bodyText={`Are you sure you want to permanently delete the items from your ${DEVICES_LABEL[deviceType]}?`}
          trigger={toggleDeleteConfirmDialog}
          onClickHandler={onDeleteConfirmDialog}
        />
        <SelectionDialog
          titleText="Select Storage Option"
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
            titleText="Select MTP Mode"
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
            deviceType={deviceType}
            currentBrowsePath={currentBrowsePath[deviceType]}
            appLanguage={appLanguage}
            mtpMode={mtpMode}
            onOpenSettings={() => onToolbarAction('settings', false)}
            onRefresh={() => onToolbarAction('refresh', false)}
            onSelectStorage={() => onToolbarAction('storage', false)}
            onSelectMtpMode={() => onToolbarAction('mtpMode', false)}
            onToggleDrawer={onToggleDrawer}
          />
        </Drawer>

        {!isLoadedDirectoryLists && <RenderLazyLoaderOverlay />}

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
              </IconButton>
            )}

            {isMtp && (
              <div className={styles.deviceBadge}>
                <PhoneAndroidIcon className={styles.deviceBadgeIcon} />
                <span className={styles.deviceBadgeText}>
                  {mtpDevice.isAvailable && deviceModel ? (
                    <>
                      <span className={styles.deviceBrand}>
                        {deviceBrand || t('Connected')}
                      </span>
                      <span className={styles.deviceModel}>{deviceModel}</span>
                    </>
                  ) : (
                    <span className={styles.deviceModel}>{t('No phone')}</span>
                  )}
                </span>
                <span
                  className={classNames(styles.deviceStatusDot, {
                    [styles.deviceStatusConnected]: mtpDevice.isAvailable,
                  })}
                />
              </div>
            )}

            <div className={styles.toolbarInnerWrapper}>
              {Object.keys(_toolbarList).map((a, index, actionKeys) => {
                const item = _toolbarList[a];
                const previousItem = _toolbarList[actionKeys[index - 1]];
                const startsGroup =
                  index > 0 && previousItem?.group !== item.group;
                const isActive =
                  a === 'multiSelect' && multiSelectMode[deviceType];
                const itemLabel = t(isActive ? 'Finish selection' : item.label);

                return (
                  <Fragment key={a}>
                    {startsGroup && (
                      <span
                        className={styles.toolbarDivider}
                        aria-hidden="true"
                      />
                    )}
                    <Tooltip title={itemLabel}>
                      <div className={`${styles.navBtns} ${styles.noAppDrag}`}>
                        <IconButton
                          aria-label={itemLabel}
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
                  </Fragment>
                );
              })}
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}
