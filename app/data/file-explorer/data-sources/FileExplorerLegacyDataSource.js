import path from 'path';
import { execFile, spawn } from 'child_process';
import { log } from '../../../utils/log';
import {
  isArray,
  isEmpty,
  percentage,
  splitIntoLines,
  undefinedOrNull,
} from '../../../utils/funcs';
import { DEVICES_LABEL } from '../../../constants';
import { DEVICE_TYPE, FILE_TRANSFER_DIRECTION } from '../../../enums';
import { baseName, getExtension } from '../../../utils/files';
import { mtpCliPath } from '../../../helpers/binaries';
import { msToTime, unixTimestampNow } from '../../../utils/date';
import { checkIf } from '../../../utils/checkIf';
import { MTP_CLI_ARGS } from '../../../helpers/mtpCliArgs';

// `lsext` prints one line per file: Node's default 1 MB limit is reached by
// a folder with ~12k photos and the listing then fails.
const MTP_CLI_MAX_BUFFER = 256 * 1024 * 1024;

export class FileExplorerLegacyDataSource {
  // mtp-cli runs without a shell: phone file names reach it as plain
  // arguments (helpers/mtpCliArgs) and can never be run as commands
  _execCallback(args, callback) {
    execFile(mtpCliPath, args, { maxBuffer: MTP_CLI_MAX_BUFFER }, callback);
  }

  _filterOutMtpLines(string, index) {
    return (
      this._filterJunkMtpErrors(string) ||
      (index < 2 && string.toLowerCase().indexOf(`selected storage`) !== -1)
    );
  }

  _filterJunkMtpErrors(string) {
    return (
      string === '\n' ||
      string === '\r\n' ||
      string === '' ||
      string.toLowerCase().indexOf(`device::find failed`) !== -1 ||
      string.toLowerCase().indexOf(`iocreateplugininterfaceforservice`) !==
        -1 ||
      string.toLowerCase().indexOf(`Device::Find failed`) !== -1
    );
  }

  _cleanJunkMtpError({ error = null, stdout = null, stderr = null }) {
    const splittedError = splitIntoLines(error);
    const filteredError = splittedError
      ? splittedError.filter((a) => !this._filterJunkMtpErrors(a))
      : [];

    const splittedStderr = splitIntoLines(stderr);
    const filteredStderr = splittedStderr
      ? splittedStderr.filter((a) => !this._filterJunkMtpErrors(a))
      : [];

    return {
      filteredError,
      filteredStderr,
      filteredStdout: stdout,
    };
  }

  async _exec(args) {
    try {
      return new Promise((resolve) => {
        this._execCallback(args, (error, stdout, stderr) => {
          const { filteredStderr, filteredError, filteredStdout } =
            this._cleanJunkMtpError({ error, stdout, stderr });

          if (
            (undefinedOrNull(filteredStderr) || filteredStderr.length < 1) &&
            (undefinedOrNull(filteredError) || filteredError.length < 1)
          ) {
            return resolve({
              data: filteredStdout,
              stderr: null,
              error: null,
            });
          }

          return resolve({
            data: filteredStdout,
            stderr: filteredStderr.join('\n'),
            error: filteredError.join('\n'),
          });
        });
      });
    } catch (e) {
      log.error(e);
    }
  }

  async _execNoCatch(args) {
    return new Promise((resolve) => {
      this._execCallback(args, (error, stdout, stderr) => {
        const { filteredStderr, filteredError, filteredStdout } =
          this._cleanJunkMtpError({ error, stdout, stderr });

        if (
          (undefinedOrNull(filteredStderr) || filteredStderr.length < 1) &&
          (undefinedOrNull(filteredError) || filteredError.length < 1)
        ) {
          return resolve({
            data: filteredStdout,
            stderr: null,
            error: null,
          });
        }

        return resolve({
          data: stdout,
          stderr,
          error,
        });
      });
    });
  }

  async _checkMtpFileExists(filePath, storageId) {
    const { stderr } = await this._execNoCatch(
      MTP_CLI_ARGS.properties(storageId, filePath)
    );

    return !stderr;
  }

  /**
   * description - file transfer helper
   *
   * @param {[string]} cmdArgs - command line strings in an array
   * @param {errorCallback} onError
   * @param {progressCallback} onProgress
   * @param {completedCallback} onCompleted
   * @return {Promise<{data: boolean, error: string|null, stderr: string|null}>}
   * @private
   */
  async _transferFiles({ cmdArgs, onError, onProgress, onCompleted }) {
    try {
      checkIf(cmdArgs, 'array');
      checkIf(onError, 'function');
      checkIf(onProgress, 'function');
      checkIf(onCompleted, 'function');

      const handletransferListTimeInterval = 1000;
      let transferList = {};
      let prevCopiedBlockSize = 0;
      let currentCopiedBlockSize = 0;
      let startTime = 0;
      let prevCopiedTime = 0;
      let currentCopiedTime = 0;
      let pendingOutput = '';
      let outputLineIndex = 0;
      let settled = false;

      const stopProgress = () => {
        transferList = null;

        if (handleTransferListInterval) {
          clearInterval(handleTransferListInterval);
          handleTransferListInterval = 0;
        }
      };

      const finishWithError = (error) => {
        if (settled) {
          return;
        }

        settled = true;
        stopProgress();
        onError({ error, stderr: null, data: null });
      };

      const finishSuccessfully = () => {
        if (settled) {
          return;
        }

        settled = true;
        stopProgress();
        onCompleted();
      };

      let handleTransferListInterval = setInterval(() => {
        if (transferList === null) {
          clearInterval(handleTransferListInterval);
          handleTransferListInterval = 0;

          return null;
        }

        if (Object.keys(transferList).length < 1) {
          return null;
        }

        const {
          percentage: _percentage,
          currentFile,
          activeFileSize,
          activeFileSizeSent,
        } = transferList;

        const copiedTimeDiff = currentCopiedTime - prevCopiedTime;
        const speed =
          prevCopiedBlockSize &&
          prevCopiedBlockSize - currentCopiedBlockSize > 0
            ? (prevCopiedBlockSize - currentCopiedBlockSize) *
              (1000 / copiedTimeDiff)
            : 0;
        const elapsedTime = msToTime(currentCopiedTime - startTime);

        prevCopiedTime = currentCopiedTime;
        prevCopiedBlockSize = currentCopiedBlockSize;

        onProgress({
          elapsedTime,
          speed,
          activeFileProgress: _percentage,
          currentFile,
          activeFileSize,
          activeFileSizeSent,
        });
      }, handletransferListTimeInterval);

      const cmd = spawn(mtpCliPath, cmdArgs);

      cmd.stdout.on('data', (data) => {
        if (startTime === 0) {
          startTime = unixTimestampNow();
        }

        // a chunk may end in the middle of a line: keep the partial line
        // for the next chunk instead of parsing half a progress event
        const lines = `${pendingOutput}${data.toString()}`.split(/\r?\n/);

        pendingOutput = lines.pop();

        const _bufferedOutput = lines.filter((a) => {
          const index = outputLineIndex;

          outputLineIndex += 1;

          return !this._filterOutMtpLines(a, index);
        });

        // one unparsable line must not drop the rest of the chunk
        for (let i = 0; i < _bufferedOutput.length; i += 1) {
          const item = _bufferedOutput[i];
          const bufferedOutputSplit = item.split(' ');

          const totalLength = bufferedOutputSplit.length;
          const eventIndex = 0;
          const filePathStartIndex = 1;
          const filePathEndIndex = totalLength - 3;
          const currentProgressSizeIndex = totalLength - 2;
          const totalFileSizeIndex = totalLength - 1;

          const event = bufferedOutputSplit[eventIndex];
          const matchedItem = item.match(/(\d+?\d*)\s(\d+?\d*)$/);

          if (matchedItem === null) {
            continue; // eslint-disable-line no-continue
          }

          const matchedItemSplit = matchedItem[0].split(' ');
          const currentProgressSize = parseInt(matchedItemSplit[0], 10);
          const totalFileSize = parseInt(matchedItemSplit[1], 10);

          if (event === `:done`) {
            prevCopiedBlockSize = 0;
            currentCopiedBlockSize = 0;
            prevCopiedTime = 0;
            currentCopiedTime = 0;

            continue; // eslint-disable-line no-continue
          }

          if (
            totalLength < 3 ||
            event !== `:progress` ||
            currentProgressSizeIndex < 2 ||
            totalFileSizeIndex < 3
          ) {
            continue; // eslint-disable-line no-continue
          }

          const filePath = bufferedOutputSplit
            .slice(filePathStartIndex, filePathEndIndex + 1)
            .join(' ');

          const perc = percentage(currentProgressSize, totalFileSize);

          currentCopiedBlockSize = totalFileSize - currentProgressSize;
          currentCopiedTime = unixTimestampNow();

          transferList = {
            currentFile: filePath,
            activeFileSize: totalFileSize,
            activeFileSizeSent: currentProgressSize,
            percentage: perc,
            currentCopiedBlockSize,
            currentCopiedTime,
          };
        }
      });

      // capture error
      cmd.stderr.on('data', (error) => {
        const { filteredError } = this._cleanJunkMtpError({ error });

        if (undefinedOrNull(filteredError) || filteredError.length < 1) {
          return null;
        }

        finishWithError(filteredError || error);
      });

      cmd.on('error', finishWithError);

      cmd.on('exit', (code, signal) => {
        if (code === 0) {
          finishSuccessfully();

          return;
        }

        finishWithError(
          `MTP transfer process stopped with code ${code ?? 'unknown'}${
            signal ? ` (${signal})` : ''
          }`
        );
      });

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: null, stderr: null, data: false };
    }
  }

  /**
   * description - Fetch MTP storages
   *
   * @return {Promise<{data: object|boolean, error: string|null, stderr: string|null}>}
   */
  async listStorages() {
    try {
      const { data, error, stderr } = await this._exec(
        MTP_CLI_ARGS.storageList()
      );

      if (error || stderr) {
        log.error(
          `${error} : ${stderr}`,
          `FileExplorerLegacyDataSource.listStorages -> storage-list error`,
          false
        );

        return { error, stderr, data: null };
      }

      const _storageList = splitIntoLines(data);

      const descMatchPattern = /description:(.*)/i;
      const storageIdMatchPattern = /([^\D]+)/;

      const storageList = {};

      _storageList
        .filter((a, index) => !this._filterOutMtpLines(a, index))
        .forEach((a, index) => {
          if (!a) {
            return;
          }

          const _matchDesc = descMatchPattern.exec(a);
          const _matchedStorageIds = storageIdMatchPattern.exec(a);

          if (
            undefinedOrNull(_matchDesc) ||
            undefinedOrNull(_matchDesc[1]) ||
            undefinedOrNull(_matchedStorageIds) ||
            undefinedOrNull(_matchedStorageIds[1])
          ) {
            return;
          }

          const matchDesc = _matchDesc[1].trim();
          const matchedStorageId = parseInt(_matchedStorageIds[1].trim(), 10);

          storageList[matchedStorageId] = {
            name: matchDesc,
            selected: index === 0,
          };
        });

      if (Object.keys(storageList).length < 1) {
        return {
          error: `${DEVICES_LABEL[DEVICE_TYPE.mtp]} storage not accessible`,
          stderr: null,
          data: null,
        };
      }

      return { error: null, stderr: null, data: storageList };
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }

  /**
   * description - Fetch device files in the path
   *
   * @param filePath
   * @param ignoreHidden
   * @param storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ filePath, ignoreHidden, storageId }) {
    try {
      const mtpCmdChopIndex = {
        type: 2,
        dateAdded: 4,
        timeAdded: 5,
      };
      const response = [];
      const {
        data: filePropsData,
        error: filePropsError,
        stderr: filePropsStderr,
      } = await this._exec(MTP_CLI_ARGS.listFiles(storageId, filePath));

      if (filePropsError || filePropsStderr) {
        log.error(
          `${filePropsError} : ${filePropsStderr}`,
          `listFiles -> lsext error`
        );

        return { error: filePropsError, stderr: filePropsStderr, data: null };
      }

      let fileProps = splitIntoLines(filePropsData);
      const responsePaths = new Set();

      fileProps = fileProps.filter(
        (a, index) => !this._filterOutMtpLines(a, index)
      );

      for (let i = 0; i < fileProps.length; i += 1) {
        const item = fileProps[i];
        const matchedProps = item.match(
          /^(.*?)\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/g
        );

        if (matchedProps === null || matchedProps.length < 1) {
          continue; // eslint-disable-line no-continue
        }

        const _matchedProps = matchedProps[0];
        const itemSplit = item.split(_matchedProps);

        if (itemSplit === null || itemSplit.length < 2 || itemSplit[1] === '') {
          continue; // eslint-disable-line no-continue
        }

        const matchedFileName = itemSplit[1].replace(/^\s{2}|\s$/g, '');
        const filePropsList = _matchedProps.replace(/\s\s+/g, ' ').split(' ');

        // eslint-disable-next-line no-useless-escape
        if (ignoreHidden && /(^|\/)\.[^\/\.]/g.test(matchedFileName)) {
          continue; // eslint-disable-line no-continue
        }

        const fullPath = path.resolve(filePath, matchedFileName);
        const isFolder = filePropsList[mtpCmdChopIndex.type] === '3001';
        const dateTime = `${filePropsList[mtpCmdChopIndex.dateAdded]} ${
          filePropsList[mtpCmdChopIndex.timeAdded]
        }`;
        const extension = getExtension(fullPath, isFolder);

        // avoid duplicate values
        if (responsePaths.has(fullPath)) {
          continue; // eslint-disable-line no-continue
        }

        responsePaths.add(fullPath);

        response.push({
          name: matchedFileName,
          path: fullPath,
          extension,
          size: null,
          isFolder,
          dateAdded: dateTime,
          dateModified: dateTime,
        });
      }

      return { error: null, stderr: null, data: response };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: null };
    }
  }

  /**
   * description - Rename a device file
   *
   * @param filePath
   * @param newFilename
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ filePath, newFilename, storageId }) {
    try {
      if (undefinedOrNull(filePath) || undefinedOrNull(newFilename)) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const { error, stderr } = await this._exec(
        MTP_CLI_ARGS.rename(storageId, filePath, newFilename)
      );

      if (error || stderr) {
        log.error(
          `${error} : ${stderr}`,
          `FileExplorerLegacyDataSource.renameFile -> rename error`
        );

        return { error, stderr, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Delete device files
   *
   * @param fileList
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ fileList, storageId }) {
    try {
      if (!fileList || fileList.length < 1) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      for (let i = 0; i < fileList.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const { error, stderr } = await this._exec(
          MTP_CLI_ARGS.remove(storageId, fileList[i])
        );

        if (error || stderr) {
          log.error(
            `${error} : ${stderr}`,
            `FileExplorerLegacyDataSource.deleteFiles -> rm error`
          );

          return { error, stderr, data: false };
        }
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Create a device directory
   *
   * @param filePath
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ filePath, storageId }) {
    try {
      if (undefinedOrNull(filePath)) {
        return { error: `Invalid path.`, stderr: null, data: null };
      }

      const { error, stderr } = await this._exec(
        MTP_CLI_ARGS.makeDirectory(storageId, filePath)
      );

      if (error || stderr) {
        log.error(
          `${error} : ${stderr}`,
          `FileExplorerLegacyDataSource.makeDirectory -> mkpath error`
        );

        return { error, stderr, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Check if files exist in the device
   *
   * @param {[string]} fileList
   * @param {string} storageId
   * @return {Promise<boolean>}
   */
  async filesExist({ fileList, storageId }) {
    try {
      if (!isArray(fileList)) {
        return false;
      }

      if (isEmpty(fileList)) {
        return false;
      }

      for (let i = 0; i < fileList.length; i += 1) {
        const item = fileList[i];
        const fullPath = path.resolve(item);

        // eslint-disable-next-line no-await-in-loop
        if (await this._checkMtpFileExists(fullPath, storageId)) {
          return true;
        }
      }

      return false;
    } catch (e) {
      log.error(e);

      return false;
    }
  }

  /**
   * @typedef {function(errorCallbackInfo)} errorCallback
   * @callback errorCallback
   * @param {errorCallbackInfo} args - error object
   */

  /**
   * @typedef {Object} errorCallbackInfo
   * @property {string} error - error text
   * @property {string} stderr - std error text
   * @property {null} data - data
   */

  /**
   * @typedef {function(progressCallbackInfo)} progressCallback
   * @callback progressCallback
   * @param {progressCallbackInfo} args - progress object
   */

  /**
   * @typedef {Object} progressCallbackInfo
   * @property {number} activeFileSize - total size of the current file
   * @property {number} activeFileSizeSent - total bytes of the current file transferred
   * @property {number} activeFileProgress - progress of the current file
   * @property {string} currentFile - current file
   * @property {int} speed - speed in bytes
   * @property {string} elapsedTime - elapsed time
   */

  /**
   * @typedef {function()} completedCallback
   * @callback completedCallback
   */

  /**
   * description - Upload or download files from MTP device to local or vice versa
   *
   * @param {string} destination
   * @param {'upload'|'download'} direction
   * @param {[string]} fileList
   * @param {string} storageId
   * @param {errorCallback} onError
   * @param {progressCallback} onProgress
   * @param {completedCallback} onCompleted
   *
   * @return
   */
  async transferFiles({
    destination,
    fileList,
    direction,
    storageId,
    onError,
    onProgress,
    onCompleted,
  }) {
    checkIf(onError, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    try {
      if (undefinedOrNull(destination)) {
        onError({
          error: `Invalid path`,
          stderr: null,
          data: null,
        });

        return;
      }

      if (isEmpty(fileList) || !isArray(fileList)) {
        onError({
          error: `No files selected`,
          stderr: null,
          data: null,
        });

        return;
      }

      let cmdArgs = [];

      switch (direction) {
        case FILE_TRANSFER_DIRECTION.download:
          cmdArgs = (fileList ?? []).flatMap((sourcePath) =>
            MTP_CLI_ARGS.download(
              storageId,
              sourcePath,
              `${path.resolve(destination)}/${baseName(sourcePath)}`
            )
          );

          return this._transferFiles({
            cmdArgs,
            onError,
            onProgress,
            onCompleted,
          });

        case FILE_TRANSFER_DIRECTION.upload:
          cmdArgs = (fileList ?? []).flatMap((sourcePath) =>
            MTP_CLI_ARGS.upload(
              storageId,
              sourcePath,
              path.resolve(destination)
            )
          );

          return this._transferFiles({
            cmdArgs,
            onError,
            onProgress,
            onCompleted,
          });

        default:
          break;
      }
    } catch (e) {
      log.error(e);
    }
  }

  /**
   * description: fetch the required data for generating bug/error reports
   *
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async fetchDebugReport() {
    try {
      const { data, error, stderr } = await this._exec(
        MTP_CLI_ARGS.debugReport()
      );

      if (error) {
        log.doLog(error, `FileExplorerLegacyDataSource.fetchDebugReport.error`);

        return { error, stderr, data: null };
      }

      if (stderr) {
        log.doLog(
          stderr,
          `FileExplorerLegacyDataSource.fetchDebugReport.stderr`
        );

        return { error, stderr, data: null };
      }

      return { error: null, stderr: null, data };
    } catch (e) {
      log.error(e);

      return { error: null, stderr: null, data: null };
    }
  }
}
