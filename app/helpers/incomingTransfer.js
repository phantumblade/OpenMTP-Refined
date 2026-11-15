// What a running copy is bringing into a folder: the pane showing that
// folder lists these items right away (faded, each with its own progress
// ring) until the copy ends and the real listing takes over.

let incoming = null;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener(incoming));

export const subscribeIncomingTransfer = (listener) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

export const getIncomingTransfer = () => incoming;

// [items]: { name, path (where it comes from), isFolder, size }, in the
// order the copy takes them
export const setIncomingTransfer = ({
  sessionId,
  destinationDeviceType,
  destinationFolder,
  items,
}) => {
  incoming = { sessionId, destinationDeviceType, destinationFolder, items };
  notify();
};

export const clearIncomingTransfer = (sessionId) => {
  if (incoming && (!sessionId || incoming.sessionId === sessionId)) {
    incoming = null;
    notify();
  }
};

// How far an incoming item is, from the copy's progress: items before the
// one being copied are done, the next ones wait. A folder being copied has
// no progress of its own (its files aren't counted), so it spins.
export const incomingItemState = ({ index, items, progress, done }) => {
  if (done) {
    return { status: 'done', value: 100 };
  }

  const current = String(progress?.currentFile || '');
  const at = current
    ? items.findIndex(
        (item) => current === item.path || current.startsWith(`${item.path}/`)
      )
    : -1;

  if (at < 0 || index > at) {
    return { status: 'waiting', value: 0 };
  }

  if (index < at) {
    return { status: 'done', value: 100 };
  }

  if (items[index].isFolder) {
    return { status: 'active', value: null };
  }

  return {
    status: 'active',
    value: Math.max(0, Math.min(100, Number(progress.activeFileProgress) || 0)),
  };
};
