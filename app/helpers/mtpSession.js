import { FILE_TRANSFER_PHASE, isTransferPhaseActive } from './fileTransfer';

export function createDisconnectedMtpState(
  state,
  { deviceType, defaultPath, errorMessage = null, disconnectedAt = Date.now() }
) {
  const transferProgress = state.fileTransfer.progress;
  const nextTransferProgress = isTransferPhaseActive(transferProgress.phase)
    ? {
        ...transferProgress,
        toggle: true,
        phase: FILE_TRANSFER_PHASE.failed,
        errorMessage,
        lastActivityAt: disconnectedAt,
        completedAt: disconnectedAt,
      }
    : transferProgress;

  return {
    ...state,
    currentBrowsePath: {
      ...state.currentBrowsePath,
      [deviceType]: defaultPath,
    },
    directoryLists: {
      ...state.directoryLists,
      [deviceType]: {
        ...state.directoryLists[deviceType],
        nodes: [],
        isLoaded: true,
        queue: { selected: [] },
      },
    },
    multiSelectMode: {
      ...state.multiSelectMode,
      [deviceType]: false,
    },
    mtpDevice: {
      isAvailable: false,
      error: null,
      isLoading: false,
      info: {},
    },
    mtpStoragesList: {},
    filesDrag: {
      sourceDeviceType: null,
      destinationDeviceType: null,
      enter: false,
      lock: false,
      sameSourceDestinationLock: false,
    },
    fileTransfer: {
      ...state.fileTransfer,
      progress: nextTransferProgress,
    },
  };
}
