import { actionTypes } from './actions';
import { PATHS } from '../../constants/paths';
import {
  DEVICES_DEFAULT_PATH,
  FILE_EXPLORER_DEFAULT_FOCUSSED_DEVICE_TYPE,
} from '../../constants';
import { DEVICE_TYPE } from '../../enums';
import { isKalamModeSupported } from '../../helpers/binaries';
import {
  initialFileTransferProgress,
  resetTransferProgress,
} from '../../helpers/fileTransfer';
import { createDisconnectedMtpState } from '../../helpers/mtpSession';

export const initialState = {
  focussedFileExplorerDeviceType: {
    accelerator: FILE_EXPLORER_DEFAULT_FOCUSSED_DEVICE_TYPE,
    onClick: FILE_EXPLORER_DEFAULT_FOCUSSED_DEVICE_TYPE,
    value: FILE_EXPLORER_DEFAULT_FOCUSSED_DEVICE_TYPE,
  },

  sidebarFavouriteList: {
    top: [
      {
        label: 'Home',
        path: PATHS.homeDir,
        icon: 'folder',
        enabled: true,
      },
      {
        label: 'Desktop',
        path: PATHS.desktopDir,
        icon: 'folder',
        enabled: true,
      },
      {
        label: 'Downloads',
        path: PATHS.downloadsDir,
        icon: 'folder',
        enabled: true,
      },
      {
        label: 'Removable Disks',
        path: PATHS.volumesDir,
        icon: 'folder',
        enabled: true,
      },
      {
        label: 'Root',
        path: PATHS.systemRootDir,
        icon: 'folder',
        enabled: true,
      },
    ],
    bottom: [],
  },

  toolbarList: {
    [DEVICE_TYPE.local]: {
      up: {
        enabled: true,
        label: 'Folder Up',
        icon: 'up',
        group: 'navigation',
      },
      refresh: {
        enabled: true,
        label: 'Refresh',
        icon: 'refresh',
        group: 'navigation',
      },
      delete: {
        enabled: true,
        label: 'Delete',
        icon: 'delete',
        group: 'selection',
      },
      multiSelect: {
        enabled: true,
        label: 'Multiple selection',
        icon: 'multiSelect',
        group: 'selection',
      },
      settings: {
        enabled: true,
        label: 'Settings',
        icon: 'settings',
        group: 'application',
      },
      faqs: {
        enabled: true,
        label: 'Help - FAQs',
        icon: 'faqs',
        group: 'application',
      },
    },
    [DEVICE_TYPE.mtp]: {
      up: {
        enabled: true,
        label: 'Folder Up',
        icon: 'up',
        group: 'navigation',
      },
      refresh: {
        enabled: true,
        label: 'Refresh',
        icon: 'refresh',
        group: 'navigation',
      },
      delete: {
        enabled: true,
        label: 'Delete',
        icon: 'delete',
        group: 'selection',
      },
      multiSelect: {
        enabled: true,
        label: 'Multiple selection',
        icon: 'multiSelect',
        group: 'selection',
      },
      storage: {
        enabled: true,
        label: 'Storage',
        icon: 'storage',
        group: 'device',
      },
      mtpMode: {
        enabled: isKalamModeSupported(),
        label: 'MTP Mode',
        icon: 'mtpMode',
        group: 'device',
      },
      settings: {
        enabled: true,
        label: 'Settings',
        icon: 'settings',
        group: 'application',
      },
    },
  },

  directoryLists: {
    [DEVICE_TYPE.local]: {
      order: 'asc',
      orderBy: 'name',
      queue: {
        selected: [],
      },
      nodes: [],
      isLoaded: false,
    },
    [DEVICE_TYPE.mtp]: {
      order: 'asc',
      orderBy: 'name',
      queue: {
        selected: [],
      },
      nodes: [],
      isLoaded: false,
    },
  },

  multiSelectMode: {
    [DEVICE_TYPE.local]: false,
    [DEVICE_TYPE.mtp]: false,
  },

  currentBrowsePath: {
    [DEVICE_TYPE.local]: DEVICES_DEFAULT_PATH.local,
    [DEVICE_TYPE.mtp]: DEVICES_DEFAULT_PATH.mtp,
  },

  mtpDevice: {
    isAvailable: false,
    error: null,
    isLoading: false,

    /**
     * params: {mtpDeviceInfo, usbDeviceInfo} - info
     *
     */
    info: {},
  },

  contextMenuList: {
    [DEVICE_TYPE.local]: {
      rename: {
        enabled: true,
        label: 'Rename',
        data: {},
      },
      copy: {
        enabled: true,
        label: 'Copy',
        data: {},
      },
      copyToQueue: {
        enabled: true,
        label: 'Copy to Queue',
        data: {},
      },
      paste: {
        enabled: true,
        label: 'Paste',
        data: {},
      },
      newFolder: {
        enabled: true,
        label: 'New Folder',
        data: {},
      },
      showInEnclosingFolder: {
        enabled: true,
        label: 'Open in Finder',
        data: {},
      },
    },
    [DEVICE_TYPE.mtp]: {
      rename: {
        enabled: true,
        label: 'Rename',
        data: {},
      },
      copy: {
        enabled: true,
        label: 'Copy',
        data: {},
      },
      copyToQueue: {
        enabled: true,
        label: 'Copy to Queue',
        data: {},
      },
      paste: {
        enabled: true,
        label: 'Paste',
        data: {},
      },
      newFolder: {
        enabled: true,
        label: 'New Folder',
        data: {},
      },
    },
  },

  /**
   * description - MTP Storage list
   *
   *    {
   *      string: { <----- storageId
   *        "name": string,
   *        "selected": boolean,
   *        "info": {} | undefined,
   *      }
   *    }
   *
   */
  mtpStoragesList: {},

  fileTransfer: {
    clipboard: {
      queue: [],
      source: null,
      sessionId: null,
      preparedAt: null,
    },
    progress: {
      ...initialFileTransferProgress,
    },
  },

  filesDrag: {
    sourceDeviceType: null,
    destinationDeviceType: null,
    enter: false,
    lock: false,
    sameSourceDestinationLock: false,
  },
};

export default function Home(state = initialState, action) {
  const { type, payload, deviceType = null } = action;

  switch (type) {
    case actionTypes.SET_FOCUSSED_FILE_EXPLORER_DEVICE_TYPE:
      return {
        ...state,
        focussedFileExplorerDeviceType: {
          ...state.focussedFileExplorerDeviceType,
          ...payload,
        },
      };

    case actionTypes.SET_SORTING_DIR_LISTS:
      return {
        ...state,
        directoryLists: {
          ...state.directoryLists,
          [deviceType]: {
            ...state.directoryLists[deviceType],
            ...payload,
          },
        },
      };

    case actionTypes.SET_SELECTED_DIR_LISTS:
      return {
        ...state,
        directoryLists: {
          ...state.directoryLists,
          [deviceType]: {
            ...state.directoryLists[deviceType],
            queue: {
              selected: payload.selected,
            },
          },
        },
      };

    case actionTypes.SET_MULTI_SELECT_MODE:
      return {
        ...state,
        multiSelectMode: {
          ...state.multiSelectMode,
          [deviceType]: payload,
        },
      };

    case actionTypes.SET_CURRENT_BROWSE_PATH:
      return {
        ...state,
        currentBrowsePath: {
          ...state.currentBrowsePath,
          [deviceType]: payload,
        },
      };

    case actionTypes.SET_MTP_STATUS:
      return {
        ...state,
        mtpDevice: {
          ...state.mtpDevice,
          ...payload,
        },
      };

    case actionTypes.RESET_MTP_SESSION:
      return createDisconnectedMtpState(state, {
        deviceType: DEVICE_TYPE.mtp,
        defaultPath: DEVICES_DEFAULT_PATH[DEVICE_TYPE.mtp],
        errorMessage: payload.errorMessage,
        disconnectedAt: payload.disconnectedAt,
      });

    case actionTypes.LIST_DIRECTORY:
      return {
        ...state,
        directoryLists: {
          ...state.directoryLists,
          [deviceType]: {
            ...state.directoryLists[deviceType],
            nodes: [...payload.nodes],
            isLoaded: payload.isLoaded,
          },
        },
      };

    case actionTypes.CHANGE_MTP_STORAGE:
      return {
        ...state,
        mtpStoragesList: {
          ...initialState.mtpStoragesList,
          ...payload,
        },
      };

    case actionTypes.SET_FILE_TRANSFER_CLIPBOARD:
      return {
        ...state,
        fileTransfer: {
          ...state.fileTransfer,
          clipboard: {
            ...payload,
          },
        },
      };

    case actionTypes.SET_FILE_TRANSFER_PROGRESS:
      return {
        ...state,
        fileTransfer: {
          ...state.fileTransfer,
          progress: {
            ...state.fileTransfer.progress,
            ...payload,
          },
        },
      };

    case actionTypes.CLEAR_FILE_TRANSFER_PROGRESS:
      return {
        ...state,
        fileTransfer: resetTransferProgress(state.fileTransfer),
      };

    case actionTypes.CLEAR_FILE_TRANSFER:
      return {
        ...state,
        fileTransfer: {
          ...initialState.fileTransfer,
        },
      };

    case actionTypes.SET_FILES_DRAG:
      return {
        ...state,
        filesDrag: {
          ...state.filesDrag,
          ...payload,
        },
      };

    case actionTypes.CLEAR_FILES_DRAG:
      return {
        ...state,
        filesDrag: {
          ...initialState.filesDrag,
        },
      };

    default:
      return state;
  }
}
