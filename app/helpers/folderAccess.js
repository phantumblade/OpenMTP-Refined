import path from 'path';
import { PATHS } from '../constants/paths';
import { startupVolumeName } from './diskSpace';

// macOS (TCC) protects a few locations and asks the user the first time an
// app reads them. macOS offers no way to read that answer without asking, so
// OpenMTP keeps its own per-folder choice and explains the request before
// macOS shows it:
//   ask     - not requested yet: explain, then let macOS ask
//   allowed - the user agreed and macOS granted access
//   denied  - macOS refused (changeable only in System Settings)
//   blocked - the user chose not to let OpenMTP use the folder

export const FOLDER_ACCESS = {
  ask: 'ask',
  allowed: 'allowed',
  denied: 'denied',
  blocked: 'blocked',
};

export const PROTECTED_FOLDERS = [
  {
    id: 'desktop',
    label: 'Desktop',
    icon: 'desktop_mac',
    root: PATHS.desktopDir,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'description',
    root: PATHS.documentsDir,
  },
  {
    id: 'downloads',
    label: 'Downloads',
    icon: 'download',
    root: PATHS.downloadsDir,
  },
  {
    id: 'volumes',
    label: 'External and removable disks',
    icon: 'hard_drive',
    root: null,
  },
];

export const SYSTEM_SETTINGS_FILES_AND_FOLDERS =
  'x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders';
export const SYSTEM_SETTINGS_FULL_DISK_ACCESS =
  'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles';

const isInside = (filePath, root) =>
  Boolean(root) && (filePath === root || filePath.startsWith(`${root}/`));

// The protected location holding [filePath], or null.
export const protectedFolderFor = (filePath, startupVolume) => {
  if (typeof filePath !== 'string' || filePath === '') {
    return null;
  }

  const normalized = path.resolve(filePath);
  const folder = PROTECTED_FOLDERS.find(({ root }) =>
    isInside(normalized, root)
  );

  if (folder) {
    return folder;
  }

  // /Volumes/<name>/… is an external, removable or network disk, except the
  // startup disk which also appears there as a link to "/"
  const volume = /^\/Volumes\/([^/]+)/.exec(normalized);

  if (volume && volume[1] !== (startupVolume ?? startupVolumeName())) {
    return PROTECTED_FOLDERS.find(({ id }) => id === 'volumes');
  }

  return null;
};

export const folderAccessStatus = (folderAccess, id) =>
  (folderAccess && folderAccess[id]) || FOLDER_ACCESS.ask;

let fullDiskAccess = { at: 0, value: false };

// Full Disk Access covers every protected folder; macOS lets apps read this
// one without prompting.
export const hasFullDiskAccess = () => {
  if (Date.now() - fullDiskAccess.at < 10000) {
    return fullDiskAccess.value;
  }

  let value = false;

  try {
    // eslint-disable-next-line global-require, import/no-unresolved
    const { getAuthStatus } = require('node-mac-permissions');

    value = getAuthStatus('full-disk-access') === 'authorized';
  } catch (e) {
    value = false;
  }

  fullDiskAccess = { at: Date.now(), value };

  return value;
};

// Whether OpenMTP may read [filePath] without asking first.
export const canReadWithoutAsking = (filePath, folderAccess) => {
  const folder = protectedFolderFor(filePath);

  return (
    !folder ||
    folderAccessStatus(folderAccess, folder.id) === FOLDER_ACCESS.allowed ||
    hasFullDiskAccess()
  );
};

// Folders the user (or macOS) closed to OpenMTP, shown with a lock.
export const isFolderLocked = (filePath, folderAccess) => {
  const folder = protectedFolderFor(filePath);

  if (!folder || hasFullDiskAccess()) {
    return false;
  }

  const status = folderAccessStatus(folderAccess, folder.id);

  return status === FOLDER_ACCESS.blocked || status === FOLDER_ACCESS.denied;
};

export const isPermissionError = (error) =>
  /EPERM|EACCES|not permitted|permission denied/i.test(
    String(error && (error.code || error.message || error))
  );
