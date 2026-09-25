/* eslint no-case-declarations: off */

import React, { Component, Fragment } from 'react';
import * as path from 'path';
import { ipcRenderer, shell } from 'electron';
import lodashSortBy from 'lodash/sortBy';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  TextFieldEdit as TextFieldEditDialog,
  FileTransferDialog,
  Confirm as ConfirmDialog,
} from '../../../components/DialogBox';
import { withReducer } from '../../../store/reducers/withReducer';
import reducers from '../reducers';
import {
  setSortingDirLists,
  actionSetSelectedDirLists,
  listDirectory,
  churnMtpBuffer,
  churnLocalBuffer,
  initializeMtp,
  getSelectedStorageIdFromState,
  setFileTransferClipboard,
  setFilesDrag,
  clearFilesDrag,
  setFocussedFileExplorerDeviceType,
  clearFileTransferProgress,
  setFileTransferProgress,
  disposeMtp,
  actionSetMtpStatus,
  reloadDirList,
  resetMtpSession,
} from '../actions';
import { getFileCategory } from '../../../helpers/fileExplorerIcons';
import {
  makeDirectoryLists,
  makeCurrentBrowsePath,
  makeMtpDevice,
  makeContextMenuList,
  makeStorageId,
  makeFileTransferClipboard,
  makeFileTransferProgess,
  makeFilesDrag,
  makeFocussedFileExplorerDeviceType,
  makeMultiSelectMode,
} from '../selectors';
import {
  makeAppThemeMode,
  makeEnableStatusBar,
  makeEnableUsbHotplug,
  makeFileExplorerListingType,
  makeHideHiddenFiles,
  makeMtpMode,
  makeShowDirectoriesFirst,
  makeAppLanguage,
} from '../../Settings/selectors';
import {
  DEVICES_LABEL,
  USB_HOTPLUG_MAX_ATTEMPTS,
  USB_HOTPLUG_MAX_ATTEMPTS_TIMEOUT,
} from '../../../constants';
import {
  arrayAverage,
  isArray,
  isEmpty,
  isFloat,
  isInt,
  isNumber,
  removeArrayDuplicates,
  undefinedOrNull,
} from '../../../utils/funcs';
import { getMainWindowRendererProcess } from '../../../helpers/windowHelper';
import { throwAlert } from '../../Alerts/actions';
import { imgsrc } from '../../../utils/imgsrc';
import FileExplorerBodyRender from './FileExplorerBodyRender';
import { baseName, pathInfo, pathUp, sanitizePath } from '../../../utils/files';
import {
  DEVICE_TYPE,
  FILE_EXPLORER_VIEW_TYPE,
  FILE_TRANSFER_DIRECTION,
  MTP_MODE,
  USB_HOTPLUG_EVENTS,
} from '../../../enums';
import { log } from '../../../utils/log';
import fileExplorerController from '../../../data/file-explorer/controllers/FileExplorerController';
import { checkIf } from '../../../utils/checkIf';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';
import { fileExistsSync } from '../../../helpers/fileOps';
import { getRemoteWindow } from '../../../helpers/remoteWindowHelpers';
import { IpcEvents } from '../../../services/ipc-events/IpcEventType';
import { translate } from '../../../i18n';
import { processMtpBuffer } from '../../../helpers/processBufferOutput';
import { MTP_ERROR } from '../../../enums/mtpError';
import {
  createTransferSessionId,
  FILE_TRANSFER_PHASE,
  isFatalMtpTransportError,
  isTransferPhaseActive,
  isTransferPhaseTerminal,
  normalizeTransferError,
} from '../../../helpers/fileTransfer';
import { logTransferEvent } from '../../../helpers/fileTransferLogger';
import { isSameUsbDevice } from '../../../helpers/deviceInfo';

const remote = getRemoteWindow();
const { Menu, getCurrentWindow } = remote;

let allowFileDropFlag = false;
const activeTransferSessions = new Set();

class FileExplorer extends Component {
  constructor(props) {
    super(props);

    this.mainWindowRendererProcess = getMainWindowRendererProcess();
    this.filesDragGhostImg = this._createDragIcon();

    this.initialState = {
      togglePasteConfirmDialog: false,
      toggleDialog: {
        rename: {
          errors: {
            toggle: false,
            message: null,
          },
          toggle: false,
          data: {},
        },
        newFolder: {
          errors: {
            toggle: false,
            message: null,
          },
          toggle: false,
          data: {},
        },
      },
      directoryGeneratedTime: Date.now(),
    };

    this.state = {
      ...this.initialState,
    };

    this.electronMenu = new Menu();

    this.keyedAcceleratorList = {
      shift: false,
      meta: false,
    };

    this.selectionAnchor = {
      [DEVICE_TYPE.local]: null,
      [DEVICE_TYPE.mtp]: null,
    };
    this.selectionCursor = {
      [DEVICE_TYPE.local]: null,
      [DEVICE_TYPE.mtp]: null,
    };
    this.pendingTransferSession = null;

    this.tableSortCache = null;
    this.nodeIndexCache = null;
    this._boundAcceleratorKeyDown = this._handleAccelerator.bind(this, true);
    this._boundAcceleratorKeyUp = this._handleAccelerator.bind(this, false);
    this._boundMouseNavigation = this._handleMouseNavigation.bind(this);

    this.navigationHistory = {
      [DEVICE_TYPE.local]: { back: [], forward: [] },
      [DEVICE_TYPE.mtp]: { back: [], forward: [] },
    };

    this.usbHotplug = {
      attempts: 0,
      lastAttempted: Date.now(),
    };
  }

  componentDidMount() {
    const {
      currentBrowsePath,
      deviceType,
      actionCreateInitializeMtp,
      hideHiddenFiles,
    } = this.props;

    if (deviceType === DEVICE_TYPE.mtp) {
      actionCreateInitializeMtp({
        filePath: currentBrowsePath[deviceType],
        ignoreHidden: hideHiddenFiles[deviceType],
        deviceType,
      });
    } else {
      this._handleListDirectory({
        path: currentBrowsePath[deviceType],
        deviceType,
      });
    }

    this.registerAccelerators();
    this.registerAppUpdate();
    this.registerGenerateErrorReport();
    this.registerUsbHotplug();
  }

  componentWillReceiveProps({
    directoryLists: nextDirectoryLists,
    showDirectoriesFirst: nextShowDirectoriesFirst,
  }) {
    const { deviceType, directoryLists, showDirectoriesFirst } = this.props;

    const { nodes: prevDirectoryNodes } = directoryLists[deviceType];
    const { nodes: nextDirectoryNodes } = nextDirectoryLists[deviceType];

    if (nextDirectoryNodes !== prevDirectoryNodes) {
      this._handleDirectoryGeneratedTime();
    }

    if (nextShowDirectoriesFirst !== showDirectoriesFirst) {
      this._handleDirectoryGeneratedTime();
    }
  }

  componentWillUnmount() {
    const { actionCreatedDisposeMtp, deviceType } = this.props;

    this.deregisterAccelerators();

    ipcRenderer.removeListener(
      'isFileTransferActiveSeek',
      this._handleFileTransferActiveSeek
    );

    if (deviceType === DEVICE_TYPE.mtp) {
      ipcRenderer.removeListener(
        IpcEvents.REPORT_BUGS_DISPOSE_MTP,
        this._reportBugsDisposeMtpEvent
      );
      ipcRenderer.removeListener(
        IpcEvents.USB_HOTPLUG,
        this._handleUsbHotplugEvent
      );
    }

    actionCreatedDisposeMtp({ deviceType });
  }

  registerAccelerators = () => {
    document.addEventListener('keydown', this._boundAcceleratorKeyDown);
    document.addEventListener('keyup', this._boundAcceleratorKeyUp);
    window.addEventListener('mouseup', this._boundMouseNavigation);
    window.addEventListener('auxclick', this._boundMouseNavigation);
  };

  deregisterAccelerators = () => {
    document.removeEventListener('keydown', this._boundAcceleratorKeyDown);
    document.removeEventListener('keyup', this._boundAcceleratorKeyUp);
    window.removeEventListener('mouseup', this._boundMouseNavigation);
    window.removeEventListener('auxclick', this._boundMouseNavigation);
  };

  _handleMouseNavigation = (event) => {
    const { currentBrowsePath, deviceType, focussedFileExplorerDeviceType } =
      this.props;
    const activeDeviceType =
      focussedFileExplorerDeviceType?.value || deviceType;

    // Mouse Button 3 = Back (X1 side button)
    // Mouse Button 4 = Forward (X2 side button)
    if (event && (event.button === 3 || event.button === 4)) {
      event.preventDefault();
      event.stopPropagation();

      if (!this.navigationHistory) {
        this.navigationHistory = {
          [DEVICE_TYPE.local]: { back: [], forward: [] },
          [DEVICE_TYPE.mtp]: { back: [], forward: [] },
        };
      }

      const history = this.navigationHistory[activeDeviceType];
      const currentPath = currentBrowsePath[activeDeviceType];

      if (event.button === 3) {
        // Navigate Back
        if (history && history.back.length > 0) {
          const previousPath = history.back.pop();

          if (currentPath) {
            history.forward.push(currentPath);
          }

          this._handleListDirectory(
            { path: previousPath, deviceType: activeDeviceType },
            true
          );
        } else if (currentPath && currentPath !== '/') {
          const parentPath = pathUp(currentPath);

          this._handleListDirectory(
            { path: parentPath, deviceType: activeDeviceType },
            true
          );
        }
      } else if (event.button === 4) {
        // Navigate Forward
        if (history && history.forward.length > 0) {
          const nextPath = history.forward.pop();

          if (currentPath) {
            history.back.push(currentPath);
          }

          this._handleListDirectory(
            { path: nextPath, deviceType: activeDeviceType },
            true
          );
        }
      }
    }
  };

  _handleFileTransferActiveSeek = (event, { ...args }) => {
    const { check: checkIsFileTransferActiveSeek } = args;

    if (!checkIsFileTransferActiveSeek) {
      return null;
    }

    const { fileTransferProgess } = this.props;
    const { toggle: isActiveFileTransferProgess } = fileTransferProgess;

    ipcRenderer.send('isFileTransferActiveReply', {
      isActive: isActiveFileTransferProgess,
    });

    return null;
  };

  registerAppUpdate = () => {
    const { deviceType } = this.props;

    /**
     * check whether an active file trasnfer window is available.
     * This is to prevent race between file transfer and app update taskbar progressbar access
     */

    if (deviceType === DEVICE_TYPE.local) {
      ipcRenderer.on(
        'isFileTransferActiveSeek',
        this._handleFileTransferActiveSeek
      );
    }
  };

  registerGenerateErrorReport = () => {
    const { deviceType } = this.props;

    if (deviceType === DEVICE_TYPE.mtp) {
      ipcRenderer.on(
        IpcEvents.REPORT_BUGS_DISPOSE_MTP,
        this._reportBugsDisposeMtpEvent
      );
    }
  };

  registerUsbHotplug = () => {
    const { deviceType } = this.props;

    if (deviceType === DEVICE_TYPE.mtp) {
      ipcRenderer.on(IpcEvents.USB_HOTPLUG, this._handleUsbHotplugEvent);
    }
  };

  _reportBugsDisposeMtpEvent = async (_, { logFileZippedPath }) => {
    const { fileTransferProgess } = this.props;

    if (isTransferPhaseActive(fileTransferProgess.phase)) {
      ipcRenderer.send(IpcEvents.REPORT_BUGS_DISPOSE_MTP_REPLY, {
        error: MTP_ERROR.ErrorMtpLockExists,
      });

      return;
    }

    // dispose the mtp before generating the report
    await fileExplorerController.dispose({ deviceType: DEVICE_TYPE.mtp });

    await fileExplorerController.fetchDebugReport({
      deviceType: DEVICE_TYPE.mtp,
    });

    const { error } = await fileExplorerController.deleteFiles({
      deviceType: DEVICE_TYPE.local,
      fileList: [logFileZippedPath],
      storageId: null,
    });

    ipcRenderer.send(IpcEvents.REPORT_BUGS_DISPOSE_MTP_REPLY, { error });
  };

  _handleUsbHotplugEvent = async (_, { device, eventName }) => {
    const {
      mtpDevice,
      actionCreateReloadDirList,
      actionCreateResetMtpSession,
      currentBrowsePath,
      deviceType,
      fileTransferProgess,
      hideHiddenFiles,
      enableUsbHotplug,
      mtpMode,
    } = this.props;

    checkIf(device, 'string');
    checkIf(eventName, 'inObjectValues', USB_HOTPLUG_EVENTS);
    checkIf(mtpMode, 'inObjectValues', MTP_MODE);

    checkIf(actionCreateReloadDirList, 'function');
    checkIf(currentBrowsePath, 'object');
    checkIf(deviceType, 'inObjectValues', DEVICE_TYPE);
    checkIf(hideHiddenFiles, 'object');

    try {
      if (isEmpty(device) || isEmpty(eventName)) {
        return;
      }

      const _usbDeviceInfo = JSON.parse(device);

      analyticsService.sendEvent(EVENT_TYPE.MTP_USB_HOTPLUG_RECEIVED, {
        manufacturer: _usbDeviceInfo.manufacturer,
        deviceName: _usbDeviceInfo.deviceName,
        productId: _usbDeviceInfo.productId,
        vendorId: _usbDeviceInfo.vendorId,
        eventName,
      });

      if (eventName === USB_HOTPLUG_EVENTS.detach) {
        const connectedUsbDevice = mtpDevice?.info?.usbDeviceInfo ?? {};

        if (
          mtpDevice.isAvailable &&
          isSameUsbDevice(_usbDeviceInfo, connectedUsbDevice)
        ) {
          analyticsService.sendEvent(EVENT_TYPE.MTP_USB_HOTPLUG_DETTACHED, {
            manufacturer: _usbDeviceInfo.manufacturer,
            deviceName: _usbDeviceInfo.deviceName,
            productId: _usbDeviceInfo.productId,
            vendorId: _usbDeviceInfo.vendorId,
            eventName,
          });

          const wasTransferActive = isTransferPhaseActive(
            fileTransferProgess?.phase
          );

          actionCreateResetMtpSession({
            errorMessage: wasTransferActive
              ? 'The USB connection was interrupted. Unlock and reconnect the phone, then try again. The transfer queue has been preserved.'
              : null,
          });

          if (!wasTransferActive) {
            fileExplorerController
              .dispose({ deviceType: DEVICE_TYPE.mtp })
              .catch((error) =>
                log.error(error, 'FileExplorer._handleUsbHotplugEvent.dispose')
              );
          }
        }

        return;
      }

      // Automatic connection is available only for Kalam. Detach handling
      // above always runs so stale device contents can never remain visible.
      if (mtpMode !== MTP_MODE.kalam || !enableUsbHotplug) {
        return;
      }

      // if [this.usbHotplug] is null then set the object
      if (!this.usbHotplug) {
        this.usbHotplug = {
          attempts: 1,
          lastAttempted: Date.now(),
        };
      } else {
        // if the last attempt to connect the device was made more than [USB_HOTPLUG_MAX_ATTEMPTS_TIMEOUT] milliseconds ago then reset the attempts counter
        if (
          Date.now() - this.usbHotplug.lastAttempted >=
          USB_HOTPLUG_MAX_ATTEMPTS_TIMEOUT
        ) {
          this.usbHotplug = {
            // update the number of attempts
            attempts: 0,
            lastAttempted: Date.now(),
          };
        }

        // check for the number of connect attempts
        // if the number of connect attempts are greater than [USB_HOTPLUG_MAX_ATTEMPTS]
        // and if the [lastAttempted] and was made within [USB_HOTPLUG_MAX_ATTEMPTS_TIMEOUT] then don't connect
        else if (
          this.usbHotplug.attempts > USB_HOTPLUG_MAX_ATTEMPTS &&
          Date.now() - this.usbHotplug.lastAttempted <
            USB_HOTPLUG_MAX_ATTEMPTS_TIMEOUT
        ) {
          return;
        }

        // update the number of attempts
        this.usbHotplug.attempts += 1;
      }

      switch (eventName) {
        case USB_HOTPLUG_EVENTS.attach:
        default:
          // if an usb device was attached and mtp device is connected then
          // try to connect the mtp device
          if (!mtpDevice.isAvailable) {
            analyticsService.sendEvent(EVENT_TYPE.MTP_USB_HOTPLUG_ATTACHED, {
              manufacturer: _usbDeviceInfo.manufacturer,
              deviceName: _usbDeviceInfo.deviceName,
              productId: _usbDeviceInfo.productId,
              vendorId: _usbDeviceInfo.vendorId,
              eventName,
            });

            actionCreateReloadDirList({
              filePath: currentBrowsePath[deviceType],
              ignoreHidden: hideHiddenFiles[deviceType],
              deviceType,
            });
          }

          break;
      }
    } catch (e) {
      log.error(e, 'FileExplorer._handleUsbHotplugEvent');
    }
  };

  _handleAccelerator = (pressed, event) => {
    if (undefinedOrNull(event)) {
      return;
    }

    switch (event.key) {
      case 'Shift':
      case 'shift':
        this.keyedAcceleratorList = {
          ...this.keyedAcceleratorList,
          shift: pressed,
        };
        break;
      case 'Meta':
      case 'meta':
        this.keyedAcceleratorList = {
          ...this.keyedAcceleratorList,
          meta: pressed,
        };
        break;
      default:
        break;
    }
  };

  _handleListDirectory({ ...args }, isHistoryNavigation = false) {
    const { actionCreateListDirectory, hideHiddenFiles, currentBrowsePath } =
      this.props;
    const { path, deviceType } = args;

    const currentPath = currentBrowsePath[deviceType];

    if (!isHistoryNavigation && currentPath && currentPath !== path) {
      if (!this.navigationHistory) {
        this.navigationHistory = {
          [DEVICE_TYPE.local]: { back: [], forward: [] },
          [DEVICE_TYPE.mtp]: { back: [], forward: [] },
        };
      }

      const history = this.navigationHistory[deviceType];

      if (history) {
        history.back.push(currentPath);
        history.forward = [];
      }
    }

    actionCreateListDirectory(
      {
        filePath: path,
        ignoreHidden: hideHiddenFiles[deviceType],
      },
      deviceType
    );
  }

  _handleTryConnection = () => {
    const {
      actionCreateReloadDirList,
      currentBrowsePath,
      hideHiddenFiles,
      deviceType,
    } = this.props;

    actionCreateReloadDirList({
      filePath: currentBrowsePath[deviceType],
      ignoreHidden: hideHiddenFiles[deviceType],
      deviceType,
    });
  };

  lastSelectedNode = (nodes, selected) => {
    if (
      undefinedOrNull(selected) ||
      !isArray(selected) ||
      selected.length < 1
    ) {
      return { index: -1, item: [] };
    }

    if (!this.nodeIndexCache || this.nodeIndexCache.nodes !== nodes) {
      const indexByPath = new Map();

      nodes.forEach((item, index) => {
        indexByPath.set(item.path, { index, item });
      });

      this.nodeIndexCache = { nodes, indexByPath };
    }

    const match = this.nodeIndexCache.indexByPath.get(
      selected[selected.length - 1]
    );

    return {
      index: match?.index ?? -1,
      item: match?.item ?? [],
    };
  };

  /* activate actions using keyboard */
  _handleAcceleratorActivation = ({ type, data }) => {
    const { focussedFileExplorerDeviceType } = this.props;
    const {
      mtpDevice,
      directoryLists,
      actionCreateCopy,
      fileTransferClipboard,
      currentBrowsePath,
      fileExplorerListingType,
      actionCreateTableClick,
    } = this.props;
    const { tableData, deviceType, event } = data;
    const interactionDirectoryList =
      tableData?.directoryLists || directoryLists[deviceType];
    const { nodes, order, orderBy } = interactionDirectoryList;
    const { queue } = directoryLists[deviceType];

    // eslint-disable-next-line prefer-destructuring
    const selected = queue.selected;
    const _currentBrowsePath = currentBrowsePath[deviceType];
    const _focussedFileExplorerDeviceType =
      focussedFileExplorerDeviceType.value;
    const _lastSelectedNode = this.lastSelectedNode(nodes, selected);

    let _tableSort = [];
    let nextPathToNavigate = {};

    if (_focussedFileExplorerDeviceType !== deviceType) {
      return null;
    }

    if (
      _focussedFileExplorerDeviceType === DEVICE_TYPE.mtp &&
      !mtpDevice.isAvailable &&
      type !== 'refresh'
    ) {
      return null;
    }

    const deviceTypeUpperCase = deviceType.toUpperCase();

    switch (type) {
      case 'navigationLeft':
      case 'navigationRight':
      case 'navigationUp':
      case 'navigationDown':
      case 'multipleSelectLeft':
      case 'multipleSelectUp':
      case 'multipleSelectRight':
      case 'multipleSelectDown':
        _tableSort = this.tableSort({
          nodes,
          order,
          orderBy,
        });

        break;

      default:
        break;
    }

    switch (type) {
      case 'newFolder':
        this._handleToggleDialogBox(
          { toggle: true, data: { ...tableData } },
          type
        );
        break;

      case 'copy':
        if (selected.length < 1) {
          break;
        }

        analyticsService.sendEvent(
          EVENT_TYPE[`${deviceTypeUpperCase}_COPY_FILES`],
          {}
        );

        actionCreateCopy({
          selected,
          deviceType,
        });
        break;

      case 'copyToQueue':
        if (selected.length < 1) {
          break;
        }

        analyticsService.sendEvent(
          EVENT_TYPE[`${deviceTypeUpperCase}_COPY_TO_QUEUE_FILES`],
          {}
        );

        actionCreateCopy({
          selected,
          deviceType,
          toQueue: true,
        });
        break;

      case 'paste':
        if (
          fileTransferClipboard.queue.length < 1 ||
          fileTransferClipboard.source === deviceType
        ) {
          break;
        }

        this._handlePaste();
        break;

      case 'delete':
        if (selected.length < 1) {
          break;
        }

        this.mainWindowRendererProcess.webContents.send(
          'fileExplorerToolbarActionCommunication',
          {
            type,
            deviceType: _focussedFileExplorerDeviceType,
          }
        );
        break;

      case 'refresh':
        this.mainWindowRendererProcess.webContents.send(
          'fileExplorerToolbarActionCommunication',
          {
            type,
            deviceType: _focussedFileExplorerDeviceType,
          }
        );
        break;

      case 'up':
        if (_currentBrowsePath === '/') {
          break;
        }

        this.mainWindowRendererProcess.webContents.send(
          'fileExplorerToolbarActionCommunication',
          {
            type,
            deviceType: _focussedFileExplorerDeviceType,
          }
        );
        break;

      case 'selectAll':
        this._handleSelectAllClick(deviceType, null, nodes);
        break;

      case 'rename':
        if (selected.length !== 1) {
          break;
        }

        this._handleToggleDialogBox(
          { toggle: true, data: { ..._lastSelectedNode.item } },
          'rename'
        );
        break;

      case 'open':
        if (selected.length !== 1) {
          break;
        }

        this._handleTableDoubleClick(_lastSelectedNode.item, deviceType);
        break;

      case 'navigationLeft':
      case 'navigationRight':
      case 'navigationUp':
      case 'navigationDown':
        if (nodes.length < 1) {
          break;
        }

        if (
          fileExplorerListingType[deviceType] ===
            FILE_EXPLORER_VIEW_TYPE.list &&
          (type === 'navigationLeft' || type === 'navigationRight')
        ) {
          break;
        }

        {
          const isGrid =
            fileExplorerListingType[deviceType] ===
            FILE_EXPLORER_VIEW_TYPE.grid;
          const gridElement = document.querySelector(
            `[data-file-explorer-grid="${deviceType}"]`
          );
          const columns = isGrid
            ? Math.max(1, Math.floor((gridElement?.clientWidth || 118) / 118))
            : 1;
          const deltaByType = {
            navigationLeft: -1,
            navigationRight: 1,
            navigationUp: -columns,
            navigationDown: columns,
          };
          const currentPath =
            this.selectionCursor[deviceType] || selected[selected.length - 1];
          const delta = deltaByType[type];
          const currentIndex = currentPath
            ? this.tableSortCache.indexByPath.get(currentPath) ?? 0
            : delta > 0
            ? -delta
            : 0;
          const nextIndex = Math.max(
            0,
            Math.min(_tableSort.length - 1, currentIndex + delta)
          );

          nextPathToNavigate = _tableSort[nextIndex];
        }

        if (undefinedOrNull(nextPathToNavigate)) {
          break;
        }

        this.selectionCursor[deviceType] = nextPathToNavigate.path;
        this._handleTableClick(
          nextPathToNavigate.path,
          deviceType,
          event,
          'replace'
        );
        break;

      case 'multipleSelectLeft':
      case 'multipleSelectRight':
      case 'multipleSelectUp':
      case 'multipleSelectDown':
        if (nodes.length < 1) {
          break;
        }

        if (
          fileExplorerListingType[deviceType] ===
            FILE_EXPLORER_VIEW_TYPE.list &&
          (type === 'multipleSelectLeft' || type === 'multipleSelectRight')
        ) {
          break;
        }

        {
          const isGrid =
            fileExplorerListingType[deviceType] ===
            FILE_EXPLORER_VIEW_TYPE.grid;
          const gridElement = document.querySelector(
            `[data-file-explorer-grid="${deviceType}"]`
          );
          const columns = isGrid
            ? Math.max(1, Math.floor((gridElement?.clientWidth || 118) / 118))
            : 1;
          const deltaByType = {
            multipleSelectLeft: -1,
            multipleSelectRight: 1,
            multipleSelectUp: -columns,
            multipleSelectDown: columns,
          };
          const anchorPath =
            this.selectionAnchor[deviceType] ||
            selected[0] ||
            _tableSort[0].path;
          const cursorPath =
            this.selectionCursor[deviceType] ||
            selected[selected.length - 1] ||
            anchorPath;
          const anchorIndex =
            this.tableSortCache.indexByPath.get(anchorPath) ?? 0;
          const cursorIndex =
            this.tableSortCache.indexByPath.get(cursorPath) ?? anchorIndex;
          const nextIndex = Math.max(
            0,
            Math.min(_tableSort.length - 1, cursorIndex + deltaByType[type])
          );
          const rangeStart = Math.min(anchorIndex, nextIndex);
          const rangeEnd = Math.max(anchorIndex, nextIndex);
          const newSelected = _tableSort
            .slice(rangeStart, rangeEnd + 1)
            .map((item) => item.path);

          this.selectionAnchor[deviceType] = anchorPath;
          this.selectionCursor[deviceType] = _tableSort[nextIndex].path;
          actionCreateTableClick({ selected: newSelected }, deviceType);
        }

        break;

      default:
        break;
    }
  };

  _handleFocussedFileExplorerDeviceType = (toggle, deviceType) => {
    const {
      actionCreateFocussedFileExplorerDeviceType,
      focussedFileExplorerDeviceType,
    } = this.props;

    if (focussedFileExplorerDeviceType.value === deviceType) {
      return null;
    }

    let _focussedFileExplorerDeviceType = {};

    if (toggle) {
      _focussedFileExplorerDeviceType = {
        accelerator: deviceType,
        value: deviceType,
      };
    } else {
      _focussedFileExplorerDeviceType = {
        onClick: deviceType,
        value: deviceType,
      };
    }

    actionCreateFocussedFileExplorerDeviceType({
      ..._focussedFileExplorerDeviceType,
    });
  };

  fireElectronMenu(menuItems) {
    this.electronMenu = Menu.buildFromTemplate(menuItems);
    this.electronMenu.popup(remote.getCurrentWindow());
  }

  _handleContextMenuClick = (
    event,
    { ...rowData },
    { ...tableData },
    _target
  ) => {
    const { deviceType, mtpDevice, fileExplorerListingType } = this.props;
    const allowContextMenuClickThrough =
      fileExplorerListingType[deviceType] === FILE_EXPLORER_VIEW_TYPE.grid &&
      !undefinedOrNull(rowData) &&
      Object.keys(rowData).length < 1;

    if (deviceType === DEVICE_TYPE.mtp && !mtpDevice.isAvailable) {
      return null;
    }

    if (event.type === 'contextmenu') {
      if (
        _target === 'tableWrapperTarget' &&
        event.target !== event.currentTarget &&
        !allowContextMenuClickThrough
      ) {
        return null;
      }

      const contextMenuActiveList = this.activeContextMenuList(
        deviceType,
        { ...rowData },
        { ...tableData }
      );

      this.fireElectronMenu(contextMenuActiveList);

      return null;
    }
  };

  activeContextMenuList(deviceType, { ...rowData }, { ...tableData }) {
    const {
      contextMenuList,
      fileTransferClipboard,
      directoryLists,
      appLanguage,
    } = this.props;
    const { queue } = directoryLists[deviceType];
    const _contextMenuList = contextMenuList[deviceType];
    const contextMenuActiveList = [];

    Object.keys(_contextMenuList).map((a) => {
      const item = _contextMenuList[a];

      switch (a) {
        case 'rename':
          contextMenuActiveList.push({
            label: translate(appLanguage, item.label),
            enabled: Object.keys(rowData).length > 0,
            data: rowData,
            click: () => {
              this._handleContextMenuListActions({
                [a]: {
                  ...item,
                  data: rowData,
                },
              });
            },
          });
          break;

        case 'copy':
        case 'copyToQueue':
          contextMenuActiveList.push({
            label: translate(appLanguage, item.label),
            enabled: queue.selected.length > 0,
            click: () => {
              this._handleContextMenuListActions({
                [a]: {
                  ...item,
                  data: {},
                },
              });
            },
          });
          break;

        case 'paste':
          contextMenuActiveList.push({
            label: translate(appLanguage, item.label),
            enabled:
              fileTransferClipboard.queue.length > 0 &&
              fileTransferClipboard.source !== deviceType,
            click: () => {
              this._handleContextMenuListActions({
                [a]: {
                  ...item,
                  data: {},
                },
              });
            },
          });

          break;

        case 'newFolder':
          contextMenuActiveList.push({
            label: translate(appLanguage, item.label),
            data: tableData,
            click: () => {
              this._handleContextMenuListActions({
                [a]: {
                  ...item,
                  data: tableData,
                },
              });
            },
          });

          break;
        case 'showInEnclosingFolder':
          contextMenuActiveList.push({
            label: translate(appLanguage, item.label),
            enabled: Object.keys(rowData).length > 0,
            data: rowData,
            click: () => {
              this._handleContextMenuListActions({
                [a]: {
                  ...item,
                  data: rowData,
                },
              });
            },
          });

          break;
        default:
          break;
      }

      return contextMenuActiveList;
    });

    return contextMenuActiveList;
  }

  /* activate actions using mouse */
  _handleContextMenuListActions = ({ ...args }) => {
    const { deviceType, directoryLists, actionCreateCopy } = this.props;
    const deviceTypeUpperCase = deviceType.toUpperCase();

    Object.keys(args).map((a) => {
      const item = args[a];

      switch (a) {
        case 'rename':
          this._handleToggleDialogBox(
            {
              toggle: true,
              data: {
                ...item.data,
              },
            },
            'rename'
          );
          break;

        case 'copy':
          // eslint-disable-next-line prefer-destructuring
          const selectedItemsToCopy = directoryLists[deviceType].queue.selected;

          actionCreateCopy({ selected: selectedItemsToCopy, deviceType });

          analyticsService.sendEvent(
            EVENT_TYPE[`${deviceTypeUpperCase}_COPY_FILES`],
            {}
          );

          break;

        case 'copyToQueue':
          // eslint-disable-next-line prefer-destructuring
          const selectedItemsToCopyToQueue =
            directoryLists[deviceType].queue.selected;

          actionCreateCopy({
            selected: selectedItemsToCopyToQueue,
            deviceType,
            toQueue: true,
          });

          analyticsService.sendEvent(
            EVENT_TYPE[`${deviceTypeUpperCase}_COPY_TO_QUEUE_FILES`],
            {}
          );

          break;

        case 'paste':
          this._handlePaste();
          break;

        case 'newFolder':
          this._handleToggleDialogBox(
            {
              toggle: true,
              data: {
                ...item.data,
              },
            },
            'newFolder'
          );
          break;

        case 'showInEnclosingFolder':
          this._handleShowInEnclosingFolder({ ...item });

          break;

        case 'cancel':
          break;

        default:
          break;
      }

      return a;
    });
  };

  _handleToggleDialogBox = ({ ...args }, targetAction) => {
    const { toggleDialog } = this.state;

    this.setState({
      toggleDialog: {
        ...toggleDialog,
        [targetAction]: {
          ...toggleDialog[targetAction],
          ...args,
        },
      },
    });
  };

  _handleClearEditDialog = (targetAction) => {
    const { toggleDialog } = this.state;

    this.setState({
      toggleDialog: {
        ...toggleDialog,
        [targetAction]: {
          ...this.initialState.toggleDialog[targetAction],
        },
      },
    });
  };

  _handleRenameEditDialog = async ({ ...args }) => {
    const {
      deviceType,
      actionCreateRenameFile,
      hideHiddenFiles,
      currentBrowsePath,
      storageId,
      fileTransferProgess,
    } = this.props;

    // eslint-disable-next-line react/destructuring-assignment
    const { data } = this.state.toggleDialog.rename;
    const { confirm, textFieldValue: newFilename } = args;
    const targetAction = 'rename';
    const deviceTypeUpperCase = deviceType.toUpperCase();

    if (
      deviceType === DEVICE_TYPE.mtp &&
      isTransferPhaseActive(fileTransferProgess.phase)
    ) {
      return null;
    }

    analyticsService.sendEvent(
      EVENT_TYPE[`${deviceTypeUpperCase}_RENAME_STARTED`],
      {}
    );

    if (!confirm || newFilename === null) {
      this._handleClearEditDialog(targetAction);

      analyticsService.sendEvent(
        EVENT_TYPE[`${deviceTypeUpperCase}_RENAME_EXIT`],
        {
          Reason: 'EXIT',
        }
      );

      return null;
    }

    if (newFilename.trim() === '' || /[/\\?%*:|"<>]/g.test(newFilename)) {
      this._handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: Illegal characters.`,
        },
        targetAction
      );

      analyticsService.sendEvent(
        EVENT_TYPE[`${deviceTypeUpperCase}_RENAME_EXIT`],
        {
          Reason: 'ILLEGAL_CHARACTERS',
        }
      );

      return null;
    }

    const sanitizedNewFilename = sanitizePath(newFilename);
    const filePath = data.path;
    const filename = data.name;

    const newFilepath = path.join(pathUp(filePath), sanitizedNewFilename);

    if (newFilepath === data.path) {
      this._handleClearEditDialog(targetAction);

      analyticsService.sendEvent(
        EVENT_TYPE[`${deviceTypeUpperCase}_RENAME_EXIT`],
        {
          Reason: 'NO_CHANGE',
        }
      );

      return null;
    }

    // if the new filename and the existing filename are just case different then skip the edit dialog
    if (sanitizedNewFilename.toLowerCase() !== filename.toLowerCase()) {
      if (
        await fileExplorerController.filesExist({
          deviceType,
          fileList: [newFilepath],
          storageId,
        })
      ) {
        this._handleErrorsEditDialog(
          {
            toggle: true,
            message: `Error: The name "${sanitizedNewFilename}" is already taken.`,
          },
          targetAction
        );

        analyticsService.sendEvent(
          EVENT_TYPE[`${deviceTypeUpperCase}_RENAME_EXIT`],
          {
            Reason: 'FILE_EXISTS',
          }
        );

        return null;
      }
    }

    actionCreateRenameFile(
      {
        filePath,
        newFilename: sanitizedNewFilename,
        deviceType,
      },
      {
        filePath: currentBrowsePath[deviceType],
        ignoreHidden: hideHiddenFiles[deviceType],
      }
    );

    this._handleClearEditDialog(targetAction);
  };

  _handleErrorsEditDialog = ({ ...args }, targetAction) => {
    const { toggleDialog } = this.state;

    this.setState({
      toggleDialog: {
        ...toggleDialog,
        [targetAction]: {
          ...toggleDialog[targetAction],
          errors: { ...args },
        },
      },
    });
  };

  _handleTogglePasteConfirmDialog = (status) => {
    this.setState({
      togglePasteConfirmDialog: status,
    });
  };

  _handleShowInEnclosingFolder = async ({ data, enabled, label }) => {
    checkIf(data, 'object');
    checkIf(enabled, 'boolean');
    checkIf(label, 'string');

    try {
      const filePath = data?.path;

      if (isEmpty(filePath)) {
        return;
      }

      if (!fileExistsSync(filePath)) {
        return;
      }

      shell.showItemInFolder(filePath);
    } catch (e) {
      log.error(e, 'FileExplorer._handleShowInEnclosingFolder');
    }
  };

  _createDragIcon() {
    const dragIcon = document.createElement('img');

    dragIcon.src = imgsrc(`FileExplorer/files-archive.svg`);
    dragIcon.style.width = '100px';

    const div = document.createElement('div');

    div.appendChild(dragIcon);
    div.style.position = 'absolute';
    div.style.top = '0px';
    div.style.left = '-500px';
    document.querySelector('body').appendChild(div);

    return div;
  }

  _handleFilesDragStart = (e, { sourceDeviceType }) => {
    const sourceDeviceTypeUpperCase = sourceDeviceType?.toUpperCase();

    this._handleSetFilesDrag({
      sourceDeviceType,
      destinationDeviceType: null,
      enter: false,
      lock: false,
    });

    analyticsService.sendEvent(
      EVENT_TYPE[`${sourceDeviceTypeUpperCase}_DRAG_FILES_STARTED`],
      {}
    );

    e.dataTransfer.setDragImage(this.filesDragGhostImg, 0, 0);
  };

  _handleExternalFileDragLeave = (_) => {
    this._handleClearFilesDrag();
  };

  _handleFilesDragOver = (e, { destinationDeviceType }) => {
    const { filesDrag } = this.props;

    if (destinationDeviceType === filesDrag.sourceDeviceType) {
      if (filesDrag.sameSourceDestinationLock) {
        return null;
      }

      allowFileDropFlag = false;
      this._handleSetFilesDrag({
        sourceDeviceType: filesDrag.sourceDeviceType,
        destinationDeviceType,
        enter: false,
        lock: false,
        sameSourceDestinationLock: true,
      });

      return null;
    }

    /* Beyond this point we want to allow dropping */
    /* so prevent the default behavior */
    e.preventDefault();
    e.stopPropagation();

    if (filesDrag.lock) {
      return null;
    }

    allowFileDropFlag = true;
    this._handleSetFilesDrag({
      sourceDeviceType: filesDrag.sourceDeviceType,
      destinationDeviceType,
      enter: true,
      lock: true,
      sameSourceDestinationLock: false,
    });
  };

  _handleFilesDragEnd = () => {
    this._handleClearFilesDrag();
  };

  _handleFilesDrop = ({ externalFiles }) => {
    const { directoryLists, filesDrag } = this.props;
    const { sourceDeviceType } = filesDrag;

    const isExternalFiles = !isEmpty(externalFiles);
    const sourceDeviceTypeUpperCase = isExternalFiles
      ? 'EXTERNAL'
      : sourceDeviceType?.toUpperCase();

    analyticsService.sendEvent(
      EVENT_TYPE[`${sourceDeviceTypeUpperCase}_DRAG_FILES_DROPPED`],
      {
        isExternalFiles,
      }
    );

    // if files were dragged from the app pane itself
    if (!isExternalFiles) {
      return directoryLists[sourceDeviceType]?.queue?.selected ?? [];
    }

    // if files were dragged from the finder window then go here
    return [...externalFiles].map((f) => f.path);
  };

  _handleTableDrop = async (_, { __, externalFiles }) => {
    const { actionCreateCopy, filesDrag } = this.props;
    const { sourceDeviceType, destinationDeviceType } = filesDrag;

    if (
      !allowFileDropFlag ||
      sourceDeviceType === destinationDeviceType ||
      destinationDeviceType === null
    ) {
      const isExternalFiles = !isEmpty(externalFiles);
      const sourceDeviceTypeUpperCase = isExternalFiles
        ? 'EXTERNAL'
        : sourceDeviceType?.toUpperCase();

      analyticsService.sendEvent(
        EVENT_TYPE[`${sourceDeviceTypeUpperCase}_DRAG_FILES_CANCELLED`],
        {
          'Is file drop allowed': allowFileDropFlag,
          Reason:
            sourceDeviceType === destinationDeviceType
              ? 'Source and destination are same'
              : false,
        }
      );

      return null;
    }

    const selected = this._handleFilesDrop({
      externalFiles,
    });

    actionCreateCopy({ selected, deviceType: sourceDeviceType });

    setTimeout(() => {
      this._handlePaste();
      this._handleClearFilesDrag();
    }, 200);
  };

  _handleonHoverDropZoneActivate = (deviceType) => {
    const { filesDrag, mtpDevice } = this.props;
    const { sourceDeviceType, destinationDeviceType } = filesDrag;

    if (sourceDeviceType === destinationDeviceType || !mtpDevice.isAvailable) {
      return false;
    }

    return destinationDeviceType === deviceType;
  };

  _handleIsDraggable = (deviceType) => {
    const { directoryLists, mtpDevice } = this.props;
    const { queue } = directoryLists[deviceType];
    const { selected } = queue;

    return selected.length > 0 && mtpDevice.isAvailable;
  };

  _handleSetFilesDrag = ({ ...args }) => {
    const { actionCreateSetFilesDrag } = this.props;

    actionCreateSetFilesDrag({ ...args });
  };

  _handleClearFilesDrag = () => {
    const { actionCreateClearFilesDrag } = this.props;

    actionCreateClearFilesDrag();
  };

  _handleNewFolderEditDialog = async ({ ...args }) => {
    const {
      deviceType,
      actionCreateNewFolder,
      hideHiddenFiles,
      currentBrowsePath,
      storageId,
      fileTransferProgess,
    } = this.props;

    // eslint-disable-next-line react/destructuring-assignment
    const { data } = this.state.toggleDialog.newFolder;
    const { confirm, textFieldValue: newFolderName } = args;
    const targetAction = 'newFolder';
    const deviceTypeUpperCase = deviceType.toUpperCase();

    if (
      deviceType === DEVICE_TYPE.mtp &&
      isTransferPhaseActive(fileTransferProgess.phase)
    ) {
      return null;
    }

    analyticsService.sendEvent(
      EVENT_TYPE[`${deviceTypeUpperCase}_NEW_FOLDER_STARTED`],
      {}
    );

    if (!confirm) {
      this._handleClearEditDialog(targetAction);

      analyticsService.sendEvent(
        EVENT_TYPE[`${deviceTypeUpperCase}_NEW_FOLDER_EXIT`],
        {
          Reason: 'NO_CHANGE',
        }
      );

      return null;
    }

    if (newFolderName === null || newFolderName.trim() === '') {
      this._handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: Folder name cannot be empty.`,
        },
        targetAction
      );

      analyticsService.sendEvent(
        EVENT_TYPE[`${deviceTypeUpperCase}_NEW_FOLDER_EXIT`],
        {
          Reason: 'EMPTY_FOLDER_NAME',
        }
      );

      return null;
    }

    if (/[/\\?%*:|"<>]/g.test(newFolderName)) {
      this._handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: Illegal characters.`,
        },
        targetAction
      );

      analyticsService.sendEvent(
        EVENT_TYPE[`${deviceTypeUpperCase}_NEW_FOLDER_EXIT`],
        {
          Reason: 'ILLEGAL_CHARACTERS',
        }
      );

      return null;
    }

    const newFolderPath = sanitizePath(`${data.path}/${newFolderName}`);

    if (
      await fileExplorerController.filesExist({
        deviceType,
        fileList: [newFolderPath],
        storageId,
      })
    ) {
      this._handleErrorsEditDialog(
        {
          toggle: true,
          message: `Error: The name "${newFolderName}" is already taken.`,
        },
        targetAction
      );

      analyticsService.sendEvent(
        EVENT_TYPE[`${deviceTypeUpperCase}_RENAME_EXIT`],
        {
          Reason: 'FILE_EXISTS',
        }
      );

      return null;
    }

    actionCreateNewFolder(
      {
        newFolderPath,
        deviceType,
      },
      {
        filePath: currentBrowsePath[deviceType],
        ignoreHidden: hideHiddenFiles[deviceType],
      }
    );

    this._handleClearEditDialog(targetAction);
  };

  _handlePaste = async () => {
    const {
      actionCreateSetFileTransferProgress,
      deviceType,
      currentBrowsePath,
      storageId,
      fileTransferClipboard,
      fileTransferProgess,
      appLanguage,
      actionCreateThrowError,
    } = this.props;

    const reduxTransferActive = isTransferPhaseActive(
      fileTransferProgess.phase
    );
    let pendingTransferActive = isTransferPhaseActive(
      this.pendingTransferSession?.phase
    );

    // A pending session only protects the short interval before Redux receives
    // the transfer. Once that same session is terminal it must not keep future
    // click or drag-and-drop transfers blocked.
    if (
      pendingTransferActive &&
      isTransferPhaseTerminal(fileTransferProgess.phase) &&
      this.pendingTransferSession?.sessionId === fileTransferProgess.sessionId
    ) {
      logTransferEvent({
        sessionId: this.pendingTransferSession.sessionId,
        event: 'stale_pending_session_recovered',
        details: { terminalPhase: fileTransferProgess.phase },
      });
      this.pendingTransferSession = null;
      pendingTransferActive = false;
    }

    if (reduxTransferActive || pendingTransferActive) {
      logTransferEvent({
        sessionId:
          fileTransferProgess.sessionId ||
          this.pendingTransferSession?.sessionId ||
          fileTransferClipboard.sessionId,
        event: 'transfer_start_ignored',
        details: {
          reduxPhase: fileTransferProgess.phase,
          pendingPhase: this.pendingTransferSession?.phase || null,
        },
      });

      return null;
    }

    let { queue } = fileTransferClipboard;

    if (
      !queue ||
      queue.length < 1 ||
      fileTransferClipboard.source === deviceType
    ) {
      return null;
    }

    const destinationFolder = currentBrowsePath[deviceType];
    let invalidFileNameFlag = false;
    const deviceTypeUpperCase = deviceType.toUpperCase();
    const startedAt = Date.now();
    const sessionId =
      fileTransferClipboard.sessionId || createTransferSessionId();
    const transferSession = {
      sessionId,
      phase: FILE_TRANSFER_PHASE.checking,
      toggle: true,
      route: `${translate(
        appLanguage,
        DEVICES_LABEL[fileTransferClipboard.source]
      )} → ${translate(appLanguage, DEVICES_LABEL[deviceType])}`,
      sourceLabel: translate(
        appLanguage,
        DEVICES_LABEL[fileTransferClipboard.source]
      ),
      destinationLabel: translate(appLanguage, DEVICES_LABEL[deviceType]),
      destinationFolder,
      itemCount: queue.length,
      startedAt,
      lastActivityAt: startedAt,
      errorMessage: null,
    };

    this.pendingTransferSession = transferSession;
    actionCreateSetFileTransferProgress(transferSession);
    logTransferEvent({
      sessionId,
      event: 'destination_check_started',
      details: {
        destinationDevice: deviceType,
        itemCount: queue.length,
      },
    });

    queue = queue.map((a) => {
      const _baseName = baseName(a);
      const fullPath = `${destinationFolder}/${_baseName}`;

      if (fullPath.trim() === '' || /[\\:]/g.test(fullPath)) {
        invalidFileNameFlag = true;
      }

      return fullPath;
    });

    analyticsService.sendEvent(
      EVENT_TYPE[`${deviceTypeUpperCase}_PASTE_FILES`],
      {}
    );

    if (invalidFileNameFlag) {
      const errorMessage = `Invalid file name in the path. \\: characters are not allowed.`;

      actionCreateSetFileTransferProgress({
        ...transferSession,
        phase: FILE_TRANSFER_PHASE.failed,
        lastActivityAt: Date.now(),
        errorMessage,
      });
      actionCreateThrowError({
        message: errorMessage,
      });
      logTransferEvent({
        sessionId,
        event: 'destination_check_failed',
        details: { reason: 'invalid_filename' },
        error: errorMessage,
      });
      this.pendingTransferSession = null;

      return null;
    }

    try {
      const filesExistResult = await fileExplorerController.filesExist({
        deviceType,
        fileList: queue,
        storageId,
      });

      if (
        filesExistResult &&
        typeof filesExistResult === 'object' &&
        (filesExistResult.error || filesExistResult.stderr)
      ) {
        throw filesExistResult.error || filesExistResult.stderr;
      }

      logTransferEvent({
        sessionId,
        event: 'destination_check_finished',
        details: { existingItemsDetected: Boolean(filesExistResult) },
      });

      if (!filesExistResult) {
        this._handlePasteConfirm(true, transferSession);

        return null;
      }

      analyticsService.sendEvent(
        EVENT_TYPE[`${deviceTypeUpperCase}_PASTE_FILES_DIALOG_OPEN`],
        {
          Reason: 'FILES_EXIST',
        }
      );

      this.pendingTransferSession = {
        ...transferSession,
        phase: FILE_TRANSFER_PHASE.waitingForConfirmation,
        toggle: false,
        lastActivityAt: Date.now(),
      };
      actionCreateSetFileTransferProgress(this.pendingTransferSession);
      logTransferEvent({
        sessionId,
        event: 'replacement_confirmation_required',
        details: { itemCount: queue.length },
      });
      this._handleTogglePasteConfirmDialog(true);

      return null;
    } catch (error) {
      const transportFailed = isFatalMtpTransportError(error, null);
      const errorMessage = transportFailed
        ? translate(
            appLanguage,
            'The USB connection was interrupted. Unlock and reconnect the phone, then try again. The transfer queue has been preserved.'
          )
        : normalizeTransferError(
            error,
            'Unable to check the destination. Reconnect the device and try again.'
          );

      if (transportFailed) {
        const { actionCreateSetMtpStatus } = this.props;

        actionCreateSetMtpStatus({
          isAvailable: false,
          isLoading: false,
          error,
        });
      }

      actionCreateSetFileTransferProgress({
        ...transferSession,
        phase: FILE_TRANSFER_PHASE.failed,
        lastActivityAt: Date.now(),
        errorMessage,
      });
      logTransferEvent({
        sessionId,
        event: 'destination_check_failed',
        details: { destinationDevice: deviceType },
        error,
      });
      this.pendingTransferSession = null;

      return null;
    }
  };

  _handlePasteConfirm = (confirm, transferSession = null) => {
    const {
      actionCreateClearFileTransferProgress,
      deviceType,
      hideHiddenFiles,
      currentBrowsePath,
      storageId,
      actionCreatePaste,
      fileTransferClipboard,
    } = this.props;
    const destinationFolder = currentBrowsePath[deviceType];

    this._handleTogglePasteConfirmDialog(false);
    const deviceTypeUpperCase = deviceType.toUpperCase();

    if (!confirm) {
      analyticsService.sendEvent(
        EVENT_TYPE[`${deviceTypeUpperCase}_PASTE_FILES_DIALOG_CLOSE`],
        {
          Reason: 'REPLACE_FILES_DENIED',
        }
      );

      this.pendingTransferSession = null;
      actionCreateClearFileTransferProgress();

      return null;
    }

    const activeTransferSession =
      transferSession || this.pendingTransferSession || {};

    this.pendingTransferSession = activeTransferSession;

    actionCreatePaste(
      {
        destinationFolder,
        storageId,
        fileTransferClipboard,
        transferSession: activeTransferSession,
      },
      {
        filePath: destinationFolder,
        ignoreHidden: hideHiddenFiles[deviceType],
      },
      deviceType
    );

    // Redux is now the source of truth for the running transfer. Retaining the
    // pre-dispatch session here would make the next click/drop look active even
    // after the transfer completed.
    this.pendingTransferSession = null;
  };

  _handleTransferDialogClose = () => {
    const { actionCreateClearFileTransferProgress } = this.props;

    this.pendingTransferSession = null;
    actionCreateClearFileTransferProgress();
  };

  _handleTransferRetry = () => {
    this._handleTransferDialogClose();
    this._handlePaste();
  };

  _handleBreadcrumbPathClick = ({ ...args }) => {
    const { actionCreateListDirectory, hideHiddenFiles, deviceType } =
      this.props;
    const { path } = args;

    actionCreateListDirectory(
      {
        filePath: path,
        ignoreHidden: hideHiddenFiles[deviceType],
      },
      deviceType
    );
  };

  _handleSearchResultOpen = (result) => {
    const {
      actionCreateListDirectory,
      actionCreateTableClick,
      hideHiddenFiles,
      deviceType,
    } = this.props;
    const destinationPath = result.isFolder
      ? result.path
      : path.dirname(result.path);

    actionCreateListDirectory(
      {
        filePath: destinationPath,
        ignoreHidden: hideHiddenFiles[deviceType],
        onSuccess: () => {
          if (!result.isFolder) {
            this.selectionAnchor[deviceType] = result.path;
            this.selectionCursor[deviceType] = result.path;
            actionCreateTableClick({ selected: [result.path] }, deviceType);
          }
        },
      },
      deviceType
    );
  };

  _handleRequestSort = (deviceType, property) => {
    const { directoryLists, actionCreateRequestSort } = this.props;
    const orderBy = property;
    const { orderBy: _orderBy, order: _order } = directoryLists[deviceType];
    let order = 'asc';

    if (_orderBy === property && _order === 'asc') {
      order = 'desc';
    }

    actionCreateRequestSort({ order, orderBy }, deviceType);

    this._handleDirectoryGeneratedTime();
  };

  _handleSelectAllClick = (deviceType, event, interactionNodes = null) => {
    const { directoryLists, actionCreateSelectAllClick } = this.props;
    const selected =
      (interactionNodes || directoryLists[deviceType].nodes).map(
        (item) => item.path
      ) || [];
    let isChecked = true;

    if (event) {
      isChecked = event.target.checked;
    }

    actionCreateSelectAllClick({ selected }, isChecked, deviceType);
  };

  _handleTableClick = (
    path,
    deviceType,
    event,
    selectionIntent = 'row',
    interactionNodes = null
  ) => {
    if (undefinedOrNull(path)) {
      return null;
    }

    const { directoryLists, actionCreateTableClick, multiSelectMode } =
      this.props;
    const {
      nodes: sourceNodes,
      order,
      orderBy,
      queue,
    } = directoryLists[deviceType];
    const nodes = interactionNodes || sourceNodes;
    const { selected } = queue;

    if (
      multiSelectMode[deviceType] &&
      event?.detail > 1 &&
      selectionIntent !== 'replace'
    ) {
      return null;
    }

    const selectedIndex = selected.indexOf(path);
    let newSelected = [];
    const isRangeSelection = event?.shiftKey || this.keyedAcceleratorList.shift;
    const isToggleSelection =
      multiSelectMode[deviceType] ||
      selectionIntent === 'toggle' ||
      event?.metaKey ||
      event?.ctrlKey ||
      this.keyedAcceleratorList.meta;

    if (isRangeSelection && selectionIntent !== 'toggle') {
      const tableSorted = this.tableSort({ nodes, order, orderBy });
      const anchor =
        this.selectionAnchor[deviceType] ??
        selected[selected.length - 1] ??
        path;
      const anchorIndex = this.tableSortCache.indexByPath.get(anchor) ?? -1;
      const pathIndex = this.tableSortCache.indexByPath.get(path) ?? -1;

      if (anchorIndex > -1 && pathIndex > -1) {
        const rangeStart = Math.min(anchorIndex, pathIndex);
        const rangeEnd = Math.max(anchorIndex, pathIndex);

        newSelected = tableSorted
          .slice(rangeStart, rangeEnd + 1)
          .map((item) => item.path);
      } else {
        newSelected = [path];
      }

      this.selectionCursor[deviceType] = path;
    } else if (selectionIntent === 'replace' || !isToggleSelection) {
      newSelected = [path];
      this.selectionAnchor[deviceType] = path;
      this.selectionCursor[deviceType] = path;
    } else if (selectedIndex === -1) {
      newSelected = [...selected, path];
      this.selectionAnchor[deviceType] = path;
      this.selectionCursor[deviceType] = path;
    } else {
      newSelected = selected.filter((selectedPath) => selectedPath !== path);
      this.selectionCursor[deviceType] =
        newSelected[newSelected.length - 1] ?? null;

      if (this.selectionAnchor[deviceType] === path) {
        this.selectionAnchor[deviceType] =
          newSelected[newSelected.length - 1] ?? null;
      }
    }

    actionCreateTableClick({ selected: newSelected }, deviceType);
  };

  _handleTableDoubleClick = (item, deviceType) => {
    const { mtpDevice, multiSelectMode } = this.props;
    const { isFolder, path } = item;

    if (multiSelectMode[deviceType]) {
      return null;
    }

    if (deviceType === DEVICE_TYPE.mtp && !mtpDevice.isAvailable) {
      return null;
    }

    const deviceTypeUpperCase = deviceType.toUpperCase();

    if (!isFolder) {
      if (deviceType === DEVICE_TYPE.local) {
        shell.openPath(path);

        analyticsService.sendEvent(
          EVENT_TYPE[`${deviceTypeUpperCase}_OPEN_FILE`],
          {}
        );
      }

      return null;
    }

    this._handleListDirectory({
      path,
      deviceType,
    });

    analyticsService.sendEvent(
      EVENT_TYPE[`${deviceTypeUpperCase}_OPEN_DIRECTORY`],
      {}
    );
  };

  tableSort = ({ ...args }) => {
    const { showDirectoriesFirst } = this.props;
    const { nodes, order, orderBy } = args;

    if (!isArray(nodes) || nodes.length === 0) {
      return [];
    }

    if (
      this.tableSortCache &&
      this.tableSortCache.nodes === nodes &&
      this.tableSortCache.order === order &&
      this.tableSortCache.orderBy === orderBy &&
      this.tableSortCache.showDirectoriesFirst === showDirectoriesFirst
    ) {
      return this.tableSortCache.result;
    }

    let _sortedNode = [];

    if (order === 'asc') {
      _sortedNode = lodashSortBy(nodes, [
        (value) => this._lodashSortConstraints({ value, orderBy }),
      ]);
    } else {
      _sortedNode = lodashSortBy(nodes, [
        (value) => this._lodashSortConstraints({ value, orderBy }),
      ]).reverse();
    }

    const _folders = [];
    const _files = [];

    if (showDirectoriesFirst) {
      _sortedNode.forEach((a) => {
        if (a.isFolder) {
          _folders.push(a);

          return a;
        }

        _files.push(a);
      });

      _sortedNode = [..._folders, ..._files];
    }

    this.tableSortCache = {
      nodes,
      order,
      orderBy,
      showDirectoriesFirst,
      result: _sortedNode,
      indexByPath: new Map(
        _sortedNode.map((item, index) => [item.path, index])
      ),
    };

    return _sortedNode;
  };

  _lodashSortConstraints = ({ value, orderBy }) => {
    if (orderBy === 'extension') {
      const category = getFileCategory(value);

      return `${category.order}_${value.name.toLowerCase()}`;
    }

    if (orderBy === 'size' && value.isFolder) {
      return 0;
    }

    const item = value[orderBy];
    let _primer = null;

    // Devices can omit fields (e.g. no date on MTP folders): sort them as
    // empty instead of throwing inside path.parse / toLowerCase.
    if (undefinedOrNull(item)) {
      return '';
    }

    if (isNumber(item)) {
      if (isInt(item)) {
        _primer = parseInt(item, 10);
      } else if (isFloat(item)) {
        _primer = parseFloat(item);
      }
    }

    if (_primer === null) {
      if (!value.isFolder) {
        const _pathInfo = pathInfo(String(item), value.isFolder);

        _primer = _pathInfo.name.toLowerCase();
      } else {
        _primer = String(item).toLowerCase();
      }
    }

    return _primer;
  };

  _handleDirectoryGeneratedTime = () => {
    this.setState({
      directoryGeneratedTime: Date.now(),
    });
  };

  render() {
    const {
      deviceType,
      hideColList,
      currentBrowsePath,
      directoryLists,
      fileTransferProgess,
      mtpDevice,
      filesDrag,
      fileExplorerListingType,
      isStatusBarEnabled,
      fileTransferClipboard,
      multiSelectMode,
      appLanguage,
      hideHiddenFiles,
      storageId,
      appThemeMode,
    } = this.props;
    const { toggleDialog, togglePasteConfirmDialog, directoryGeneratedTime } =
      this.state;
    const { rename, newFolder } = toggleDialog;
    const togglePasteDialog =
      deviceType === DEVICE_TYPE.mtp && fileTransferProgess.toggle;
    const renameSecondaryText =
      deviceType === DEVICE_TYPE.mtp
        ? `Not all ${DEVICES_LABEL[
            DEVICE_TYPE.mtp
          ].toLowerCase()}s will support the rename feature.`
        : ``;

    return (
      <Fragment>
        <TextFieldEditDialog
          titleText={`Rename a ${
            rename.data.isFolder ? `folder` : `file`
          } on your ${DEVICES_LABEL[deviceType]}?`}
          bodyText={`Path: ${rename.data.path || ''}`}
          secondaryText={`${renameSecondaryText}`}
          trigger={rename.toggle}
          defaultValue={rename.data.name || ''}
          label={rename.data.isFolder ? `New folder name` : `New file name`}
          id="renameDialog"
          required
          multiline={false}
          fullWidthDialog
          maxWidthDialog="sm"
          fullWidthTextField
          autoFocus
          onClickHandler={this._handleRenameEditDialog}
          btnPositiveText="Rename"
          btnNegativeText="Cancel"
          errors={rename.errors}
        />
        <TextFieldEditDialog
          titleText={`Create a new folder on your ${DEVICES_LABEL[deviceType]}`}
          bodyText={`Path: ${newFolder.data.path || ''}`}
          trigger={newFolder.toggle}
          defaultValue=""
          label="New folder name"
          id="newFolderDialog"
          required
          multiline={false}
          fullWidthDialog
          maxWidthDialog="sm"
          fullWidthTextField
          autoFocus
          onClickHandler={this._handleNewFolderEditDialog}
          btnPositiveText="Create"
          btnNegativeText="Cancel"
          errors={newFolder.errors}
        />
        <FileTransferDialog
          transfer={fileTransferProgess}
          trigger={togglePasteDialog}
          appLanguage={appLanguage}
          onClose={this._handleTransferDialogClose}
          onRetry={this._handleTransferRetry}
        />
        <ConfirmDialog
          fullWidthDialog
          maxWidthDialog="xs"
          bodyText="Replace and merge the existing items?"
          trigger={togglePasteConfirmDialog}
          onClickHandler={this._handlePasteConfirm}
        />
        <FileExplorerBodyRender
          deviceType={deviceType}
          fileExplorerListingType={fileExplorerListingType}
          hideColList={hideColList}
          currentBrowsePath={currentBrowsePath}
          directoryLists={directoryLists}
          fileTransferClipboard={fileTransferClipboard}
          fileTransferProgress={fileTransferProgess}
          mtpDevice={mtpDevice}
          multiSelectMode={multiSelectMode}
          appLanguage={appLanguage}
          appThemeMode={appThemeMode}
          searchStorageId={storageId}
          searchIgnoreHidden={hideHiddenFiles[deviceType]}
          filesDrag={filesDrag}
          tableSort={this.tableSort}
          isStatusBarEnabled={isStatusBarEnabled}
          directoryGeneratedTime={directoryGeneratedTime}
          onHoverDropZoneActivate={this._handleonHoverDropZoneActivate}
          onFilesDragOver={this._handleFilesDragOver}
          onFilesDragEnd={this._handleFilesDragEnd}
          onFilesDrop={this._handleTableDrop}
          onDragStart={this._handleFilesDragStart}
          onBreadcrumbPathClick={this._handleBreadcrumbPathClick}
          onSelectAllClick={this._handleSelectAllClick}
          onRequestSort={this._handleRequestSort}
          onContextMenuClick={this._handleContextMenuClick}
          onTableDoubleClick={this._handleTableDoubleClick}
          onTableClick={this._handleTableClick}
          onIsDraggable={this._handleIsDraggable}
          onExternalFileDragLeave={this._handleExternalFileDragLeave}
          onFocussedFileExplorerDeviceType={
            this._handleFocussedFileExplorerDeviceType
          }
          onAcceleratorActivation={this._handleAcceleratorActivation}
          onTryConnection={this._handleTryConnection}
          onSearchResultOpen={this._handleSearchResultOpen}
          onPaste={this._handlePaste}
        />
        ;
      </Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch, _) =>
  bindActionCreators(
    {
      actionCreateThrowError:
        ({ ...args }) =>
        (_, __) => {
          dispatch(throwAlert({ ...args }));
        },

      actionCreateFocussedFileExplorerDeviceType:
        ({ ...args }) =>
        (_, __) => {
          dispatch(setFocussedFileExplorerDeviceType({ ...args }));
        },

      actionCreateRequestSort:
        ({ ...args }, deviceType) =>
        (_, __) => {
          dispatch(setSortingDirLists({ ...args }, deviceType));
        },

      actionCreateSelectAllClick:
        ({ selected }, isChecked, deviceType) =>
        (_, __) => {
          if (isChecked) {
            dispatch(
              actionSetSelectedDirLists(
                {
                  selected,
                },
                deviceType
              )
            );

            return;
          }

          dispatch(actionSetSelectedDirLists({ selected: [] }, deviceType));
        },

      actionCreateTableClick:
        ({ selected }, deviceType) =>
        (_, __) => {
          dispatch(actionSetSelectedDirLists({ selected }, deviceType));
        },

      actionCreateInitializeMtp:
        ({ filePath, ignoreHidden, deviceType }) =>
        (_, getState) => {
          dispatch(
            initializeMtp(
              {
                filePath,
                ignoreHidden,
                changeLegacyMtpStorageOnlyOnDeviceChange: false,
                deviceType,
              },
              getState
            )
          );
        },

      /**
       *
       * @param args {isAvailable, error, isLoading, info}
       * @return {{payload: {}, type: *}}
       */
      actionCreateSetMtpStatus:
        ({ ...args }) =>
        (_, __) => {
          dispatch(actionSetMtpStatus(args));
        },

      actionCreateListDirectory:
        ({ ...args }, deviceType) =>
        (_, getState) => {
          dispatch(listDirectory({ ...args }, deviceType, getState));
        },

      actionCreateReloadDirList:
        ({ filePath, ignoreHidden, deviceType }) =>
        (_, getState) => {
          checkIf(deviceType, 'inObjectValues', DEVICE_TYPE);

          dispatch(
            reloadDirList(
              {
                filePath,
                ignoreHidden,
                deviceType,
              },
              getState
            )
          );
        },

      actionCreateResetMtpSession:
        ({ errorMessage }) =>
        () => {
          dispatch(resetMtpSession({ errorMessage }));
        },

      actionCreateRenameFile:
        ({ filePath, newFilename, deviceType }, { ...listDirectoryArgs }) =>
        async (_, getState) => {
          const { mtpMode } = getState().Settings;

          try {
            switch (deviceType) {
              case DEVICE_TYPE.local:
                const {
                  error: localError,
                  stderr: localStderr,
                  data: localData,
                } = await fileExplorerController.renameFile({
                  deviceType,
                  filePath,
                  newFilename,
                  storageId: null,
                });

                dispatch(
                  churnLocalBuffer({
                    deviceType,
                    error: localError,
                    stderr: localStderr,
                    data: localData,
                    onSuccess: () => {
                      dispatch(
                        listDirectory(
                          { ...listDirectoryArgs },
                          deviceType,
                          getState
                        )
                      );
                    },
                  })
                );
                break;
              case DEVICE_TYPE.mtp:
                if (
                  isTransferPhaseActive(
                    getState().Home.fileTransfer.progress.phase
                  )
                ) {
                  return null;
                }

                const storageId = getSelectedStorageIdFromState(
                  getState().Home
                );
                const {
                  error: mtpError,
                  stderr: mtpStderr,
                  data: mtpData,
                } = await fileExplorerController.renameFile({
                  deviceType,
                  filePath,
                  newFilename,
                  storageId,
                });

                dispatch(
                  churnMtpBuffer({
                    deviceType,
                    error: mtpError,
                    stderr: mtpStderr,
                    data: mtpData,
                    mtpMode,
                    onSuccess: () => {
                      dispatch(
                        listDirectory(
                          { ...listDirectoryArgs },
                          deviceType,
                          getState
                        )
                      );
                    },
                  })
                );
                break;
              default:
                break;
            }
          } catch (e) {
            log.error(e);
          }
        },

      actionCreateNewFolder:
        ({ newFolderPath, deviceType }, { ...listDirectoryArgs }) =>
        async (_, getState) => {
          try {
            const { mtpMode } = getState().Settings;

            switch (deviceType) {
              case DEVICE_TYPE.local:
                const {
                  error: localError,
                  stderr: localStderr,
                  data: localData,
                } = await fileExplorerController.makeDirectory({
                  deviceType,
                  filePath: newFolderPath,
                  storageId: null,
                });

                dispatch(
                  churnLocalBuffer({
                    deviceType,
                    error: localError,
                    stderr: localStderr,
                    data: localData,
                    onSuccess: () => {
                      dispatch(
                        listDirectory(
                          { ...listDirectoryArgs },
                          deviceType,
                          getState
                        )
                      );
                    },
                  })
                );
                break;
              case DEVICE_TYPE.mtp:
                if (
                  isTransferPhaseActive(
                    getState().Home.fileTransfer.progress.phase
                  )
                ) {
                  return null;
                }

                const storageId = getSelectedStorageIdFromState(
                  getState().Home
                );
                const {
                  error: mtpError,
                  stderr: mtpStderr,
                  data: mtpData,
                } = await fileExplorerController.makeDirectory({
                  deviceType,
                  filePath: newFolderPath,
                  storageId,
                });

                dispatch(
                  churnMtpBuffer({
                    deviceType,
                    error: mtpError,
                    stderr: mtpStderr,
                    data: mtpData,
                    mtpMode,
                    onSuccess: () => {
                      dispatch(
                        listDirectory(
                          { ...listDirectoryArgs },
                          deviceType,
                          getState
                        )
                      );
                    },
                  })
                );
                break;
              default:
                break;
            }
          } catch (e) {
            log.error(e);
          }
        },

      actionCreateCopy:
        ({ selected, deviceType, toQueue = false }) =>
        async (_, getState) => {
          try {
            let queue = [];

            if (toQueue && isArray(selected) && selected.length > 0) {
              const currentClipboardQueue =
                getState().Home.fileTransfer.clipboard.queue;

              queue = [...currentClipboardQueue, ...selected];
            } else {
              queue = selected || [];
            }

            queue = removeArrayDuplicates(queue);
            const sessionId = createTransferSessionId();

            dispatch(
              setFileTransferClipboard({
                queue,
                source: deviceType,
                sessionId,
                preparedAt: Date.now(),
              })
            );

            logTransferEvent({
              sessionId,
              event: 'clipboard_ready',
              details: {
                sourceDevice: deviceType,
                itemCount: queue.length,
                appendMode: toQueue,
              },
            });

            dispatch(actionSetSelectedDirLists({ selected: [] }, deviceType));
          } catch (e) {
            log.error(e);
          }
        },

      actionCreateSetFileTransferProgress:
        ({ ...progress }) =>
        (_, __) => {
          dispatch(setFileTransferProgress(progress));
        },

      actionCreateClearFileTransferProgress: () => (_, __) => {
        dispatch(clearFileTransferProgress());
      },

      actionCreatePaste:
        ({ ...pasteArgs }, { ...listDirectoryArgs }, deviceType) =>
        async (_, getState) => {
          let sessionElapsedTime = 0;
          const sessionTransferSpeeds = [];
          let sessionTotalFiles = 0;
          let sessionTransferDirection;
          let settled = false;
          let firstProgressLogged = false;
          let preprocessLogged = false;
          let lastProgressDispatchAt = 0;
          let lastLoggedProgressBucket = -1;
          const actionSessionId =
            pasteArgs.transferSession?.sessionId || createTransferSessionId();

          try {
            const { appLanguage, mtpMode, filesPreprocessingBeforeTransfer } =
              getState().Settings;

            const {
              destinationFolder,
              storageId,
              fileTransferClipboard,
              transferSession = {},
            } = pasteArgs;

            const transferSourceLabel = translate(
              appLanguage,
              DEVICES_LABEL[fileTransferClipboard.source]
            );
            const transferDestinationLabel = translate(
              appLanguage,
              DEVICES_LABEL[deviceType]
            );
            const transferItemsTotal = fileTransferClipboard.queue.length;
            const transferRoute = `${transferSourceLabel} → ${transferDestinationLabel}`;
            const sessionId = actionSessionId;

            if (activeTransferSessions.has(sessionId)) {
              logTransferEvent({
                sessionId,
                event: 'duplicate_transfer_ignored',
                details: { itemCount: transferItemsTotal },
              });

              return;
            }

            activeTransferSessions.add(sessionId);
            const startedAt = transferSession.startedAt || Date.now();
            let latestProgress = {
              ...transferSession,
              toggle: true,
              sessionId,
              phase: FILE_TRANSFER_PHASE.preparing,
              route: transferRoute,
              sourceLabel: transferSourceLabel,
              destinationLabel: transferDestinationLabel,
              destinationFolder,
              itemCount: transferItemsTotal,
              totalFiles: transferItemsTotal,
              startedAt,
              lastActivityAt: Date.now(),
              errorMessage: null,
            };

            const publishProgress = (updates, force = false) => {
              const now = Date.now();

              latestProgress = {
                ...latestProgress,
                ...updates,
                lastActivityAt: updates.lastActivityAt || now,
              };

              if (force || now - lastProgressDispatchAt >= 120) {
                lastProgressDispatchAt = now;
                dispatch(setFileTransferProgress(latestProgress));
              }
            };

            const failTransfer = async ({ error, stderr, data }) => {
              if (settled) {
                return;
              }

              settled = true;
              activeTransferSessions.delete(sessionId);
              let processedError = null;

              try {
                processedError = await processMtpBuffer({
                  error,
                  stderr,
                  mtpMode,
                });
              } catch (processingError) {
                log.error(processingError);
              }

              const transportFailed = isFatalMtpTransportError(error, stderr);
              const errorMessage = transportFailed
                ? translate(
                    appLanguage,
                    'The USB connection was interrupted. Unlock and reconnect the phone, then try again. The transfer queue has been preserved.'
                  )
                : processedError?.error ||
                  normalizeTransferError(
                    error || stderr,
                    'The transfer could not be completed. Reconnect the device and try again.'
                  );

              if (transportFailed) {
                dispatch(
                  actionSetMtpStatus({
                    isAvailable: false,
                    isLoading: false,
                    error: error || stderr,
                  })
                );
              }

              getCurrentWindow().setProgressBar(-1);
              publishProgress(
                {
                  phase: FILE_TRANSFER_PHASE.failed,
                  toggle: true,
                  errorMessage,
                  completedAt: Date.now(),
                },
                true
              );
              logTransferEvent({
                sessionId,
                event: 'transfer_failed',
                details: {
                  direction: sessionTransferDirection,
                  itemCount: transferItemsTotal,
                  processedItems: latestProgress.filesSent || 0,
                  hasDiagnosticData: Boolean(data),
                },
                error: error || stderr || errorMessage,
              });
              analyticsService.sendEvent(EVENT_TYPE.FILE_TRANSFER_ERROR, {});
            };

            const completeTransfer = () => {
              if (settled) {
                return;
              }

              settled = true;
              activeTransferSessions.delete(sessionId);
              getCurrentWindow().setProgressBar(-1);
              dispatch(
                setFileTransferClipboard({
                  queue: [],
                  source: null,
                  sessionId: null,
                  preparedAt: null,
                })
              );
              publishProgress(
                {
                  phase: FILE_TRANSFER_PHASE.completed,
                  toggle: true,
                  activeFileProgress: 100,
                  totalFileProgress: 100,
                  filesSent: sessionTotalFiles || transferItemsTotal,
                  completedAt: Date.now(),
                },
                true
              );
              dispatch(
                listDirectory({ ...listDirectoryArgs }, deviceType, getState)
              );
              logTransferEvent({
                sessionId,
                event: 'transfer_completed',
                details: {
                  direction: sessionTransferDirection,
                  itemCount: transferItemsTotal,
                  elapsedTime: sessionElapsedTime,
                },
              });

              analyticsService.sendEvent(EVENT_TYPE.FILE_TRANSFER_COMPLETED, {
                'Transfer direction': sessionTransferDirection,
                'Total files': sessionTotalFiles,
                'Average transfer speed': `${arrayAverage(
                  sessionTransferSpeeds
                )} MB/s`,
                'Elapsed time': sessionElapsedTime,
                'Is files preprocessing enabled':
                  filesPreprocessingBeforeTransfer[sessionTransferDirection],
              });
            };

            getCurrentWindow().setProgressBar(2);
            publishProgress({}, true);
            logTransferEvent({
              sessionId,
              event: 'transfer_requested',
              details: {
                direction:
                  deviceType === DEVICE_TYPE.local
                    ? FILE_TRANSFER_DIRECTION.download
                    : FILE_TRANSFER_DIRECTION.upload,
                itemCount: transferItemsTotal,
                mtpMode,
              },
            });

            analyticsService.sendEvent(EVENT_TYPE.FILE_TRANSFER_STARTED, {});

            // on pre process callback for file transfer
            const onPreprocess = ({ fullPath }) => {
              getCurrentWindow().setProgressBar(0);
              publishProgress({
                phase: FILE_TRANSFER_PHASE.preparing,
                currentFile: fullPath,
              });

              if (!preprocessLogged) {
                preprocessLogged = true;
                logTransferEvent({
                  sessionId,
                  event: 'preprocessing_started',
                  details: { itemCount: transferItemsTotal },
                });
              }
            };

            // on progress callback for file transfer
            const onProgress = ({
              elapsedTime,
              speed,
              activeFileProgress,
              currentFile,
              activeFileSize,
              activeFileSizeSent,
              totalFiles,
              filesSent,
              totalFileSize,
              totalFileSizeSent,
              totalFileProgress,
              direction,
            }) => {
              sessionElapsedTime = elapsedTime;
              sessionTotalFiles = totalFiles || transferItemsTotal;
              const progressDirection = direction || sessionTransferDirection;

              sessionTransferDirection = progressDirection;
              checkIf(progressDirection, 'string');
              checkIf(
                progressDirection,
                'inObjectValues',
                FILE_TRANSFER_DIRECTION
              );

              const numericSpeed = Number.parseFloat(speed) || 0;
              const normalizedSpeed =
                mtpMode === MTP_MODE.legacy
                  ? numericSpeed / 1000 / 1000
                  : numericSpeed;
              const hasOverallProgress =
                filesPreprocessingBeforeTransfer[progressDirection] &&
                Number.isFinite(totalFileProgress);
              const visibleProgress = hasOverallProgress
                ? totalFileProgress
                : activeFileProgress;
              const windowProgressBar = Math.max(
                0,
                Math.min(1, (visibleProgress || 0) / 100)
              );

              sessionTransferSpeeds.push(normalizedSpeed);
              publishProgress({
                phase: FILE_TRANSFER_PHASE.transferring,
                elapsedTime,
                speed: normalizedSpeed ? normalizedSpeed.toFixed(2) : null,
                activeFileProgress: activeFileProgress || 0,
                currentFile,
                activeFileSize: activeFileSize || 0,
                activeFileSizeSent: activeFileSizeSent || 0,
                totalFiles: totalFiles || transferItemsTotal,
                filesSent: filesSent || 0,
                totalFileSize: totalFileSize || 0,
                totalFileSizeSent: totalFileSizeSent || 0,
                totalFileProgress: visibleProgress || 0,
              });
              getCurrentWindow().setProgressBar(windowProgressBar);

              if (!firstProgressLogged) {
                firstProgressLogged = true;
                logTransferEvent({
                  sessionId,
                  event: 'first_progress_received',
                  details: { direction: progressDirection },
                });
              }

              const progressBucket = Math.floor((visibleProgress || 0) / 10);

              if (progressBucket > lastLoggedProgressBucket) {
                lastLoggedProgressBucket = progressBucket;
                logTransferEvent({
                  sessionId,
                  event: 'progress_checkpoint',
                  details: {
                    percentage: Math.min(progressBucket * 10, 100),
                    filesSent: filesSent || 0,
                    totalFiles: totalFiles || transferItemsTotal,
                  },
                });
              }
            };

            // on error callback for file transfer
            const onError = ({ error, stderr, data }) => {
              failTransfer({ error, stderr, data });
            };

            // on completed callback for file transfer
            const onCompleted = completeTransfer;

            let result;

            switch (deviceType) {
              case DEVICE_TYPE.local:
                sessionTransferDirection = FILE_TRANSFER_DIRECTION.download;
                result = await fileExplorerController.transferFiles({
                  deviceType: DEVICE_TYPE.mtp,
                  destination: destinationFolder,
                  storageId,
                  fileList: fileTransferClipboard?.queue ?? [],
                  direction: FILE_TRANSFER_DIRECTION.download,
                  onCompleted,
                  onError,
                  onProgress,
                  onPreprocess,
                });

                break;
              case DEVICE_TYPE.mtp:
                sessionTransferDirection = FILE_TRANSFER_DIRECTION.upload;
                result = await fileExplorerController.transferFiles({
                  deviceType: DEVICE_TYPE.mtp,
                  destination: destinationFolder,
                  storageId,
                  fileList: fileTransferClipboard?.queue ?? [],
                  direction: FILE_TRANSFER_DIRECTION.upload,
                  onCompleted,
                  onError,
                  onProgress,
                  onPreprocess,
                });

                break;
              default:
                await failTransfer({
                  error: `Unsupported destination device: ${deviceType}`,
                  stderr: null,
                  data: null,
                });
                break;
            }

            if (!settled && (result?.error || result?.stderr)) {
              await failTransfer(result);
            }
          } catch (e) {
            log.error(e);
            getCurrentWindow().setProgressBar(-1);

            const sessionId = actionSessionId;

            activeTransferSessions.delete(sessionId);
            dispatch(
              setFileTransferProgress({
                ...pasteArgs.transferSession,
                toggle: true,
                sessionId,
                phase: FILE_TRANSFER_PHASE.failed,
                errorMessage: normalizeTransferError(e),
                completedAt: Date.now(),
                lastActivityAt: Date.now(),
              })
            );
            logTransferEvent({
              sessionId,
              event: 'transfer_start_failed',
              details: { destinationDevice: deviceType },
              error: e,
            });
          }
        },

      actionCreateSetFilesDrag:
        ({ ...args }) =>
        (_, __) => {
          try {
            dispatch(setFilesDrag({ ...args }));
          } catch (e) {
            log.error(e);
          }
        },

      actionCreateClearFilesDrag: () => (_, __) => {
        try {
          dispatch(clearFilesDrag());
        } catch (e) {
          log.error(e);
        }
      },
      actionCreatedDisposeMtp:
        ({ deviceType }) =>
        (_, getState) => {
          try {
            if (deviceType === DEVICE_TYPE.local) {
              return;
            }

            dispatch(
              disposeMtp(
                {
                  deviceType,
                  onError: () => {},
                  onSuccess: () => {},
                },
                getState
              )
            );
          } catch (e) {
            log.error(e);
          }
        },
    },
    dispatch
  );

const mapStateToProps = (state, _) => {
  return {
    currentBrowsePath: makeCurrentBrowsePath(state),
    mtpDevice: makeMtpDevice(state),
    directoryLists: makeDirectoryLists(state),
    hideHiddenFiles: makeHideHiddenFiles(state),
    isStatusBarEnabled: makeEnableStatusBar(state),
    contextMenuList: makeContextMenuList(state),
    storageId: makeStorageId(state),
    fileTransferClipboard: makeFileTransferClipboard(state),
    fileTransferProgess: makeFileTransferProgess(state),
    filesDrag: makeFilesDrag(state),
    fileExplorerListingType: makeFileExplorerListingType(state),
    focussedFileExplorerDeviceType: makeFocussedFileExplorerDeviceType(state),
    appThemeMode: makeAppThemeMode(state),
    mtpMode: makeMtpMode(state),
    enableUsbHotplug: makeEnableUsbHotplug(state),
    showDirectoriesFirst: makeShowDirectoriesFirst(state),
    multiSelectMode: makeMultiSelectMode(state),
    appLanguage: makeAppLanguage(state),
  };
};

export default withReducer(
  'Home',
  reducers
)(connect(mapStateToProps, mapDispatchToProps)(FileExplorer));
