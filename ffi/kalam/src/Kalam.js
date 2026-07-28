import koffi from 'koffi';
import { kalamLibPath } from '../../../app/helpers/binaries';
import { log } from '../../../app/utils/log';
import { undefinedOrNull } from '../../../app/utils/funcs';
import { checkIf } from '../../../app/utils/checkIf';
import { FILE_TRANSFER_DIRECTION } from '../../../app/enums';

export class Kalam {
  constructor() {
    this.libPath = kalamLibPath;
    this.lib = koffi.load(this.libPath);

    this.callbackDictionary = Object.freeze({
      onCbResult: koffi.proto('void on_cb_result_t(char*)'),
    });

    this.fnDictionary = Object.freeze({
      Initialize: 'void Initialize(on_cb_result_t* onDonePtr)',
      FetchDeviceInfo: 'void FetchDeviceInfo(on_cb_result_t* onDonePtr)',
      FetchStorages: 'void FetchStorages(on_cb_result_t* onDonePtr)',
      FileExists:
        'void FileExists(char* fileExistsInputJson, on_cb_result_t* onDonePtr)',
      DeleteFile:
        'void DeleteFile(char* deleteFileInputJson, on_cb_result_t* onDonePtr)',
      MakeDirectory:
        'void MakeDirectory(char* makeDirectoryInputJson, on_cb_result_t* onDonePtr)',
      RenameFile:
        'void RenameFile(char* renameFileInputJson, on_cb_result_t* onDonePtr)',
      Walk: 'void Walk(char* walkInputJson, on_cb_result_t* onDonePtr)',
      DownloadFiles:
        'void DownloadFiles(char* downloadFilesInputJson, on_cb_result_t* onPreprocessPtr, on_cb_result_t* onProgressPtr, on_cb_result_t* onDonePtr)',
      UploadFiles:
        'void UploadFiles(char* uploadFilesInputJson, on_cb_result_t* onPreprocessPtr, on_cb_result_t* onProgressPtr, on_cb_result_t* onDonePtr)',
      Dispose: 'void Dispose(on_cb_result_t* onDonePtr)',
    });
  }

  _getNapiError(error) {
    return {
      error,
      stderr: null,
      data: null,
    };
  }

  _getData(value) {
    return {
      error: value?.error === '' ? null : value?.error,
      stderr: value?.errorType === '' ? null : value?.errorType,
      data: value?.data,
    };
  }

  /**
   * description - Single attempt to initialize Kalam MTP
   *
   * @return {Promise<object>}
   * @private
   */
  _singleInitialize() {
    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const Initialize = this.lib.func(this.fnDictionary.Initialize);

        Initialize.async(rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.Initialize.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.Initialize.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  /**
   * description - Initialize Kalam MTP with automatic retry for transient USB errors
   *
   * @return {Promise<object>}
   * @constructor
   */
  async initialize() {
    const maxAttempts = 3;
    let attempt = 0;
    let res = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      // eslint-disable-next-line no-await-in-loop
      res = await this._singleInitialize();

      if (!res?.error && !res?.stderr) {
        return res;
      }

      const errString = String(res?.error || res?.stderr || '');
      const isTransientUsbError =
        errString.includes('LIBUSB_ERROR') ||
        errString.includes('OpenSession') ||
        errString.includes('device initialized failed') ||
        errString.includes('attempting reset') ||
        errString.includes('EOF') ||
        errString.includes('BUSY') ||
        errString.includes('ErrorDeviceSetup') ||
        errString.includes('ErrorMtpDetectFailed') ||
        errString.includes('ErrorDeviceLocked');

      if (isTransientUsbError && attempt < maxAttempts) {
        log.info(
          `Kalam initialize transient USB error (attempt ${attempt}/${maxAttempts}): ${errString}. Retrying in ${
            attempt * 400
          }ms...`
        );
        const delay = attempt * 400;

        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        break;
      }
    }

    return res;
  }

  /**
   * description - Fetch device information
   *
   * @return {Promise<object>}
   * @constructor
   */
  async fetchDeviceInfo() {
    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const FetchDeviceInfo = this.lib.func(
          this.fnDictionary.FetchDeviceInfo
        );

        FetchDeviceInfo.async(rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.FetchDeviceInfo.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.FetchDeviceInfo.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  /**
   * description - Fetch Storages
   *
   * @return {Promise<[string]>}
   * @constructor
   */
  async listStorages() {
    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const FetchStorages = this.lib.func(this.fnDictionary.FetchStorages);

        FetchStorages.async(rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.FetchStorages.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.FetchStorages.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async makeDirectory({ storageId, fullPath }) {
    checkIf(storageId, 'number');
    checkIf(fullPath, 'string');

    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const MakeDirectory = this.lib.func(this.fnDictionary.MakeDirectory);

        const _storageId = parseInt(storageId, 10);
        const args = { storageId: _storageId, fullPath };
        const json = JSON.stringify(args);

        MakeDirectory.async(json, rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.MakeDirectory.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.MakeDirectory.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async fileExist({ storageId, files }) {
    checkIf(storageId, 'number');
    checkIf(files, 'array');

    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const FileExists = this.lib.func(this.fnDictionary.FileExists);

        const _storageId = parseInt(storageId, 10);

        const args = { storageId: _storageId, files };
        const json = JSON.stringify(args);

        FileExists.async(json, rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.FileExists.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.FileExists.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async deleteFile({ storageId, files }) {
    checkIf(storageId, 'number');
    checkIf(files, 'array');

    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const DeleteFile = this.lib.func(this.fnDictionary.DeleteFile);

        const _storageId = parseInt(storageId, 10);

        const args = { storageId: _storageId, files };
        const json = JSON.stringify(args);

        DeleteFile.async(json, rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.DeleteFile.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.DeleteFile.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async renameFile({ storageId, fullPath, newFilename }) {
    checkIf(storageId, 'number');
    checkIf(fullPath, 'string');
    checkIf(newFilename, 'string');

    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const RenameFile = this.lib.func(this.fnDictionary.RenameFile);

        const _storageId = parseInt(storageId, 10);

        const args = {
          storageId: _storageId,
          fullPath,
          newFileName: newFilename,
        };
        const json = JSON.stringify(args);

        RenameFile.async(json, rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.RenameFile.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.RenameFile.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  /**
   * description - Walk files
   *
   * @return {Promise<[string]>}
   * @constructor
   */
  async walk({ storageId, fullPath, skipHiddenFiles }) {
    checkIf(storageId, 'number');
    checkIf(fullPath, 'string');
    checkIf(skipHiddenFiles, 'boolean');

    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const Walk = this.lib.func(this.fnDictionary.Walk);

        const _storageId = parseInt(storageId, 10);

        const args = {
          storageId: _storageId,
          fullPath,
          recursive: false,
          skipDisallowedFiles: false,
          skipHiddenFiles,
        };
        const json = JSON.stringify(args);

        Walk.async(json, rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.Walk.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.Walk.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }

  async transferFiles({
    direction,
    storageId,
    sources,
    destination,
    preprocessFiles,
    onError,
    onPreprocess,
    onProgress,
    onCompleted,
  }) {
    checkIf(direction, 'string');
    checkIf(storageId, 'number');
    checkIf(sources, 'array');
    checkIf(destination, 'string');
    checkIf(preprocessFiles, 'boolean');
    checkIf(onError, 'function');
    checkIf(onPreprocess, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    return new Promise((resolve) => {
      let settled = false;

      const failTransfer = ({ error, stderr = null, data = null }) => {
        if (settled) {
          return;
        }

        settled = true;
        onError({ error, stderr, data });
        resolve({ error, stderr, data });
      };

      try {
        const onFfiPreprocessPtr = this.callbackDictionary.onCbResult;
        const rawOnFfiPreprocessPtr = koffi.register((result) => {
          const json = JSON.parse(result);
          const { error, data, stderr } = this._getData(json);

          if (!undefinedOrNull(error) || !undefinedOrNull(stderr)) {
            return failTransfer({ error, data: null, stderr });
          }

          if (!settled && onPreprocess && data) {
            const { fullPath, size, name } = data;

            onPreprocess({ fullPath, size, name });
          }
        }, koffi.pointer(onFfiPreprocessPtr));

        let lastProgressTime = 0;
        const onFfiProgressPtr = this.callbackDictionary.onCbResult;
        const rawOnFfiProgressPtr = koffi.register((result) => {
          const json = JSON.parse(result);
          const { error, data, stderr } = this._getData(json);

          if (!undefinedOrNull(error) || !undefinedOrNull(stderr)) {
            return failTransfer({ error, data: null, stderr });
          }

          if (!settled && onProgress && data) {
            const now = Date.now();
            const isCompleted =
              data?.bulkFileSize?.progress === 100 ||
              data?.activeFileSize?.progress === 100;

            if (now - lastProgressTime >= 100 || isCompleted) {
              lastProgressTime = now;
              onProgress({ ...data });
            }
          }
        }, koffi.pointer(onFfiProgressPtr));

        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);
          const response = this._getData(json);

          if (response.error || response.stderr) {
            return failTransfer(response);
          }

          if (!settled) {
            settled = true;
            onCompleted();
            resolve(response);
          }
        }, koffi.pointer(onDonePtr));

        let TransferFiles;

        switch (direction) {
          case FILE_TRANSFER_DIRECTION.download:
            TransferFiles = this.lib.func(this.fnDictionary.DownloadFiles);

            break;
          case FILE_TRANSFER_DIRECTION.upload:
            TransferFiles = this.lib.func(this.fnDictionary.UploadFiles);

            break;

          default:
            return resolve(
              this._getNapiError(
                `unsupported 'direction' in Kalam.transferFiles`
              )
            );
        }

        const _storageId = parseInt(storageId, 10);

        const args = {
          storageId: _storageId,
          sources,
          destination,
          preprocessFiles,
        };
        const json = JSON.stringify(args);

        TransferFiles.async(
          json,
          rawOnFfiPreprocessPtr,
          rawOnFfiProgressPtr,
          rawOnDonePtr,
          (err, _) => {
            koffi.unregister(rawOnFfiPreprocessPtr);
            koffi.unregister(rawOnFfiProgressPtr);
            koffi.unregister(rawOnDonePtr);

            if (!undefinedOrNull(err)) {
              log.error(
                err,
                `Kalam.transferFiles.async - Transfer type: ${direction}`
              );

              return failTransfer(this._getNapiError(err));
            }
          }
        );
      } catch (err) {
        log.error(
          err,
          `Kalam.transferFiles.catch - Transfer type: ${direction}`
        );

        return failTransfer(this._getNapiError(err));
      }
    });
  }

  async dispose() {
    return new Promise((resolve) => {
      try {
        const onDonePtr = this.callbackDictionary.onCbResult;
        const rawOnDonePtr = koffi.register((result) => {
          const json = JSON.parse(result);

          return resolve(this._getData(json));
        }, koffi.pointer(onDonePtr));

        const Dispose = this.lib.func(this.fnDictionary.Dispose);

        Dispose.async(rawOnDonePtr, (err, _) => {
          koffi.unregister(rawOnDonePtr);

          if (!undefinedOrNull(err)) {
            log.error(err, 'Kalam.Dispose.async');

            return resolve(this._getNapiError(err));
          }
        });
      } catch (err) {
        log.error(err, 'Kalam.Dispose.catch');

        return resolve(this._getNapiError(err));
      }
    });
  }
}
