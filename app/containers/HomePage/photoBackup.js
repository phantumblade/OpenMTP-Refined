import fs from 'fs';
import {
  actionTypes,
  getSelectedStorageIdFromState,
  listDirectory,
} from './actions';
import { setCommonSettings } from '../Settings/actions';
import fileExplorerController from '../../data/file-explorer/controllers/FileExplorerController';
import { DEVICE_TYPE, FILE_TRANSFER_DIRECTION } from '../../enums';
import { DEVICES_LABEL } from '../../constants';
import { PATHS } from '../../constants/paths';
import {
  FILE_TRANSFER_PHASE,
  createTransferSessionId,
  initialFileTransferProgress,
  isTransferPhaseActive,
  normalizeTransferError,
} from '../../helpers/fileTransfer';
import {
  PHOTO_BACKUP_SOURCE,
  planPhotoBackup,
  planTotals,
} from '../../helpers/photoBackupPlan';
import { getRemoteWindow } from '../../helpers/remoteWindowHelpers';
import { translate } from '../../i18n';
import { log } from '../../utils/log';

const remote = getRemoteWindow();

// name -> size of the files of a Mac folder (empty if it doesn't exist yet)
const localFiles = (dir) => {
  const files = new Map();

  try {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      if (entry.isFile()) {
        files.set(entry.name, fs.statSync(`${dir}/${entry.name}`).size);
      }
    });
  } catch (e) {
    // a folder that isn't there has nothing in it
  }

  return files;
};

// Asks where the backup goes (the first time, or to change it).
export const choosePhotoBackupFolder = async (appLanguage) => {
  const t = (key) => translate(appLanguage, key);
  const { canceled, filePaths } = await remote.dialog.showOpenDialog(
    remote.getCurrentWindow(),
    {
      title: t('Photo backup folder'),
      message: t('Choose the Mac folder where the phone’s photos are copied.'),
      buttonLabel: t('Use this folder'),
      defaultPath: PATHS.picturesDir,
      properties: ['openDirectory', 'createDirectory'],
    }
  );

  return canceled || !filePaths?.[0] ? null : filePaths[0];
};

// Copies to the Mac the photos and videos of the phone's camera folder that
// the backup folder doesn't have yet, keeping the phone's sub-folders. It
// reports through the same transfer progress as a normal copy, so the dialog,
// the Transfers panel, the history and the notification all apply.
export function runPhotoBackup({ destinationRoot }) {
  return async (dispatch, getState) => {
    const { Home, Settings } = getState();
    const { appLanguage, hideHiddenFiles } = Settings;
    const t = (key, values) => translate(appLanguage, key, values);

    if (
      !Home.mtpDevice.isAvailable ||
      isTransferPhaseActive(Home.fileTransfer.progress.phase)
    ) {
      return;
    }

    const storageId = getSelectedStorageIdFromState(Home);
    const startedAt = Date.now();
    const sourceLabel = t(DEVICES_LABEL[DEVICE_TYPE.mtp]);
    const destinationLabel = t(DEVICES_LABEL[DEVICE_TYPE.local]);
    const appWindow = remote.getCurrentWindow();
    let latest = {
      ...initialFileTransferProgress,
      toggle: true,
      sessionId: createTransferSessionId(),
      phase: FILE_TRANSFER_PHASE.checking,
      route: `${sourceLabel} → ${destinationLabel}`,
      sourceLabel,
      destinationLabel,
      sourceDeviceType: DEVICE_TYPE.mtp,
      destinationDeviceType: DEVICE_TYPE.local,
      destinationFolder: destinationRoot,
      startedAt,
    };
    let lastDispatchAt = 0;

    const publish = (updates, force = true) => {
      const now = Date.now();

      latest = { ...latest, ...updates, lastActivityAt: now };

      if (force || now - lastDispatchAt >= 120) {
        lastDispatchAt = now;
        dispatch({
          type: actionTypes.SET_FILE_TRANSFER_PROGRESS,
          payload: latest,
        });
      }
    };

    const end = (phase, updates = {}) => {
      appWindow.setProgressBar(-1);
      publish({ phase, completedAt: Date.now(), ...updates });
    };

    publish({});

    try {
      // 1. the phone's camera tree
      const phoneFolders = [];
      const pending = [PHOTO_BACKUP_SOURCE];

      while (pending.length > 0) {
        const dir = pending.shift();
        const { error, stderr, data } =
          // eslint-disable-next-line no-await-in-loop
          await fileExplorerController.listFilesForSearch({
            deviceType: DEVICE_TYPE.mtp,
            filePath: dir,
            ignoreHidden: true,
            storageId,
          });

        if (error || stderr || !Array.isArray(data)) {
          end(FILE_TRANSFER_PHASE.failed, {
            errorMessage:
              dir === PHOTO_BACKUP_SOURCE
                ? t('The phone’s camera folder (DCIM) could not be read.')
                : normalizeTransferError(error || stderr),
          });

          return;
        }

        phoneFolders.push({
          dir,
          files: data
            .filter((item) => !item.isFolder)
            .map(({ name, path, size }) => ({ name, path, size })),
        });
        data
          .filter((item) => item.isFolder)
          .forEach((item) => pending.push(item.path));
        publish({ currentFile: dir });
      }

      // 2. what the Mac doesn't have yet
      const plan = planPhotoBackup({
        phoneFolders,
        destinationRoot,
        localFiles,
      });
      const totals = planTotals(plan);
      const note =
        totals.conflicts > 0
          ? t(
              '{count} files have the same name as a different file already in the backup: they were left untouched.',
              { count: totals.conflicts }
            )
          : null;

      if (totals.files < 1) {
        end(FILE_TRANSFER_PHASE.completed, {
          totalFileProgress: 100,
          note: [t('Everything is already backed up: no new files.'), note]
            .filter(Boolean)
            .join(' '),
        });

        return;
      }

      publish({
        phase: FILE_TRANSFER_PHASE.preparing,
        itemCount: totals.files,
        totalFiles: totals.files,
        totalFileSize: totals.bytes,
      });
      appWindow.setProgressBar(0);

      // 3. one copy per folder, so the phone's sub-folders are kept
      // copies one folder; [doneFiles]/[doneBytes] are what earlier folders
      // already copied, so the progress covers the whole backup
      const copyStep = (step, doneFiles, doneBytes) =>
        new Promise((resolve) => {
          let settled = false;
          const settle = (value) => {
            if (!settled) {
              settled = true;
              resolve(value);
            }
          };

          fileExplorerController
            .transferFiles({
              deviceType: DEVICE_TYPE.mtp,
              destination: step.localDir,
              storageId,
              fileList: step.files,
              direction: FILE_TRANSFER_DIRECTION.download,
              onPreprocess: ({ fullPath }) => {
                publish({ currentFile: fullPath }, false);
              },
              onProgress: (progress) => {
                const sentBytes = doneBytes + (progress.totalFileSizeSent || 0);
                const sentFiles = doneFiles + (progress.filesSent || 0);
                const share =
                  totals.bytes > 0 && progress.totalFileSizeSent
                    ? sentBytes / totals.bytes
                    : sentFiles / totals.files;
                const speed = Number.parseFloat(progress.speed) || 0;

                publish(
                  {
                    phase: FILE_TRANSFER_PHASE.transferring,
                    currentFile: progress.currentFile,
                    speed: speed ? speed.toFixed(2) : null,
                    filesSent: sentFiles,
                    totalFileSizeSent: sentBytes,
                    activeFileProgress: progress.activeFileProgress || 0,
                    totalFileProgress: Math.min(100, share * 100),
                  },
                  false
                );
                appWindow.setProgressBar(Math.max(0, Math.min(1, share)));
              },
              onError: ({ error, stderr }) =>
                settle({ error: error || stderr || 'Unknown transfer error' }),
              onCompleted: () => settle({}),
            })
            .then((outcome) =>
              outcome?.error || outcome?.stderr
                ? settle({ error: outcome.error || outcome.stderr })
                : null
            )
            .catch((error) => settle({ error }));
        });

      let doneFiles = 0;
      let doneBytes = 0;
      const steps = plan.filter(({ files }) => files.length > 0);

      for (let index = 0; index < steps.length; index += 1) {
        const step = steps[index];

        fs.mkdirSync(step.localDir, { recursive: true });

        // eslint-disable-next-line no-await-in-loop
        const result = await copyStep(step, doneFiles, doneBytes);

        if (result.error) {
          end(FILE_TRANSFER_PHASE.failed, {
            errorMessage: normalizeTransferError(result.error),
          });

          return;
        }

        doneFiles += step.files.length;
        doneBytes += step.bytes;
      }

      end(FILE_TRANSFER_PHASE.completed, {
        filesSent: totals.files,
        totalFileSizeSent: totals.bytes,
        activeFileProgress: 100,
        totalFileProgress: 100,
        note,
      });

      // show the new files if the Mac pane is looking at the backup
      const { currentBrowsePath } = getState().Home;

      dispatch(
        listDirectory(
          {
            filePath: currentBrowsePath[DEVICE_TYPE.local],
            ignoreHidden: hideHiddenFiles[DEVICE_TYPE.local],
          },
          DEVICE_TYPE.local,
          getState
        )
      );
    } catch (e) {
      log.error(e, 'photoBackup -> runPhotoBackup');
      end(FILE_TRANSFER_PHASE.failed, {
        errorMessage: normalizeTransferError(e),
      });
    }
  };
}

// The toolbar button: asks for the folder the first time, then every click
// just runs the backup. [chooseFolder] forces the question (to change it).
export function startPhotoBackup({ chooseFolder = false } = {}) {
  return async (dispatch, getState) => {
    const { appLanguage, photoBackupFolder } = getState().Settings;
    let destinationRoot = photoBackupFolder;

    if (chooseFolder || !destinationRoot) {
      destinationRoot = await choosePhotoBackupFolder(appLanguage);

      if (!destinationRoot) {
        return;
      }

      dispatch(
        setCommonSettings(
          { key: 'photoBackupFolder', value: destinationRoot },
          DEVICE_TYPE.mtp,
          getState
        )
      );
    }

    dispatch(runPhotoBackup({ destinationRoot }));
  };
}
