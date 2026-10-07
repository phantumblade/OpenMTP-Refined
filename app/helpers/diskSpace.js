import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Free and total space of the volume holding a local folder, for the side
// menu. On APFS the "used" column only counts one volume of a shared
// container, so used space is derived as total - available, like Finder.

const CACHE_MS = 15000;
const cache = new Map();

// `df -k` line: filesystem, 1K-blocks, used, available, capacity, iused,
// ifree, %iused, mount point (which may contain spaces)
const DF_LINE = /^\S+\s+(\d+)\s+\d+\s+(\d+)\s+\d+%\s+\d+\s+\d+\s+\d+%\s+(.+)$/;

export const parseDfOutput = (output) => {
  const line = String(output || '')
    .trim()
    .split('\n')
    .pop();
  const match = DF_LINE.exec(line || '');

  if (!match) {
    return null;
  }

  return {
    totalBytes: Number(match[1]) * 1024,
    freeBytes: Number(match[2]) * 1024,
    mountPoint: match[3],
  };
};

// The startup volume shows up in /Volumes as a link to "/"
export const startupVolumeName = () => {
  try {
    const entry = fs.readdirSync('/Volumes').find((name) => {
      try {
        return fs.readlinkSync(path.join('/Volumes', name)) === '/';
      } catch (e) {
        return false;
      }
    });

    return entry || 'Macintosh HD';
  } catch (e) {
    return 'Macintosh HD';
  }
};

// "/" and the system's own volumes (e.g. /System/Volumes/Data, where /Users
// lives) all belong to the startup disk, which Finder shows by its name
export const volumeNameFor = (mountPoint) =>
  mountPoint === '/' || mountPoint.startsWith('/System/Volumes/')
    ? startupVolumeName()
    : path.basename(mountPoint);

// Sizes as Finder shows them: decimal units (1 GB = 1000^3 bytes) in the
// app language's number format.
export const formatStorageSize = (bytes, language = 'en') => {
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let value = Math.max(0, Number(bytes) || 0);
  let unit = 0;

  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }

  const number = new Intl.NumberFormat(language, {
    maximumFractionDigits: unit < 3 ? 0 : 1,
  }).format(value);

  return `${number} ${units[unit]}`;
};

export function getDiskSpace(folderPath) {
  const target = folderPath || '/';
  const cached = cache.get(target);

  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }

  let value = null;

  try {
    const parsed = parseDfOutput(
      execFileSync('/bin/df', ['-k', target], {
        encoding: 'utf8',
        timeout: 2000,
      })
    );

    if (parsed && parsed.totalBytes > 0) {
      value = { ...parsed, volumeName: volumeNameFor(parsed.mountPoint) };
    }
  } catch (e) {
    value = null;
  }

  cache.set(target, { at: Date.now(), value });

  return value;
}
