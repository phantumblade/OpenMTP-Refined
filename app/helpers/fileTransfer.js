export const FILE_TRANSFER_PHASE = {
  idle: 'idle',
  checking: 'checking',
  waitingForConfirmation: 'waitingForConfirmation',
  preparing: 'preparing',
  transferring: 'transferring',
  completed: 'completed',
  failed: 'failed',
};

const activePhases = new Set([
  FILE_TRANSFER_PHASE.checking,
  FILE_TRANSFER_PHASE.waitingForConfirmation,
  FILE_TRANSFER_PHASE.preparing,
  FILE_TRANSFER_PHASE.transferring,
]);

export const initialFileTransferProgress = {
  toggle: false,
  sessionId: null,
  phase: FILE_TRANSFER_PHASE.idle,
  route: null,
  sourceLabel: null,
  destinationLabel: null,
  destinationFolder: null,
  itemCount: 0,
  processedItems: 0,
  currentFile: null,
  activeFileProgress: 0,
  activeFileSize: 0,
  activeFileSizeSent: 0,
  totalFiles: 0,
  filesSent: 0,
  totalFileProgress: 0,
  totalFileSize: 0,
  totalFileSizeSent: 0,
  speed: null,
  elapsedTime: null,
  startedAt: null,
  lastActivityAt: null,
  completedAt: null,
  errorMessage: null,
};

export function createTransferSessionId(
  now = Date.now(),
  random = Math.random()
) {
  const timePart = Number(now).toString(36);
  const randomPart = Math.floor(random * 0xffffff)
    .toString(36)
    .padStart(5, '0');

  return `transfer-${timePart}-${randomPart}`;
}

export function isTransferPhaseActive(phase) {
  return activePhases.has(phase);
}

export function isTransferPhaseTerminal(phase) {
  return [FILE_TRANSFER_PHASE.completed, FILE_TRANSFER_PHASE.failed].includes(
    phase
  );
}

export function normalizeTransferError(
  error,
  fallback = 'Unknown transfer error'
) {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (error && typeof error === 'object') {
    if (error.message) {
      return error.message.toString();
    }

    try {
      return JSON.stringify(error);
    } catch (_) {
      return fallback;
    }
  }

  return error?.toString?.() || fallback;
}

export function isFatalMtpTransportError(error, stderr) {
  const errorText = [normalizeTransferError(error, ''), stderr || '']
    .join(' ')
    .toUpperCase();

  return /LIBUSB_ERROR_[A-Z_]+/.test(errorText) || /\bEOF\b/.test(errorText);
}

export function transferStepStates(phase) {
  const order = [
    FILE_TRANSFER_PHASE.checking,
    FILE_TRANSFER_PHASE.preparing,
    FILE_TRANSFER_PHASE.transferring,
  ];
  const effectivePhase =
    phase === FILE_TRANSFER_PHASE.completed
      ? FILE_TRANSFER_PHASE.transferring
      : phase;
  const activeIndex = order.indexOf(effectivePhase);

  return order.map((step, index) => ({
    step,
    active: phase !== FILE_TRANSFER_PHASE.completed && index === activeIndex,
    complete:
      phase === FILE_TRANSFER_PHASE.completed ||
      (activeIndex > -1 && index < activeIndex),
    failed: phase === FILE_TRANSFER_PHASE.failed && index === 0,
  }));
}

export function resetTransferProgress(fileTransfer) {
  return {
    ...fileTransfer,
    progress: {
      ...initialFileTransferProgress,
    },
  };
}
