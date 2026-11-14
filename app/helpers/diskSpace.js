import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { cachedVolumes, loadVolumes, volumeForPath } from './volumes';

// Free and total space of the volume holding a local folder. Read like
// Finder (see volumes.js) once the volume list is in; until then `df`,
// where used space is derived as total - available because on APFS the
// "used" column only counts one volume of a shared container.

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
// app language's number format; `precise` keeps two decimals from GB up,
// like Finder's "94,65 GB available".
export const formatStorageSize = (
  bytes,
  language = 'en',
  { precise = false } = {}
) => {
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let value = Math.max(0, Number(bytes) || 0);
  let unit = 0;

  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }

  const number = new Intl.NumberFormat(language, {
    // eslint-disable-next-line no-nested-ternary
    maximumFractionDigits: unit < 3 ? 0 : precise ? 2 : 1,
  }).format(value);

  return `${number} ${units[unit]}`;
};

export function getDiskSpace(folderPath) {
  const target = folderPath || '/';
  const volumes = cachedVolumes();

  // keep the Finder figures fresh for the next render
  loadVolumes().catch(() => {});

  const volume = volumes && volumeForPath(volumes, target);

  if (volume) {
    return {
      totalBytes: volume.totalBytes,
      freeBytes: volume.freeBytes,
      mountPoint: volume.path,
      volumeName: volume.name,
    };
  }

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
