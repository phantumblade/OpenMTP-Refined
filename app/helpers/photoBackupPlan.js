import path from 'path';

// Where the phone keeps the camera's photos and videos.
export const PHOTO_BACKUP_SOURCE = '/DCIM';

// What a backup still has to copy. [phoneFolders] is the phone's camera
// tree, one entry per folder: { dir, files: [{ name, path, size }] }.
// [localFiles(dir)] returns a Map of file name -> size for a Mac folder.
// Only files whose name the matching Mac folder doesn't have are copied, so
// nothing is copied twice and nothing on the Mac is ever overwritten: a
// same-named file of another size (an edited photo, an interrupted copy) is
// left alone and counted in [conflicts].
export const planPhotoBackup = ({
  phoneFolders,
  destinationRoot,
  localFiles,
  sourceRoot = PHOTO_BACKUP_SOURCE,
}) =>
  phoneFolders
    .map(({ dir, files }) => {
      const relative = path.posix.relative(sourceRoot, dir);
      const localDir = path.join(destinationRoot, relative);
      const existing = localFiles(localDir);
      const missing = files.filter(({ name }) => !existing.has(name));

      return {
        phoneDir: dir,
        localDir,
        files: missing.map((file) => file.path),
        conflicts: files.filter(
          ({ name, size }) => existing.has(name) && existing.get(name) !== size
        ).length,
        bytes: missing.reduce((total, { size }) => total + (size || 0), 0),
      };
    })
    .filter(({ files, conflicts }) => files.length > 0 || conflicts > 0);

export const planTotals = (plan) =>
  plan.reduce(
    (totals, { files, bytes, conflicts }) => ({
      files: totals.files + files.length,
      bytes: totals.bytes + bytes,
      conflicts: totals.conflicts + conflicts,
    }),
    { files: 0, bytes: 0, conflicts: 0 }
  );
