import { execFile } from 'child_process';

// The disks the Mac shows in Finder, read the way Finder reads them: the
// mounted volumes that aren't hidden, each with its name, capacity and the
// space available for important use. That figure counts purgeable space
// too, so it is what Finder calls "available" (`df` leaves purgeable space
// out and reads a few GB lower on the startup disk).

const VOLUME_KEYS = {
  name: 'NSURLVolumeLocalizedNameKey',
  totalBytes: 'NSURLVolumeTotalCapacityKey',
  availableBytes: 'NSURLVolumeAvailableCapacityKey',
  importantBytes: 'NSURLVolumeAvailableCapacityForImportantUsageKey',
  isInternal: 'NSURLVolumeIsInternalKey',
  isRemovable: 'NSURLVolumeIsRemovableKey',
  isEjectable: 'NSURLVolumeIsEjectableKey',
  isRoot: 'NSURLVolumeIsRootFileSystemKey',
  isLocal: 'NSURLVolumeIsLocalKey',
};

// JavaScript for Automation, run by osascript: no Apple events, so macOS
// asks for no permission
const VOLUMES_SCRIPT = `
ObjC.import('Foundation');
const fields = ${JSON.stringify(VOLUME_KEYS)};
const keys = $(Object.values(fields).map((key) => $[key]));
const urls = $.NSFileManager.defaultManager
  .mountedVolumeURLsIncludingResourceValuesForKeysOptions(
    keys,
    $.NSVolumeEnumerationSkipHiddenVolumes
  );
const volumes = [];
for (let i = 0; i < urls.count; i += 1) {
  const url = urls.objectAtIndex(i);
  const values = url.resourceValuesForKeysError(keys, null);
  const volume = { path: url.path.js };
  Object.entries(fields).forEach(([field, key]) => {
    const value = values.objectForKey($[key]);
    volume[field] = value.isNil() ? null : ObjC.unwrap(value);
  });
  volumes.push(volume);
}
JSON.stringify(volumes);
`;

const CACHE_MS = 5000;

let cache = { at: 0, volumes: null };
let pending = null;

const kindOf = (volume) => {
  if (!volume.isLocal) {
    return 'network';
  }

  if (volume.isInternal) {
    return 'internal';
  }

  return volume.isRemovable || volume.isEjectable ? 'removable' : 'external';
};

// osascript's JSON, cleaned up: startup disk first, then the other internal
// volumes, then the rest by name
export const parseVolumes = (output) => {
  let raw;

  try {
    raw = JSON.parse(String(output || '').trim());
  } catch (e) {
    return [];
  }

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter(
      (volume) =>
        volume &&
        typeof volume.path === 'string' &&
        Number(volume.totalBytes) > 0
    )
    .map((volume) => {
      const totalBytes = Number(volume.totalBytes);
      // what Finder shows; the plain figure when the volume has no other
      const free =
        Number(volume.importantBytes) || Number(volume.availableBytes);

      return {
        path: volume.path,
        name: volume.name || volume.path.split('/').pop() || volume.path,
        totalBytes,
        freeBytes: Math.min(totalBytes, Math.max(0, free || 0)),
        isRoot: Boolean(volume.isRoot) || volume.path === '/',
        isInternal: Boolean(volume.isInternal),
        isLocal: volume.isLocal !== false,
        isRemovable: Boolean(volume.isRemovable),
        isEjectable: Boolean(volume.isEjectable),
      };
    })
    .map((volume) => ({ ...volume, kind: kindOf(volume) }))
    .sort((a, b) => {
      const rank = (volume) => {
        if (volume.isRoot) {
          return 0;
        }

        return volume.kind === 'internal' ? 1 : 2;
      };

      return (
        rank(a) - rank(b) ||
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
    });
};

// "This Mac" (the startup disk and the other internal volumes) and every
// other drive: external SSDs and hard disks, USB sticks, network volumes
export const groupVolumes = (volumes = []) => ({
  mac: volumes.filter((volume) => volume.isRoot || volume.kind === 'internal'),
  other: volumes.filter(
    (volume) => !volume.isRoot && volume.kind !== 'internal'
  ),
});

// the volume holding a folder: the longest mount point it starts with
export const volumeForPath = (volumes = [], folderPath = '/') => {
  const target = String(folderPath || '/');

  return volumes.reduce((best, volume) => {
    const mount = volume.path;
    const inside =
      mount === '/' || target === mount || target.startsWith(`${mount}/`);

    if (!inside) {
      return best;
    }

    return !best || mount.length > best.path.length ? volume : best;
  }, null);
};

export const cachedVolumes = () => cache.volumes;

// mounted volumes, read again at most every few seconds; resolves to the
// last list (or an empty one) when they can't be read
export const loadVolumes = ({ maxAgeMs = CACHE_MS } = {}) => {
  if (cache.volumes && Date.now() - cache.at < maxAgeMs) {
    return Promise.resolve(cache.volumes);
  }

  if (!pending) {
    pending = new Promise((resolve) => {
      execFile(
        '/usr/bin/osascript',
        ['-l', 'JavaScript', '-e', VOLUMES_SCRIPT],
        { encoding: 'utf8', timeout: 5000 },
        (error, stdout) => {
          const volumes = error ? [] : parseVolumes(stdout);

          if (volumes.length > 0) {
            cache = { at: Date.now(), volumes };
          }

          pending = null;
          resolve(cache.volumes || []);
        }
      );
    });
  }

  return pending;
};

// The Mac's model name ("MacBook Pro", "Mac mini"), read once
let macName = null;
let macNamePending = null;

export const cachedMacName = () => macName;

export const loadMacName = () => {
  if (macName) {
    return Promise.resolve(macName);
  }

  if (!macNamePending) {
    macNamePending = new Promise((resolve) => {
      execFile(
        '/usr/sbin/system_profiler',
        ['SPHardwareDataType', '-json'],
        { encoding: 'utf8', timeout: 10000 },
        (error, stdout) => {
          try {
            macName =
              JSON.parse(stdout).SPHardwareDataType[0].machine_name || null;
          } catch (e) {
            macName = null;
          }

          macNamePending = null;
          resolve(macName);
        }
      );
    });
  }

  return macNamePending;
};
