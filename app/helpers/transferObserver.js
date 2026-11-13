import { isTransferPhaseTerminal, FILE_TRANSFER_PHASE } from './fileTransfer';
import {
  addTransferHistoryEntry,
  historyEntryFromProgress,
} from './transferHistory';
import { getAppLanguageSetting } from './settings';
import { translate } from '../i18n';
import { niceBytes } from '../utils/funcs';
import { log } from '../utils/log';

// A copy that takes a while is usually left alone: tell the user when it
// ends, unless they are looking at the app with the dialog open.
const notifyTransferEnded = (progress) => {
  if (document.hasFocus() && !progress.minimized) {
    return;
  }

  const language = getAppLanguageSetting();
  const completed = progress.phase === FILE_TRANSFER_PHASE.completed;
  const count = progress.itemCount || progress.totalFiles || 0;
  const details = [
    `${count} ${translate(language, count === 1 ? 'item' : 'items')}`,
    progress.totalFileSize > 0 ? niceBytes(progress.totalFileSize) : null,
    progress.route,
  ].filter(Boolean);

  try {
    const notification = new Notification(
      translate(language, completed ? 'Transfer completed' : 'Transfer failed'),
      {
        body: completed
          ? details.join(' · ')
          : progress.errorMessage || details.join(' · '),
        silent: false,
      }
    );

    notification.onclick = () => window.focus();
  } catch (e) {
    log.error(e, 'transferObserver -> notifyTransferEnded');
  }
};

// Records every transfer that ends in the history and notifies the user.
export const observeTransfers = (store) => {
  let recordedSessionId = null;

  return store.subscribe(() => {
    const progress = store.getState()?.Home?.fileTransfer?.progress;

    if (
      !progress?.sessionId ||
      progress.sessionId === recordedSessionId ||
      !isTransferPhaseTerminal(progress.phase)
    ) {
      return;
    }

    recordedSessionId = progress.sessionId;

    try {
      addTransferHistoryEntry(historyEntryFromProgress(progress));
      notifyTransferEnded(progress);
    } catch (e) {
      log.error(e, 'transferObserver -> observeTransfers');
    }
  });
};
