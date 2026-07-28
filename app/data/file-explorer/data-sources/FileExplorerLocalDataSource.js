import path from 'path';
import { promisify } from 'node:util';
import junk from 'junk';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import macosVersion from 'macos-version';
import {
  readdir as fsReaddir,
  stat as fsStat,
  access as fsAccess,
  constants as fsConstants,
  rename as fsRename,
  realpath as fsRealpath,
} from 'fs';
import { log } from '../../../utils/log';
import { isArray, isEmpty, undefinedOrNull } from '../../../utils/funcs';
import { pathUp } from '../../../utils/files';
import { appDateFormat } from '../../../utils/date';
import { checkIf } from '../../../utils/checkIf';
import { PATHS } from '../../../constants/paths';
import { NODE_MAC_PERMISSIONS_MIN_OS } from '../../../constants';

export class FileExplorerLocalDataSource {
  constructor() {
    this.readdir = promisify(fsReaddir);
    this.stat = promisify(fsStat);
    this.access = promisify(fsAccess);
    this.realpath = promisify(fsRealpath);
  }

  /**
   * description - make directory helper
   *
   */
  async _mkdir({ filePath }) {
    try {
      return new Promise((resolve) => {
        mkdirp(filePath)
          .then((data) => {
            resolve({ data, stderr: null, error: null });

            return data;
          })
          .catch((error) => {
            resolve({ data: null, stderr: error, error });
          });
      });
    } catch (e) {
      log.error(e);
    }
  }

  /**
   * description - Rename file helper
   *
   */
  _rename({ filePath, newFilename }) {
    try {
      const parentDir = pathUp(filePath);
      const newFilePath = path.join(parentDir, newFilename);

      return new Promise((resolve) => {
        fsRename(filePath, newFilePath, (error) => {
          return resolve({
            data: null,
            stderr: error,
            error,
          });
        });
      });
    } catch (e) {
      log.error(e);

      return {
        data: null,
        stderr: null,
        error: e,
      };
    }
  }

  /**
   * description - Delete file helper
   *
   */
  _delete = (file) => {
    try {
      return new Promise((resolve) => {
        rimraf(file, {}, (error) => {
          resolve({
            data: null,
            stderr: error,
            error,
          });
        });
      });
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  };

  /**
   * description - request the usage access of the protected directories in macos
   * @private
   *
   * @param filePath {string}
   * @return {Promise<boolean>}
   */
  _requestUsageAccess = async ({ filePath }) => {
    const doesCurrentOsSupportNodeMacPermission =
      macosVersion.isGreaterThanOrEqualTo(NODE_MAC_PERMISSIONS_MIN_OS);

    if (!doesCurrentOsSupportNodeMacPermission) {
      return true;
    }

    const { askForFoldersAccess, askForPhotosAccess } = await import(
      // eslint-disable-next-line import/no-unresolved
      'node-mac-permissions'
    );

    checkIf(filePath, 'string');

    const isGrantedString = 'authorized';

    let result;

    if (filePath.startsWith(PATHS.desktopDir)) {
      result = await askForFoldersAccess('desktop');
    } else if (filePath.startsWith(PATHS.downloadsDir)) {
      result = await askForFoldersAccess('downloads');
    } else if (filePath.startsWith(PATHS.documentsDir)) {
      result = await askForFoldersAccess('documents');
    } else if (filePath.startsWith(PATHS.picturesDir)) {
      result = await askForPhotosAccess();
    }

    if (undefinedOrNull(result)) {
      return true;
    }

    return result === isGrantedString;
  };

  /**
   * description - Fetch local files in the path
   *
   * @param filePath
   * @param ignoreHidden
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ filePath, ignoreHidden, isCancelled = () => false }) {
    try {
      if (isCancelled()) {
        return { error: null, data: null, cancelled: true };
      }

      const _accessGranted = await this._requestUsageAccess({ filePath });

      if (!_accessGranted) {
        return {
          data: null,
          error: 'Permission denied',
        };
      }

      const response = [];
      const entries = await this.readdir(filePath, {
        encoding: 'utf8',
        withFileTypes: true,
      });

      if (isCancelled()) {
        return { error: null, data: null, cancelled: true };
      }

      let files = entries.filter((entry) => junk.not(entry.name));

      if (ignoreHidden) {
        files = files.filter((entry) => !/(^|\/)\.[^/.]/g.test(entry.name));
      }

      const concurrency = 64;

      for (let offset = 0; offset < files.length; offset += concurrency) {
        if (isCancelled()) {
          return { error: null, data: null, cancelled: true };
        }

        const batch = files.slice(offset, offset + concurrency);
        // eslint-disable-next-line no-await-in-loop
        const fileInfoBatch = await Promise.all(
          batch.map(async (entry) => {
            const fullPath = path.resolve(filePath, entry.name);

            try {
              const symlink = entry.isSymbolicLink()
                ? await this.realpath(fullPath)
                : null;
              const stat = await this.stat(symlink ?? fullPath);
              const extension = path.extname(fullPath);
              const { size, atime: dateTime } = stat;

              return {
                name: entry.name,
                path: fullPath,
                extension,
                size,
                isFolder: stat.isDirectory(),
                dateAdded: appDateFormat(dateTime),
                symlink,
              };
            } catch (_) {
              return null;
            }
          })
        );

        response.push(...fileInfoBatch.filter(Boolean));
      }

      return { error: null, data: response };
    } catch (e) {
      log.error(e);

      return { error: e, data: null };
    }
  }

  /**
   * description - Rename a local file
   *
   * @param filePath
   * @param newFilename
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ filePath, newFilename }) {
    try {
      if (undefinedOrNull(filePath) || undefinedOrNull(newFilename)) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const _accessGranted = await this._requestUsageAccess({ filePath });

      if (!_accessGranted) {
        return {
          data: null,
          error: 'Permission denied',
        };
      }

      const { error } = await this._rename({ filePath, newFilename });

      if (error) {
        log.error(
          `${error}`,
          `FileExplorerLocalDataSource.renameFile -> mv error`
        );

        return { error, stderr: null, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Delete a local file
   *
   * @param fileList
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ fileList }) {
    try {
      if (!fileList || fileList.length < 1) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const parentDirectories = [
        ...new Set(fileList.map((filePath) => path.dirname(filePath))),
      ];

      for (let index = 0; index < parentDirectories.length; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        const _accessGranted = await this._requestUsageAccess({
          filePath: parentDirectories[index],
        });

        if (!_accessGranted) {
          return {
            data: null,
            error: 'Permission denied',
          };
        }
      }

      for (let i = 0; i < fileList.length; i += 1) {
        const filePath = fileList[i];

        // eslint-disable-next-line no-await-in-loop
        const { error } = await this._delete(filePath);

        if (error) {
          log.error(
            `${error}`,
            `FileExplorerLocalDataSource.deleteFiles -> rm error`
          );

          return { error, stderr: null, data: false };
        }
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Create a local directory
   *
   * @param {string} filePath
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ filePath }) {
    try {
      if (undefinedOrNull(filePath)) {
        return { error: `Invalid path.`, stderr: null, data: null };
      }

      // eslint-disable-next-line no-await-in-loop
      const _accessGranted = await this._requestUsageAccess({
        filePath,
      });

      if (!_accessGranted) {
        return {
          data: null,
          error: 'Permission denied',
        };
      }

      const { error } = await this._mkdir({ filePath });

      if (error) {
        log.error(
          `${error}`,
          `FileExplorerLocalDataSource.makeDirectory -> mkdir error`
        );

        return { error, stderr: null, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Check if files exist in the local disk
   *
   * @param {[string]} fileList
   * @return {Promise<boolean>}
   */
  async filesExist({ fileList }) {
    try {
      if (!isArray(fileList)) {
        return false;
      }

      if (isEmpty(fileList)) {
        return false;
      }

      const fullPaths = fileList.map((item) => path.resolve(item));
      const parentDirectories = [
        ...new Set(fullPaths.map((fullPath) => path.dirname(fullPath))),
      ];

      for (let index = 0; index < parentDirectories.length; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        const _accessGranted = await this._requestUsageAccess({
          filePath: parentDirectories[index],
        });

        if (!_accessGranted) {
          return {
            data: null,
            error: 'Permission denied',
          };
        }
      }

      const concurrency = 64;

      for (let offset = 0; offset < fullPaths.length; offset += concurrency) {
        const batch = fullPaths.slice(offset, offset + concurrency);
        // eslint-disable-next-line no-await-in-loop
        const existenceChecks = await Promise.all(
          batch.map(async (fullPath) => {
            try {
              await this.access(fullPath, fsConstants.F_OK);

              return true;
            } catch (_) {
              return false;
            }
          })
        );

        if (existenceChecks.some(Boolean)) {
          return true;
        }
      }

      return false;
    } catch (e) {
      log.error(e);

      return false;
    }
  }
}
