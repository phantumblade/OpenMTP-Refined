import {
  existsSync as _existsSync,
  writeFile as _writeFileAsync,
  appendFile as _appendFileAsync,
  readFileSync as _readFileSync,
  writeFileSync as _writeFileSync,
  renameSync as _renameSync,
  unlinkSync as _unlinkSync,
} from 'fs';
import { EOL } from 'os';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';

export const writeFileAsync = (filePath, text) => {
  const options = { mode: 0o755 };

  _writeFileAsync(filePath, text, options, (err) => {
    if (err) {
      console.error(err, `writeFileAsync`);

      return null;
    }
  });
};

export const writeFileSync = (filePath, text) => {
  const options = { mode: 0o755 };

  try {
    _writeFileSync(filePath, text, options);
  } catch (err) {
    console.error(err, `writeFileSync`);
  }
};

/**
 * Writes to a temporary sibling and renames it over the target. rename() is
 * atomic on the same filesystem, so a crash mid-write can never leave a
 * truncated/corrupted file (e.g. an unparsable settings.json).
 */
export const writeFileAtomicSync = (filePath, text) => {
  const options = { mode: 0o755 };
  const tempFilePath = `${filePath}.${process.pid}.${Date.now()}.tmp`;

  try {
    _writeFileSync(tempFilePath, text, options);
    _renameSync(tempFilePath, filePath);
  } catch (err) {
    console.error(err, `writeFileAtomicSync`);

    try {
      _unlinkSync(tempFilePath);
    } catch (_) {
      // the temp file was never created
    }
  }
};

export const appendFileAsync = (filePath, text) => {
  const options = { mode: 0o755 };

  _appendFileAsync(filePath, text + EOL, options, (err) => {
    if (err) {
      console.error(err, `appendFileAsync`);

      return null;
    }
  });
};

export const readFileSync = (filePath) => {
  const options = { encoding: 'utf8' };

  return _readFileSync(filePath, options);
};

export const fileExistsSync = (filePath) => _existsSync(filePath);

export const createDirSync = async (newFolderPath) => {
  await mkdirp.sync(newFolderPath);
};

export const deleteFilesSync = (filePath) => {
  rimraf.sync(filePath);
};
