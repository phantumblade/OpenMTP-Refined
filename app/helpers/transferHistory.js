import Storage from '../classes/Storage';
import { PATHS } from '../constants/paths';
import { FILE_TRANSFER_PHASE } from './fileTransfer';

// The transfers that ended, newest first, kept in the profile folder so the
// Transfers panel can show them after a restart. Only what the panel shows
// is stored: no file names.

export const TRANSFER_HISTORY_LIMIT = 100;

const storage = new Storage(PATHS.transferHistoryFile, false);
const listeners = new Set();
let entries = null;

const load = () => {
  if (entries === null) {
    const saved = storage.getAll();

    entries = Array.isArray(saved?.entries) ? saved.entries : [];
  }

  return entries;
};

const save = (next) => {
  entries = next.slice(0, TRANSFER_HISTORY_LIMIT);
  storage.setAll({ entries });
  listeners.forEach((listener) => listener(entries));
};

export const getTransferHistory = () => load();

// One history entry from the progress of a transfer that just ended.
export const historyEntryFromProgress = (progress, now = Date.now()) => {
  const endedAt = progress.completedAt || now;

  return {
    id: progress.sessionId || `transfer-${endedAt}`,
    endedAt,
    status:
      progress.phase === FILE_TRANSFER_PHASE.completed ? 'completed' : 'failed',
    sourceDeviceType: progress.sourceDeviceType || null,
    destinationDeviceType: progress.destinationDeviceType || null,
    destinationFolder: progress.destinationFolder || null,
    itemCount: progress.itemCount || progress.totalFiles || 0,
    totalFileSize: progress.totalFileSize || 0,
    elapsedMs: progress.startedAt
      ? Math.max(0, endedAt - progress.startedAt)
      : 0,
    errorMessage:
      progress.phase === FILE_TRANSFER_PHASE.failed
        ? progress.errorMessage || null
        : null,
  };
};

export const addTransferHistoryEntry = (entry) => {
  save([entry, ...load().filter(({ id }) => id !== entry.id)]);
};

export const clearTransferHistory = () => {
  save([]);
};

export const subscribeToTransferHistory = (listener) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};
